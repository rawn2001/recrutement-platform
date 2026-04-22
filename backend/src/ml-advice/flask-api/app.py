# backend/src/ml-advice/flask-api/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import re
import os
import json
from PyPDF2 import PdfReader
from docx import Document
from transformers import AutoTokenizer, AutoModelForSequenceClassification

app = Flask(__name__)
CORS(app)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "saved_model")

# 1️⃣ Charger tokenizer et modèle
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, use_fast=False)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)

# 2️⃣ Charger les classes depuis config.json (25 classes LABEL_0 à LABEL_24)
try:
    with open(os.path.join(MODEL_PATH, "config.json"), "r", encoding="utf-8") as f:
        config = json.load(f)
    id2label = config.get("id2label", {})
    # Créer la liste dans l'ordre 0, 1, 2... 24
    classes = [id2label.get(str(i), f"LABEL_{i}") for i in range(25)]
    print(f"✅ {len(classes)} classes chargées depuis config.json")
except Exception as e:
    print(f"⚠️ Erreur chargement config.json: {e}")
    classes = [f"LABEL_{i}" for i in range(25)]

# 3️⃣ Mapping LABEL_X -> Métier réel
# ⚠️ IMPORTANT : Cet ordre DOIT correspondre à l'ordre d'entraînement de votre modèle.
# Si le modèle prédit LABEL_4 pour un CV Data Science mais que LABEL_4 est mappé sur "Mécanique",
# c'est que l'ordre d'entraînement est différent. Ajustez les valeurs ci-dessous.
LABEL_TO_METIER = {
    "label0": "Data Science",
    "label1": "ETL Developer",
    "label2": "Embedded Systems",
    "label3": "Python Developer",
    "label4": "Ingénieur Mécanique",
    "label5": "Développeur Logiciel",
    "label6": "Web Development",
    "label7": "Cybersécurité",
    "label8": "DevOps / Cloud",
    "label9": "Data Engineer",
    "label10": "Frontend Developer",
    "label11": "Backend Developer",
    "label12": "Full Stack Developer",
    "label13": "Mobile Developer",
    "label14": "UI/UX Designer",
    "label15": "Product Manager",
    "label16": "QA / Test Engineer",
    "label17": "System Administrator",
    "label18": "Database Administrator",
    "label19": "Network Engineer",
    "label20": "Machine Learning Engineer",
    "label21": "AI Researcher",
    "label22": "Business Intelligence",
    "label23": "Project Manager IT",
    "label24": "Autre / Généraliste Tech"
}

# 4️⃣ Référentiel des compétences (aligné exactement avec les métiers mappés ci-dessus)
REFERENTIEL = {
    "Data Science": ["python", "pandas", "scikit-learn", "tensorflow", "pytorch", "machine learning", "deep learning", "sql", "numpy", "matplotlib", "keras", "nltk"],
    "ETL Developer": ["sql", "etl", "informatica", "talend", "data warehouse", "oracle", "pipeline", "spark", "big data", "hadoop", "azure data factory"],
    "Embedded Systems": ["arduino", "c++", "microcontroller", "pcb", "isis", "rtos", "stm32", "embedded c", "raspberry pi", "vhdl", "fpga"],
    "Python Developer": ["python", "django", "flask", "fastapi", "rest api", "git", "docker", "unit testing", "postgresql", "redis"],
    "Ingénieur Mécanique": ["solidworks", "catia", "autocad", "ansys", "matlab", "resistance des materiaux", "thermodynamique", "cao", "calcul de structures", "prototypage", "qhse", "anglais technique"],
    "Développeur Logiciel": ["python", "javascript", "react", "django", "flask", "postgresql", "docker", "git", "api rest", "tests unitaires", "agile", "scrum", "linux", "aws", "clean code"],
    "Web Development": ["html", "css", "javascript", "react", "angular", "vue", "node.js", "git", "responsive design", "web design", "frontend", "backend"],
    "Full Stack Developer": ["javascript", "typescript", "react", "node.js", "python", "sql", "git", "docker", "aws", "api rest"],
    "Machine Learning Engineer": ["python", "tensorflow", "pytorch", "scikit-learn", "docker", "kubernetes", "mlflow", "git", "sql", "linux"],
    "AI Researcher": ["python", "pytorch", "tensorflow", "mathematics", "statistics", "nlp", "computer vision", "git", "latex"],
    "Cybersécurité": ["python", "networking", "firewalls", "penetration testing", "wireshark", "linux", "siem", "compliance", "cryptography"],
    "DevOps / Cloud": ["docker", "kubernetes", "aws", "azure", "gcp", "ci/cd", "terraform", "linux", "python", "bash"],
    "Mobile Developer": ["flutter", "react native", "swift", "kotlin", "dart", "java", "firebase", "git", "api rest"],
    "Data Engineer": ["python", "sql", "spark", "hadoop", "kafka", "airflow", "etl", "aws", "docker", "git"],
    "Frontend Developer": ["html", "css", "javascript", "typescript", "react", "vue", "angular", "sass", "git", "webpack"],
    "Backend Developer": ["python", "java", "node.js", "go", "sql", "nosql", "docker", "api rest", "git", "linux"],
    "QA / Test Engineer": ["selenium", "pytest", "junit", "cypress", "postman", "git", "ci/cd", "sql", "automation"],
    "System Administrator": ["linux", "windows server", "active directory", "networking", "bash", "powershell", "docker", "monitoring"],
    "Database Administrator": ["sql", "postgresql", "mysql", "oracle", "mongodb", "backup", "performance tuning", "linux", "docker"],
    "Network Engineer": ["tcp/ip", "routing", "switching", "cisco", "firewalls", "vpn", "wireshark", "python", "linux"],
    "UI/UX Designer": ["figma", "adobe xd", "sketch", "prototyping", "user research", "wireframing", "html", "css", "accessibility"],
    "Product Manager": ["agile", "scrum", "jira", "roadmapping", "user stories", "analytics", "sql", "communication"],
    "Project Manager IT": ["agile", "scrum", "jira", "confluence", "risk management", "budgeting", "stakeholder management", "ms project"],
    "Business Intelligence": ["sql", "tableau", "power bi", "excel", "python", "data modeling", "etl", "dashboarding"],
    "Autre / Généraliste Tech": ["git", "agile", "problem solving", "communication", "linux", "sql", "python", "javascript"]
}

def nettoyer_texte(texte):
    if not texte:
        return ""
    texte = texte.lower()
    texte = re.sub(r'[^a-zàâäéèêëïîôùûüÿçœæ0-9+#\s-]', ' ', texte)
    return " ".join(texte.split())

def extraire_texte_fichier(file, filename):
    texte = ""
    ext = os.path.splitext(filename)[1].lower()
    try:
        if ext == '.pdf':
            reader = PdfReader(file)
            for page in reader.pages:
                extrait = page.extract_text()
                if extrait: texte += extrait + "\n"
        elif ext in ['.docx', '.doc']:
            doc = Document(file)
            for para in doc.paragraphs:
                texte += para.text + "\n"
        elif ext in ['.txt', '.text']:
            texte = file.read().decode('utf-8', errors='ignore')
        else:
            return None
    except Exception as e:
        print(f"❌ Erreur lecture fichier: {e}")
        return None
    return texte

def normaliser_cle(nom):
    return re.sub(r'[^a-z0-9]', '', nom.lower())

def competence_presente(skill, texte_clean):
    if not skill or not texte_clean:
        return False
    skill_clean = nettoyer_texte(skill)
    if not skill_clean:
        return False
    variantes = list(set([
        skill_clean,
        skill_clean.replace('-', ' '),
        skill_clean.replace(' ', '-'),
        skill_clean.replace(' ', ''),
    ]))
    return any(v and v in texte_clean for v in variantes if v)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "service": "flask-cv-advice"})

@app.route('/predict', methods=['POST'])
def predict():
    text_cv = ""
    job_text = ""
    
    if 'cv_file' in request.files and request.files['cv_file'].filename != '':
        file = request.files['cv_file']
        filename = file.filename
        job_text = request.form.get('job_text', '')
        text_cv = extraire_texte_fichier(file, filename)
        if text_cv is None:
            return jsonify({"error": "Format non supporté. Utilisez PDF, DOCX ou TXT."}), 400
    else:
        text_cv = request.form.get('cv_text', '') or (request.get_json() or {}).get('cv_text', '')
        job_text = request.form.get('job_text', '') or (request.get_json() or {}).get('job_text', '')

    if not text_cv or not text_cv.strip():
        return jsonify({"error": "Le contenu du CV est vide"}), 400

    # 🔹 1. Classification IA
    inputs = tokenizer(text_cv, return_tensors="pt", truncation=True, padding=True, max_length=512)
    with torch.no_grad():
        logits = model(**inputs).logits

    pred_id = torch.argmax(logits, dim=1).item()
    label_pred = classes[pred_id]  # Ex: "LABEL_4"
    label_normalise = normaliser_cle(label_pred)  # Ex: "label4"
    
    print(f"🔍 Modèle brut: index={pred_id}, label={label_pred}")

    # 🔹 2. Mapping vers métier réel
    metier_predit = LABEL_TO_METIER.get(label_normalise, "Autre / Généraliste Tech")
    competences_metier = REFERENTIEL.get(metier_predit, REFERENTIEL["Autre / Généraliste Tech"])

    print(f"🔍 Métier mappé: {metier_predit}")
    print(f"🔍 Compétences attendues: {competences_metier}")

    # 🔹 3. Détection des compétences manquantes
    cv_clean = nettoyer_texte(text_cv)
    manquants = []
    presents = []
    
    for skill in competences_metier:
        if competence_presente(skill, cv_clean):
            presents.append(skill)
        else:
            manquants.append(skill)

    print(f"✅ Présentes: {presents}")
    print(f"❌ Manquantes: {manquants}")

    # 🔹 4. Retour JSON (sans filtrage buggy)
    return jsonify({
        "metier": metier_predit,
        "manquants": manquants,
        "presents": presents,
        "total_skills": len(competences_metier),
        "matched_skills": len(presents)
    })

if __name__ == '__main__':
    port = int(os.environ.get('FLASK_PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True, use_reloader=False)