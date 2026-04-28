# backend/src/flask-recommender/config.py
import os
from pathlib import Path

BASE_DIR = Path(__file__).parent

class Config:
    # 🧠 Chemins des modèles
    MODELS_DIR = BASE_DIR / "models"
    PIPELINE_PATH = MODELS_DIR / "pipeline.pkl"
    # 🗑️ JOBS_PATH supprimé (plus de fichier statique)
    
    # 🌐 API NestJS (où sont stockées les offres actives)
    PLATFORM_API_URL = os.getenv("PLATFORM_API_URL", "http://localhost:3000")
    PLATFORM_API_TOKEN = os.getenv("PLATFORM_API_TOKEN", "")
    
    # 🤖 Modèle BERT
    BERT_MODEL_NAME = "all-MiniLM-L6-v2"
    
    # 📊 Paramètres de recommandation
    DEFAULT_TOP_K = 3  # ✅ Top 3 pour le candidat
    MIN_CV_LENGTH = 50
    SCORE_THRESHOLD = 0.3
    
    # 🐍 Flask
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-key-change-in-prod")
    DEBUG = os.getenv("FLASK_DEBUG", "True") == "True"
    
    # 🔌 Port
    PORT = int(os.getenv("RECOMMENDER_PORT", 5004))