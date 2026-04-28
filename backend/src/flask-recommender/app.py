# backend/src/flask-recommender/app.py
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS  # ✅ AJOUTER CORS
from config import Config
from src.loader import ModelLoader
from src.recommender import HybridRecommender
import logging, traceback, pdfplumber, io, requests, pandas as pd, time

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__, template_folder='templates', static_folder='static')
app.config.from_object(Config)

# ✅ CORS pour React (port 3001) et NestJS (port 3000)
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"]}})

# 🔄 Cache mémoire des offres (TTL 5 minutes)
_jobs_cache = {"data": pd.DataFrame(), "timestamp": 0}
_CACHE_TTL = 300

def get_active_jobs_from_nestjs():
    """Récupère les offres actives depuis NestJS → DataFrame compatible ML"""
    now = time.time()
    if not _jobs_cache["data"].empty and (now - _jobs_cache["timestamp"]) < _CACHE_TTL:
        return _jobs_cache["data"]

    try:
        url = f"{Config.PLATFORM_API_URL}/job-offers"
        headers = {}
        if Config.PLATFORM_API_TOKEN:
            headers["Authorization"] = f"Bearer {Config.PLATFORM_API_TOKEN}"
        
        resp = requests.get(url, params={"is_active": "true"}, headers=headers, timeout=10)
        resp.raise_for_status()
        jobs = resp.json()

        # 🔄 Mapping NestJS JobOffer → Format DataFrame attendu par le pipeline ML
        formatted = []
        for j in jobs:
            formatted.append({
                "job_id": j.get("id", ""),
                "job_title": j.get("title", ""),
                "company": "Entreprise",
                "job_location": j.get("location", "Remote"),
                "exp_level": j.get("experience_level", "Mid"),
                "sector": "Tech",
                "cleaned_text": f"{j.get('title', '')} {j.get('description', '')}",
                "skills_set": j.get("required_skills", []) or []
            })

        df = pd.DataFrame(formatted)
        _jobs_cache.update({"data": df, "timestamp": time.time()})
        logger.info(f"✅ {len(df)} offres chargées depuis NestJS (port {Config.PORT})")
        return df

    except Exception as e:
        logger.error(f"❌ Échec récupération offres NestJS: {e}")
        return _jobs_cache["data"]

# Initialisation ML
logger.info(f"🚀 Démarrage Recommender sur port {Config.PORT}...")
model_loader = ModelLoader()
recommender = HybridRecommender(model_loader)
logger.info("✅ Recommender prêt !")

@app.route('/api/extract-pdf', methods=['POST'])
def extract_pdf():
    try:
        if 'file' not in request.files: return jsonify({'error': 'Aucun fichier'}), 400
        file = request.files['file']
        if not file.filename.endswith('.pdf'): return jsonify({'error': 'Format PDF requis'}), 400

        text = ""
        with pdfplumber.open(io.BytesIO(file.read())) as pdf:
            for page in pdf.pages:
                pt = page.extract_text()
                if pt: text += pt + "\n"
        if len(text.strip()) < 50: return jsonify({'error': 'Texte trop court'}), 400
        return jsonify({'success': True, 'text': text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/recommend', methods=['POST'])
def api_recommend():
    try:
        data = request.get_json() or {}
        cv_text = data.get('cv_text', '').strip()
        sector = data.get('sector', 'Tous')
        top_k = int(data.get('top_k', Config.DEFAULT_TOP_K))

        if len(cv_text) < Config.MIN_CV_LENGTH:
            return jsonify({'error': f'CV trop court (min {Config.MIN_CV_LENGTH} car.)'}), 400

        jobs_pool = get_active_jobs_from_nestjs()
        if jobs_pool.empty:
            return jsonify({'error': 'Aucune offre active'}), 503

        # ✅ Injecter le jobs_pool live dans le recommender
        model_loader.set_jobs_pool(jobs_pool)

        df_results, status_msg = recommender.recommend(
            cv_text=cv_text, exp_level='Mid', top_k=top_k, sector=sector, jobs_pool=jobs_pool
        )

        if df_results.empty:
            return jsonify({'results': [], 'status': 'Aucun match trouvé'}), 200

        return jsonify({
            'success': True,
            'results': df_results.to_dict('records'),
            'status': status_msg,
            'metadata': {'total_active_jobs': len(jobs_pool)}
        })
    except Exception as e:
        logger.error(f"❌ Erreur /api/recommend: {e}")
        return jsonify({'error': 'Erreur serveur'}), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'model_loaded': True,
        'jobs_count': len(get_active_jobs_from_nestjs()),
        'port': Config.PORT
    })

if __name__ == '__main__':
    print(f"🎯 Recommender → http://localhost:{Config.PORT}")
    app.run(host='0.0.0.0', port=Config.PORT, debug=Config.DEBUG, use_reloader=False)