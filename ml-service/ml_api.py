# ml_api.py - API ML dédiée pour NestJS
from flask import Flask, request, jsonify
import os, re, json, io, warnings
import numpy as np
import joblib
import pdfplumber
from sklearn.metrics.pairwise import cosine_similarity
from transformers import pipeline as hf_pipeline
import torch
torch.set_num_threads(2)

warnings.filterwarnings("ignore", category=UserWarning)
app = Flask(__name__)

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")

print("⏳ Chargement des modèles ML...")

# Charger les modèles
xgb_model = joblib.load(os.path.join(MODEL_DIR, "xgb_classifier_v2.joblib"))
tfidf = joblib.load(os.path.join(MODEL_DIR, "tfidf_vectorizer_v2.joblib"))
label_enc = joblib.load(os.path.join(MODEL_DIR, "label_encoder_v2.joblib"))

try:
    skill_match = joblib.load(os.path.join(MODEL_DIR, "skill_matcher_v2.joblib"))
except:
    skill_match = None

with open(os.path.join(MODEL_DIR, "skills_dict_v2.json"), encoding="utf-8") as f:
    skills_dict = json.load(f)

# Charger LLM
llm_config = json.load(open(os.path.join(MODEL_DIR, "llm_cv_pipeline_v1_config.json"), encoding="utf-8"))
zs_pipeline = hf_pipeline(
    "zero-shot-classification",
    model="facebook/bart-large-mnli",  # ~1.6 GB, lent
    device=-1,
)
all_categories = llm_config["known_categories"] + llm_config.get("extended_categories", [])
CONFIDENCE_THR = 0.40

print("✅ Modèles chargés!\n")

def extract_text_from_pdf(file_bytes):
    text = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            t = page.extract_text()
            if t:
                text.append(t)
    return "\n".join(text)

def clean_text(text):
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[^\w\s.,@\-+/()]", " ", text)
    return text.strip()

def xgb_predict(cv_text):
    vec = tfidf.transform([cv_text])
    probs = xgb_model.predict_proba(vec)[0]
    idx = int(np.argmax(probs))
    conf = float(probs[idx])
    cat = label_enc.inverse_transform([idx])[0]
    classes = label_enc.classes_
    top3 = sorted([
        {"category": c, "score": round(float(p) * 100, 2)} 
        for c, p in zip(classes, probs)
    ], key=lambda x: x["score"], reverse=True)[:3]
    return cat, conf, top3

def llm_predict(cv_text):
    words = cv_text.split()
    if len(words) > 500:
        cv_text = " ".join(words[:500])
    result = zs_pipeline(cv_text, candidate_labels=all_categories, 
                        hypothesis_template="This person works as a {}.")
    return [{"category": lbl, "score": round(sc * 100, 2)} 
            for lbl, sc in zip(result["labels"][:3], result["scores"][:3])]

def extract_skills(cv_text):
    found = []
    text_lower = cv_text.lower()
    for skill in skills_dict.get("all_skills", []):
        if skill.lower() in text_lower:
            found.append(skill)
    return found[:30]

def match_cv_offer(cv_text, offer_text):
    if skill_match is not None:
        try:
            score = skill_match.match(cv_text, offer_text)
            return round(float(score) * 100, 2)
        except:
            pass
    vecs = tfidf.transform([cv_text, offer_text])
    sim = cosine_similarity(vecs[0], vecs[1])[0][0]
    return round(float(sim) * 100, 2)

# ============ ENDPOINTS API ============

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "ml-cv-matching"})

@app.route("/analyze", methods=["POST"])
def analyze():
    """Endpoint principal pour NestJS"""
    print("🔥 [FLASK] === DÉBUT /analyze ===")
    print(f"🔥 [FLASK] Headers: {request.headers}")
    
    try:
        data = request.get_json()
        print(f"🔥 [FLASK] Données reçues: {len(str(data))} chars")
        
        # Récupérer les données
        cv_base64 = data.get("cv_file")  # Base64 du PDF
        offer_text = data.get("offer_text", "")
        offer_title = data.get("offer_title", "")
        required_skills = data.get("required_skills", [])
        
        print(f"🔥 [FLASK] CV base64 length: {len(cv_base64) if cv_base64 else 0}")
        print(f"🔥 [FLASK] Offer: {offer_title}")
        
        if not cv_base64:
            print("❌ [FLASK] Erreur: cv_file manquant")
            return jsonify({"error": "CV file required"}), 400
        
        # Extraire texte du CV
        print("⏳ [FLASK] Extraction texte du PDF...")
        if cv_base64.startswith("data:"):
            cv_base64 = cv_base64.split(",")[1]
        import base64
        file_bytes = base64.b64decode(cv_base64)
        print(f"📄 [FLASK] PDF décodé: {len(file_bytes)} bytes")
        
        cv_text = clean_text(extract_text_from_pdf(file_bytes))
        print(f"📝 [FLASK] Texte extrait: {len(cv_text)} chars")
        
        if not cv_text.strip():
            print("❌ [FLASK] Texte vide après extraction")
            return jsonify({"error": "Impossible d'extraire le texte du CV"}), 422
        
        # 1. Classification CV
        print("🤖 [FLASK] Classification XGBoost...")
        xgb_cat, xgb_conf, xgb_top3 = xgb_predict(cv_text)
        xgb_used = xgb_conf >= CONFIDENCE_THR
        
        if xgb_used:
            final_category = xgb_cat
            model_used = f"XGBoost"
        else:
            print("🤖 [FLASK] Confiance faible → LLM fallback")
            llm_top = llm_predict(cv_text)
            final_category = llm_top[0]["category"]
            model_used = f"LLM"
        
        # 2. Compétences détectées
        print("⚡ [FLASK] Extraction compétences...")
        skills_found = extract_skills(cv_text)
        
        # 3. Matching avec l'offre
        print("🎯 [FLASK] Calcul matching...")
        full_offer_text = f"{offer_title} {offer_text} {' '.join(required_skills)}"
        match_score = match_cv_offer(cv_text, full_offer_text) if full_offer_text.strip() else 0
        
        print(f"✅ [FLASK] Résultat: score={match_score}, cat={final_category}")
        
        
        return jsonify({
            "success": True,
            "matching_score": match_score,
            "cv_classification": final_category,
            "classification_confidence": round(xgb_conf * 100, 2),
            "classification_top3": xgb_top3,
            "skills_detected": skills_found,
            "model_used": model_used,
            "cv_text_preview": cv_text[:300]
        })
        response.headers['Content-Type'] = 'application/json; charset=utf-8'

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)