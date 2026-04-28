import cv2
import numpy as np
import mediapipe as mp
from ultralytics import YOLO
from collections import deque
import os

class GesturePredictor:
    def __init__(self, model_dir="./models"):
        self.model_dir = model_dir
        self._init_media_pipe()
        self._init_yolo()
        self.conf_window = deque(maxlen=10)

    def _init_media_pipe(self):
        try:
            from mediapipe.tasks import python
            from mediapipe.tasks.python import vision
            task_path = os.path.join(self.model_dir, "gestes", "face_landmarker.task")
            if os.path.exists(task_path):
                base_opts = python.BaseOptions(model_asset_path=task_path)
                opts = vision.FaceLandmarkerOptions(base_options=base_opts, num_faces=1)
                self.mp_face = vision.FaceLandmarker.create_from_options(opts)
                self._new_api = True
            else:
                raise FileNotFoundError("face_landmarker.task manquant")
        except:
            self.mp_face = mp.solutions.face_mesh.FaceMesh(
                static_image_mode=False, max_num_faces=1, refine_landmarks=True,
                min_detection_confidence=0.3, min_tracking_confidence=0.3
            )
            self._new_api = False

    def _init_yolo(self):
        yolo_path = os.path.join(self.model_dir, "gestes", "best_yolov8n.pt")
        self.hand_yolo = YOLO(yolo_path, verbose=False) if os.path.exists(yolo_path) else None

    def _get_landmarks(self, frame):
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        if self._new_api:
            mp_img = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
            res = self.mp_face.detect(mp_img)
            return res.face_landmarks[0] if res.face_landmarks else None
        else:
            res = self.mp_face.process(rgb)
            return res.multi_face_landmarks[0].landmark if res.multi_face_landmarks else None

    def _calculate_confidence(self, lm, frame):
        if not lm or len(lm) < 20:
            return 40.0
        try:
            score = 50.0
            face_w = abs(lm[234].x - lm[454].x)
            face_h = abs(lm[10].y - lm[152].y)
            ratio = face_h / (face_w + 1e-6)
            if 0.9 < ratio < 1.3:
                score += 15
            else:
                score -= 10
            l_eye_x = lm[33].x
            r_eye_x = lm[263].x
            eye_center_x = (l_eye_x + r_eye_x) / 2
            if 0.4 < eye_center_x < 0.6:
                score += 20
            else:
                score -= 5
            if self.hand_yolo:
                results = self.hand_yolo(frame, verbose=False)
                if len(results[0].boxes) > 0:
                    for box in results[0].boxes:
                        cls_id = int(box.cls[0])
                        conf = float(box.conf[0])
                        if cls_id in [0, 1] and conf > 0.5:
                            score += 15
                            break
            return max(0, min(100, score))
        except Exception as e:
            print(f"Erreur calcul: {e}")
            return 40.0

    def predict(self, frame):
        lm = self._get_landmarks(frame)
        raw_conf = self._calculate_confidence(lm, frame)
        self.conf_window.append(raw_conf)
        stable_conf = np.mean(list(self.conf_window))
        stress = 100 - stable_conf
        return {
            "confidence": round(stable_conf, 2),
            "stress": round(stress, 2)
        }