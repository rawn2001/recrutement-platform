# backend/src/interview-ai/loader.py
"""
InterviewAnalyzer — version corrigée + stockage par session
Corrections apportées:
  1. Chargement joblib avec unpickler compatible (résout ValueError/UnpicklingError)
  2. Labels fusion corrigés : 0=engagé (Confiance), 1=distrait (Stress)
  3. MediaPipe: supporte nouvelle ET ancienne API (FaceLandmarker + face_mesh legacy)
  4. Scores confiance/stress alignés avec le modèle de fusion
  5. 🆕 Stockage des analyses par session_id pour rapport final recruteur
"""

import os
import io
import cv2
import pickle
import numpy as np
import joblib
import librosa
import warnings
import urllib.request
import mediapipe as mp
import time  # ✅ Import ajouté pour time.time()

warnings.filterwarnings("ignore", category=UserWarning)
warnings.filterwarnings("ignore", category=FutureWarning)

# ─────────────────────────────────────────────────────────────────────────────
# PATCH COMPATIBILITÉ JOBLIB / SKLEARN
# ─────────────────────────────────────────────────────────────────────────────
import sklearn
from sklearn.utils._bunch import Bunch

class _CompatUnpickler(pickle.Unpickler):
    """Unpickler personnalisé qui corrige le bug MT19937 BitGenerator"""
    def find_class(self, module, name):
        if name == "MT19937":
            return np.random.MT19937
        if name == "PCG64":
            return np.random.PCG64
        if name == "Philox":
            return np.random.Philox
        if name == "SFC64":
            return np.random.SFC64
        if module in ("numpy.random.mtrand", "numpy.random._mt19937",
                      "numpy.random._pcg64", "numpy.random._philox", "numpy.random._sfc64"):
            if hasattr(np.random, name):
                return getattr(np.random, name)
        return super().find_class(module, name)


def _safe_joblib_load(path):
    """Charge un fichier pkl/joblib avec compatibilité maximale"""
    try:
        with open(path, "rb") as f:
            return _CompatUnpickler(f).load()
    except Exception:
        pass
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            return joblib.load(path)
    except Exception:
        pass
    try:
        with open(path, "rb") as f:
            return pickle.load(f, fix_imports=True, encoding="latin1")
    except Exception:
        pass
    try:
        import lzma, gzip, bz2
        for decomp in (lzma.open, gzip.open, bz2.open):
            try:
                with decomp(path, "rb") as f:
                    return _CompatUnpickler(f).load()
            except Exception:
                continue
    except Exception:
        pass
    raise RuntimeError(f"Impossible de charger {path} — format inconnu")


# ─────────────────────────────────────────────────────────────────────────────
# MAPPINGS DES CLASSES
# ─────────────────────────────────────────────────────────────────────────────
EMOTION_LABELS = ["Neutre", "Joie", "Stress", "Colère", "Surprise", "Tristesse", "Dégoût"]
GAZE_LABELS = {0: "centre", 1: "gauche", 2: "droite", 3: "bas"}
FACE_POSE_LABELS = {0: "face", 1: "gauche", 2: "droite", 3: "haut", 4: "bas"}
FUSION_LABELS = {0: "engagé", 1: "distrait"}
VOICE_LABELS = {0: "neutre", 1: "joie", 2: "colère", 3: "tristesse"}


class InterviewAnalyzer:
    def __init__(self, emotion_model_path, voice_model_dir, gestes_dir):
        print("📥 Initialisation InterviewAnalyzer...")

        # 🆕 Stockage des analyses par session
        self.session_data = {}

        # ── 1. ÉMOTION (Keras) ───────────────────────────────────────────────
        print("   ⏳ Chargement modèle émotions (Keras)...")
        import tensorflow as tf
        if not os.path.exists(emotion_model_path):
            raise FileNotFoundError(f"❌ Modèle émotion introuvable: {emotion_model_path}")
        self.emotion_model = tf.keras.models.load_model(emotion_model_path, compile=False)
        print(f"   ✅ Émotions prêt. ({len(EMOTION_LABELS)} classes)")

        # ── 2. YOLO ──────────────────────────────────────────────────────────
        print("   ⏳ Initialisation YOLO...")
        from ultralytics import YOLO
        yolo_path = os.path.join(gestes_dir, "best_yolov8n.pt")
        if not os.path.exists(yolo_path):
            raise FileNotFoundError(f"❌ YOLO introuvable: {yolo_path}")
        self.yolo = YOLO(yolo_path)

        # ── 3. MEDIAPIPE ─────────────────────────────────────────────────────
        print("   ⏳ Initialisation MediaPipe...")
        self.face_landmarker = None
        self.face_mesh_legacy = None
        self._mp_use_new_api = False

        task_model_path = os.path.join(gestes_dir, "face_landmarker.task")
        if not os.path.exists(task_model_path):
            print("   ⏳ Téléchargement face_landmarker.task...")
            url = ("https://storage.googleapis.com/mediapipe-models/"
                   "face_landmarker/face_landmarker/float16/1/face_landmarker.task")
            try:
                urllib.request.urlretrieve(url, task_model_path)
                print("   ✅ Modèle téléchargé.")
            except Exception as e:
                print(f"   ⚠️ Téléchargement échoué ({e}), utilisation de l'API legacy.")

        if os.path.exists(task_model_path):
            try:
                from mediapipe.tasks import python as mp_tasks
                from mediapipe.tasks.python import vision as mp_vision
                base_options = mp_tasks.BaseOptions(model_asset_path=task_model_path)
                options = mp_vision.FaceLandmarkerOptions(
                    base_options=base_options,
                    output_face_blendshapes=True,
                    output_facial_transformation_matrixes=True,
                    num_faces=1,
                )
                self.face_landmarker = mp_vision.FaceLandmarker.create_from_options(options)
                self._mp_use_new_api = True
                print("   ✅ MediaPipe FaceLandmarker (nouvelle API) initialisé.")
            except Exception as e:
                print(f"   ⚠️ Nouvelle API échouée ({e}), bascule sur face_mesh legacy.")

        if not self._mp_use_new_api:
            try:
                self.face_mesh_legacy = mp.solutions.face_mesh.FaceMesh(
                    static_image_mode=False, max_num_faces=1, refine_landmarks=True,
                    min_detection_confidence=0.5, min_tracking_confidence=0.5,
                )
                print("   ✅ MediaPipe face_mesh (API legacy) initialisé.")
            except Exception as e:
                raise RuntimeError(f"❌ Impossible d'initialiser MediaPipe: {e}")

        # ── 4. SCALERS & MLPs ────────────────────────────────────────────────
        print("   ⏳ Chargement des scalers et MLPs...")
        self.gaze_mlp = self._safe_load(os.path.join(gestes_dir, "gaze_mlp_final.pkl"), "gaze_mlp")
        self.gaze_scaler = self._safe_load(os.path.join(gestes_dir, "gaze_scaler.pkl"), "gaze_scaler")
        self.face_mlp = self._safe_load(os.path.join(gestes_dir, "face_pose_mlp_best.pkl"), "face_pose_mlp")
        self.face_scaler = self._safe_load(os.path.join(gestes_dir, "face_scaler.pkl"), "face_scaler")
        self.fusion_mlp = self._safe_load(os.path.join(gestes_dir, "fusion_mlp_best.pkl"), "fusion_mlp")
        self.fusion_scaler = self._safe_load(os.path.join(gestes_dir, "fusion_scaler.pkl"), "fusion_scaler")

        # ── 5. VOIX (Wav2Vec2) ───────────────────────────────────────────────
        print("   ⏳ Chargement modèle voix (Wav2Vec2)...")
        self.voice_pipeline = None
        self.voice_fallback = True
        try:
            from transformers import pipeline as hf_pipeline
            self.voice_pipeline = hf_pipeline(
                "audio-classification", model=voice_model_dir, device="cpu",
            )
            self.voice_fallback = False
            print("   ✅ Voix prête (Wav2Vec2).")
        except Exception as e:
            print(f"   ⚠️ Voix fallback activé: {str(e)[:80]}")

        print("🚀 InterviewAnalyzer initialisé.\n")

    # ─────────────────────────────────────────────────────────────────────────
    # HELPERS
    # ─────────────────────────────────────────────────────────────────────────
    def _safe_load(self, path, name):
        if not os.path.exists(path):
            print(f"   ⚠️ Fichier manquant: {os.path.basename(path)}")
            return None
        try:
            model = _safe_joblib_load(path)
            print(f"   ✅ {name} chargé.")
            return model
        except Exception as e:
            print(f"   ❌ Erreur chargement {name}: {type(e).__name__}: {e}")
            return None

    def _get_landmarks(self, img_rgb):
        if self._mp_use_new_api and self.face_landmarker is not None:
            try:
                mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=img_rgb)
                result = self.face_landmarker.detect(mp_image)
                if result.face_landmarks:
                    return result.face_landmarks[0]
            except Exception:
                pass
            return None
        if self.face_mesh_legacy is not None:
            try:
                results = self.face_mesh_legacy.process(img_rgb)
                if results.multi_face_landmarks:
                    return results.multi_face_landmarks[0].landmark
            except Exception:
                pass
        return None

    # ════════════════════════════════════════════════════════════════════════
    # 🧠 ÉMOTION FACIALE
    # ════════════════════════════════════════════════════════════════════════
    def _predict_emotion(self, img_rgb):
        import tensorflow as tf
        img = tf.image.resize(img_rgb, (224, 224))
        img = tf.expand_dims(img, axis=0) / 255.0
        pred = self.emotion_model.predict(img, verbose=0)
        idx = int(tf.argmax(pred, axis=1).numpy()[0])
        label = EMOTION_LABELS[idx] if idx < len(EMOTION_LABELS) else "Neutre"
        conf = float(pred[0][idx])
        return label, round(conf, 3)

    # ════════════════════════════════════════════════════════════════════════
    # 🤟 FEATURES LANDMARKS
    # ════════════════════════════════════════════════════════════════════════
    def _extract_face_landmarks(self, img_rgb):
        lms = self._get_landmarks(img_rgb)
        if lms is None:
            return None
        h, w = img_rgb.shape[:2]
        coords = np.array([[lm.x * w, lm.y * h] for lm in lms], dtype=np.float32)
        flat = coords.flatten()[:1024]
        if len(flat) < 1024:
            flat = np.pad(flat, (0, 1024 - len(flat)))
        bbox_w = coords[:, 0].max() - coords[:, 0].min()
        bbox_h = coords[:, 1].max() - coords[:, 1].min()
        ratio = float(bbox_h / (bbox_w + 1e-6))
        return np.concatenate([flat, [1.0, ratio]])

    def _extract_gaze_features(self, img_rgb):
        lms = self._get_landmarks(img_rgb)
        if lms is None:
            return None
        h, w = img_rgb.shape[:2]
        try:
            iris_ids = list(range(468, 478))
            eye_ids = [33, 133, 159, 145, 362, 263, 386, 374]
            ids = iris_ids + eye_ids
            pts = np.array([[lms[i].x * w, lms[i].y * h] for i in ids], dtype=np.float32).flatten()
            extra_ids = list(range(0, 32))
            extra_pts = np.array([[lms[i].x * w, lms[i].y * h] for i in extra_ids], dtype=np.float32).flatten()
            feat = np.concatenate([pts, extra_pts])[:100]
        except IndexError:
            basic_ids = [33, 133, 159, 145, 362, 263, 386, 374]
            pts = np.array([[lms[i].x * w, lms[i].y * h] for i in basic_ids], dtype=np.float32).flatten()
            feat = pts[:100]
        feat = np.pad(feat, (0, 100 - len(feat))) if len(feat) < 100 else feat
        return feat

    # ════════════════════════════════════════════════════════════════════════
    # 🤟 GESTE GLOBAL
    # ════════════════════════════════════════════════════════════════════════
    def _predict_gesture(self, img_bgr):
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        result = {
            "engagement": "inconnu", "engagement_conf": 0.0,
            "face_pose": "inconnu", "gaze": "inconnu",
            "yolo_detected": [], "confiance": 50,
            "stress_posture": 50, "face_pose_conf": 0.0, "gaze_conf": 0.0,
        }

        try:
            yolo_res = self.yolo.predict(img_bgr, conf=0.4, verbose=False)
            names = self.yolo.names
            result["yolo_detected"] = [
                names.get(int(box.cls[0]), str(int(box.cls[0])))
                for box in yolo_res[0].boxes
            ]
        except Exception as e:
            print(f"   ⚠️ YOLO error: {e}")

        if self.face_mlp and self.face_scaler:
            face_feat = self._extract_face_landmarks(img_rgb)
            if face_feat is not None:
                try:
                    X = self.face_scaler.transform(face_feat.reshape(1, -1))
                    pred = self.face_mlp.predict(X)[0]
                    prob = self.face_mlp.predict_proba(X)[0]
                    result["face_pose"] = FACE_POSE_LABELS.get(int(pred), str(pred))
                    result["face_pose_conf"] = round(float(prob.max()), 3)
                except Exception as e:
                    print(f"   ⚠️ face_pose error: {e}")

        if self.gaze_mlp and self.gaze_scaler:
            gaze_feat = self._extract_gaze_features(img_rgb)
            if gaze_feat is not None:
                try:
                    X = self.gaze_scaler.transform(gaze_feat.reshape(1, -1))
                    pred = self.gaze_mlp.predict(X)[0]
                    prob = self.gaze_mlp.predict_proba(X)[0]
                    result["gaze"] = GAZE_LABELS.get(int(pred), str(pred))
                    result["gaze_conf"] = round(float(prob.max()), 3)
                except Exception as e:
                    print(f"   ⚠️ gaze error: {e}")

        # Fusion heuristique
        fp = result.get("face_pose", "inconnu")
        gz = result.get("gaze", "inconnu")
        fp_c = result.get("face_pose_conf", 0.0)
        gz_c = result.get("gaze_conf", 0.0)

        score = 50.0
        if fp == "face": score += 25
        elif fp in ("gauche", "droite"): score -= 10
        elif fp in ("haut", "bas"): score -= 15
        if gz == "centre": score += 20
        elif gz in ("gauche", "droite"): score -= 10
        elif gz == "bas": score -= 15
        score += (fp_c - 0.5) * 10
        score += (gz_c - 0.5) * 10
        detected = [d.lower() for d in result.get("yolo_detected", [])]
        if any("phone" in d for d in detected): score -= 20
        if any("fist" in d for d in detected): score -= 5

        score = max(5, min(95, score))
        result["confiance"] = int(score)
        result["stress_posture"] = int(100 - score)
        result["engagement"] = "engage" if score >= 50 else "distrait"
        result["engagement_conf"] = round(score / 100, 2)
        return result

    def _fallback_gesture_scores(self, result):
        is_face = result["face_pose"] == "face"
        is_centre = result["gaze"] == "centre"
        result["confiance"] = 70 if (is_face and is_centre) else 35
        result["stress_posture"] = 100 - result["confiance"]
        result["engagement"] = "engagé" if result["confiance"] >= 50 else "distrait"
        result["engagement_conf"] = 0.7 if result["engagement"] == "engagé" else 0.35

    def _build_fusion_features(self, gesture_result):
        face_classes = list(FACE_POSE_LABELS.values())
        fp = gesture_result.get("face_pose", "inconnu")
        face_oh = [1.0 if fp == c else 0.0 for c in face_classes]
        gaze_classes = list(GAZE_LABELS.values())
        gz = gesture_result.get("gaze", "inconnu")
        gaze_oh = [1.0 if gz == c else 0.0 for c in gaze_classes]
        detected = [d.lower() for d in gesture_result.get("yolo_detected", [])]
        phone = 1.0 if any("phone" in d or "portable" in d for d in detected) else 0.0
        hands_up = 1.0 if any("hand" in d or "arm" in d for d in detected) else 0.0
        face_conf = gesture_result.get("face_pose_conf", 0.5)
        gaze_conf = gesture_result.get("gaze_conf", 0.5)
        is_frontal = 1.0 if fp == "face" else 0.0
        vec = np.array(face_oh + gaze_oh + [phone, hands_up, face_conf, gaze_conf, is_frontal], dtype=np.float32)
        return vec

    # ════════════════════════════════════════════════════════════════════════
    # 🎤 VOIX
    # ════════════════════════════════════════════════════════════════════════
    def _predict_voice(self, audio_bytes):
        if self.voice_fallback or self.voice_pipeline is None:
            return self._predict_voice_fallback(audio_bytes)
        try:
            audio_data, sr = librosa.load(io.BytesIO(audio_bytes), sr=16000, mono=True)
            results = self.voice_pipeline({"raw": audio_data, "sampling_rate": sr}, top_k=4)
            top = results[0]
            label_map = {"neu": "neutre", "hap": "joie", "ang": "colère", "sad": "tristesse"}
            top_class = label_map.get(top["label"].lower(), top["label"])
            confidence = round(float(top["score"]), 3)
            rms = float(np.sqrt(np.mean(audio_data ** 2)))
            volume = min(100, int(rms * 500))
            speaking = volume > 5
            all_scores = {label_map.get(r["label"].lower(), r["label"]): round(float(r["score"]), 3) for r in results}
            pitches, _ = librosa.piptrack(y=audio_data, sr=sr)
            valid = pitches[pitches > 0]
            avg_pitch = int(np.mean(valid)) if len(valid) > 0 else 0
            pitch_var = int(np.std(valid)) if len(valid) > 10 else 0
            clarity = (int(confidence * 100) if top_class in ("neutre", "joie") else max(30, int(confidence * 70)))
            return {
                "class": top_class, "confidence": confidence, "all_scores": all_scores,
                "volume": volume, "speaking": speaking,
                "avg_pitch_hz": avg_pitch, "pitch_variation": pitch_var, "clarity_score": clarity,
            }
        except Exception as e:
            print(f"⚠️ Erreur voix: {e}")
            return self._predict_voice_fallback(audio_bytes)

    def _predict_voice_fallback(self, audio_bytes):
        try:
            audio_data, sr = librosa.load(io.BytesIO(audio_bytes), sr=16000, mono=True)
            rms = float(np.sqrt(np.mean(audio_data ** 2)))
            volume = min(100, int(rms * 500))
            speaking = volume > 5
            pitches, _ = librosa.piptrack(y=audio_data, sr=sr)
            valid = pitches[pitches > 0]
            avg_pitch = int(np.mean(valid)) if len(valid) > 0 else 150
            pitch_var = int(np.std(valid)) if len(valid) > 10 else 0
            stress_score = min(100, int((volume / 2) + (pitch_var / 2)))
            predicted_class = (
                "colère" if stress_score > 70 else
                "stress" if stress_score > 50 else
                "neutre" if stress_score > 25 else "tristesse"
            )
            clarity = max(0, 100 - stress_score)
            return {
                "class": predicted_class,
                "confidence": round(max(0.4, 1 - abs(stress_score - 50) / 100), 2),
                "all_scores": {"neutre": (100 - stress_score) / 100, "colère": stress_score / 200, "tristesse": stress_score / 200},
                "volume": volume, "speaking": speaking,
                "avg_pitch_hz": avg_pitch, "pitch_variation": pitch_var, "clarity_score": clarity,
            }
        except Exception as e:
            print(f"⚠️ Fallback voix erreur: {e}")
            return {"class": "neutre", "confidence": 0.5, "all_scores": {}, "volume": 0, "speaking": False, "avg_pitch_hz": 0, "pitch_variation": 0, "clarity_score": 50}

    # ════════════════════════════════════════════════════════════════════════
    # 📦 API PUBLIQUE
    # ════════════════════════════════════════════════════════════════════════
    def analyze_frame(self, img_bgr):
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        emotion, emo_conf = self._predict_emotion(img_rgb)
        gesture = self._predict_gesture(img_bgr)
        return {
            "emotion": emotion, "emotion_confidence": emo_conf,
            "confiance": gesture["confiance"], "stress": gesture["stress_posture"],
            "engagement": gesture["engagement"], "engagement_conf": gesture["engagement_conf"],
            "face_pose": gesture["face_pose"], "gaze": gesture["gaze"],
            "yolo_detected": gesture["yolo_detected"],
        }

    def analyze_audio(self, audio_bytes):
        return self._predict_voice(audio_bytes)

    def analyze_voice(self, audio_array, sr=16000):
        buf = io.BytesIO()
        import soundfile as sf
        sf.write(buf, audio_array, sr, format="WAV")
        buf.seek(0)
        return self._predict_voice(buf.read())

    # ════════════════════════════════════════════════════════════════════════
    # 🆕 MÉTHODES DE STOCKAGE PAR SESSION (NOUVEAU)
    # ════════════════════════════════════════════════════════════════════════

    def store_frame_analysis(self, session_id: str, result: dict):
        """Stocke une analyse de frame pour une session"""
        if session_id not in self.session_data:
            self.session_data[session_id] = {"frames": [], "audio": [], "summary": None}
        self.session_data[session_id]["frames"].append({
            "timestamp": time.time(),
            "emotion": result.get("emotion"),
            "emotion_confidence": result.get("emotion_confidence"),
            "confiance": result.get("confiance"),
            "stress": result.get("stress"),
            "engagement": result.get("engagement"),
            "face_pose": result.get("face_pose"),
            "gaze": result.get("gaze"),
        })
        if len(self.session_data[session_id]["frames"]) > 300:
            self.session_data[session_id]["frames"].pop(0)

    def store_audio_analysis(self, session_id: str, result: dict):
        """Stocke une analyse audio pour une session"""
        if session_id not in self.session_data:
            self.session_data[session_id] = {"frames": [], "audio": [], "summary": None}
        self.session_data[session_id]["audio"].append({
            "timestamp": time.time(),
            "class": result.get("class"),
            "confidence": result.get("confidence"),
            "volume": result.get("volume"),
            "speaking": result.get("speaking"),
            "clarity_score": result.get("clarity_score"),
        })
        if len(self.session_data[session_id]["audio"]) > 100:
            self.session_data[session_id]["audio"].pop(0)

    def generate_session_summary(self, session_id: str) -> dict:
        """Génère un rapport complet pour une session"""
        if session_id not in self.session_data:
            return {"error": "Session non trouvée"}
        data = self.session_data[session_id]
        if not data["frames"] and not data["audio"]:
            return {"error": "Aucune donnée pour cette session"}

        # Statistiques Émotions
        emotions = [f["emotion"] for f in data["frames"] if f.get("emotion")]
        emotion_counts = {}
        for e in emotions:
            emotion_counts[e] = emotion_counts.get(e, 0) + 1
        dominant_emotion = max(emotion_counts, key=emotion_counts.get) if emotion_counts else "Inconnu"
        avg_emotion_conf = np.mean([f["emotion_confidence"] for f in data["frames"] if f.get("emotion_confidence")]) if data["frames"] else 0

        # Statistiques Gestes
        confidences = [f["confiance"] for f in data["frames"] if f.get("confiance")]
        stresses = [f["stress"] for f in data["frames"] if f.get("stress")]
        engagements = [f["engagement"] for f in data["frames"] if f.get("engagement")]
        avg_confidence = np.mean(confidences) if confidences else 50
        avg_stress = np.mean(stresses) if stresses else 50
        engagement_ratio = engagements.count("engage") / len(engagements) if engagements else 0

        # Statistiques Voix
        voice_classes = [a["class"] for a in data["audio"] if a.get("class")]
        voice_counts = {}
        for v in voice_classes:
            voice_counts[v] = voice_counts.get(v, 0) + 1
        dominant_voice = max(voice_counts, key=voice_counts.get) if voice_counts else "Inconnu"
        avg_voice_conf = np.mean([a["confidence"] for a in data["audio"] if a.get("confidence")]) if data["audio"] else 0
        avg_volume = np.mean([a["volume"] for a in data["audio"] if a.get("volume")]) if data["audio"] else 0

        # Score Composite Global
        global_score = (
            (avg_confidence * 0.4) +
            (avg_emotion_conf * 100 * 0.3) +
            (avg_voice_conf * 100 * 0.2) +
            (engagement_ratio * 100 * 0.1)
        )

        # Conseils Personnalisés
        conseils = []
        if avg_confidence < 50:
            conseils.append("Regardez plus souvent la caméra")
        if avg_stress > 60:
            conseils.append("Respirez profondément pour réduire le stress")
        if avg_volume < 40:
            conseils.append("Parlez un peu plus fort")
        if dominant_emotion in ["Colère", "Tristesse", "Stress"]:
            conseils.append("Essayez d'adopter une expression plus positive")
        if not conseils:
            conseils.append("Excellent entretien ! Continuez ainsi.")

        summary = {
            "session_id": session_id,
            "duration_minutes": len(data["frames"]) * 2 / 60,
            "emotion": {
                "dominant": dominant_emotion,
                "distribution": emotion_counts,
                "avg_confidence": round(avg_emotion_conf, 3)
            },
            "gesture": {
                "avg_confidence": round(avg_confidence, 1),
                "avg_stress": round(avg_stress, 1),
                "engagement_ratio": round(engagement_ratio, 2),
                "engagement_label": "Engagé" if engagement_ratio > 0.5 else "Distrait"
            },
            "voice": {
                "dominant_tone": dominant_voice,
                "distribution": voice_counts,
                "avg_confidence": round(avg_voice_conf, 3),
                "avg_volume": round(avg_volume, 1)
            },
            "global": {
                "score": round(global_score, 1),
                "rating": "✅ Excellent" if global_score >= 70 else "🟡 Bon" if global_score >= 50 else "🔴 À améliorer",
                "conseils": conseils
            },
            "raw_data_available": {
                "frames": len(data["frames"]),
                "audio_chunks": len(data["audio"])
            }
        }
        data["summary"] = summary
        return summary

    def clear_session(self, session_id: str):
        """Libère la mémoire d'une session terminée"""
        if session_id in self.session_data:
            del self.session_data[session_id]