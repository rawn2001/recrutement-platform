from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import cv2
import os
import sys
import time
import json
from loader import InterviewAnalyzer
import mediapipe as mp
import base64
from io import BytesIO
from PIL import Image
import librosa

app = Flask(__name__)  # ✅ __name__ pas "name"

# ✅ CORS pour React:3001 et NestJS:3000
CORS(app, resources={
    r"/*": {
        "origins": [
            "http://localhost:3001",  # React frontend
            "http://127.0.0.1:3001",
            "http://localhost:3000",  # NestJS backend
        ]
    }
})

# Chemins des modèles
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

EMOTION_PATH = os.path.join(MODELS_DIR, "emotions", "finalModelFineTuning.keras")
VOICE_DIR = os.path.join(MODELS_DIR, "voix")
GESTES_DIR = os.path.join(MODELS_DIR, "gestes")

# Initialisation avec gestion d'erreurs
try:
    analyzer = InterviewAnalyzer(EMOTION_PATH, VOICE_DIR, GESTES_DIR)
except FileNotFoundError as e:
    print(f"❌ Erreur critique: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Erreur d'initialisation: {e}")
    sys.exit(1)


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok",
        "models_loaded": {
            "emotion": analyzer.emotion_model is not None,
            "yolo": analyzer.yolo is not None,
            "voice": analyzer.voice_pipeline is not None or analyzer.voice_fallback
        }
    }), 200


# ════════════════════════════════════════════════════════════════════════
# 🆕 ENDPOINTS AVEC STOCKAGE PAR SESSION
# ════════════════════════════════════════════════════════════════════════

@app.route('/api/analyze/frame', methods=['POST'])
def analyze_video_frame():
    """Analyse frame pour CANDIDAT uniquement → stocke + retourne ACK"""
    try:
        data = request.json
        frame_b64 = data.get('frame')
        user_role = data.get('role', 'candidate')
        session_id = data.get('session_id')
        
        if user_role != 'candidate':
            return jsonify({'skipped': True, 'reason': 'recruiter'})
        
        if not session_id:
            return jsonify({'success': False, 'error': 'session_id manquant'}), 400
        
        # Décoder image
        img_data = base64.b64decode(frame_b64.split(',')[1] if ',' in frame_b64 else frame_b64)
        image = Image.open(BytesIO(img_data)).convert('RGB')
        image_bgr = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Analyse
        result = analyzer.analyze_frame(image_bgr)
        
        # 🆕 STOCKER pour rapport final
        analyzer.store_frame_analysis(session_id, result)
        
        # 🔒 Retourne juste ACK (pas de résultats au candidat)
        return jsonify({'ok': True, 'session_id': session_id}), 200
        
    except Exception as e:
        print(f"❌ Erreur /api/analyze/frame: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/analyze/audio', methods=['POST'])
def analyze_audio_chunk():
    """Analyse audio pour CANDIDAT uniquement → stocke + retourne ACK"""
    try:
        data = request.json
        audio_b64 = data.get('audio')
        user_role = data.get('role', 'candidate')
        session_id = data.get('session_id')
        print(f"🎧 [DEBUG] Reçu audio pour session_id={session_id}, len={len(data.get('audio', ''))}")
        if user_role != 'candidate':
            return jsonify({'skipped': True, 'reason': 'recruiter'})
        
        if not session_id:
            return jsonify({'success': False, 'error': 'session_id manquant'}), 400
        
        audio_data = base64.b64decode(audio_b64.split(',')[1] if ',' in audio_b64 else audio_b64)
        audio_array, sr = librosa.load(BytesIO(audio_data), sr=16000)
        
        voice_result = analyzer.analyze_voice(audio_array, sr)
        
        # 🆕 STOCKER
        analyzer.store_audio_analysis(session_id, voice_result)
        
        return jsonify({'ok': True, 'session_id': session_id}), 200
        
    except Exception as e:
        print(f"❌ Erreur /api/analyze/audio: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/session/end', methods=['POST'])
def end_session():
    """
    Génère rapport final à la fin de l'entretien + nettoie la mémoire Flask
    """
    try:
        data = request.json
        session_id = data.get('session_id')
        
        # ✅ Validation : session_id requis
        if not session_id:
            print(f"⚠️ session_id manquant dans la requête: {data}")
            return jsonify({
                'success': False, 
                'error': 'session_id manquant'
            }), 400
        
        print(f"🔄 Génération rapport pour session: {session_id}")
        
        # ✅ Vérifier que la session existe dans la mémoire Flask
        # ✅ CORRECTION: analyzer.session_data (pas analyzer.session_)
        if session_id not in analyzer.session_data:
            print(f"⚠️ Session non trouvée: {session_id}")
            return jsonify({
                'success': False, 
                'error': f'Session non trouvée: {session_id}'
            }), 404
        
        # ✅ Générer le rapport final
        summary = analyzer.generate_session_summary(session_id)
        
        # ✅ Vérifier les erreurs de génération
        if "error" in summary:
            print(f"❌ Erreur génération rapport: {summary['error']}")
            return jsonify({
                'success': False, 
                'error': summary["error"]
            }), 404
        
        # ✅ NETTOYAGE : Supprimer la session de la mémoire Flask APRÈS génération
        # ✅ CORRECTION: analyzer.session_data[session_id] avec gestion safe
        if session_id in analyzer.session_data:
            session = analyzer.session_data[session_id]
            # Compter les données avant suppression (structure peut varier)
            frames_count = len(session.get('frames', [])) if isinstance(session, dict) else 0
            audio_count = len(session.get('audio_chunks', [])) if isinstance(session, dict) else 0
            
            del analyzer.session_data[session_id]
            print(f"🧹 Session nettoyée: {session_id} | frames: {frames_count}, audio: {audio_count}")
        
        # ✅ Retourner le rapport généré
        print(f"✅ Rapport généré avec succès: score={summary.get('global', {}).get('score')}")
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'report': summary
        }), 200
        
    except Exception as e:
        # ✅ Log complet de l'erreur pour debug
        print(f"❌ Erreur critique /api/session/end: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        
        return jsonify({
            'success': False, 
            'error': f'Erreur serveur: {str(e)}'
        }), 500


@app.route('/api/session/report/<session_id>', methods=['GET'])
def get_session_report(session_id):
    """Recruteur récupère le rapport d'une session"""
    try:
        summary = analyzer.generate_session_summary(session_id)
        
        if "error" in summary:
            return jsonify({'success': False, 'error': summary["error"]}), 404
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'report': summary
        }), 200
        
    except Exception as e:
        print(f"❌ Erreur /api/session/report: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


# ════════════════════════════════════════════════════════════════════════
# Anciens endpoints (compatibilité)
# ════════════════════════════════════════════════════════════════════════

@app.route('/ai/analyze', methods=['POST'])
def ai_analyze():
    if 'frame' not in request.files:
        return jsonify({"error": "Pas de frame"}), 400
    try:
        data = request.files['frame'].read()
        img = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)
        if img is None:
            return jsonify({"error": "Frame invalide"}), 400
        result = analyzer.analyze_frame(img)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ai/voice', methods=['POST'])
def ai_voice():
    if 'audio' not in request.files:
        return jsonify({"error": "Pas d'audio"}), 400
    try:
        audio_bytes = request.files['audio'].read()
        result = analyzer.analyze_audio(audio_bytes)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
# Dans backend/src/interview-ai/app.py, ajoute avant la ligne `if __name__ == '__main__':`

@app.route('/debug/sessions', methods=['GET'])
def list_sessions():
    """Voir toutes les sessions en mémoire Flask"""
    return jsonify({
        "active_sessions": list(analyzer.session_data.keys()),
        "count": len(analyzer.session_data)
    }), 200

if __name__ == '__main__':
    print("🚀 Démarrage du serveur Interview AI sur port 5003...")
    app.run(host='0.0.0.0', port=5003, debug=False, threaded=True)