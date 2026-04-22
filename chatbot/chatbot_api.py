# backend/chatbot_api.py
# TalentBot API - Backend Flask pour chatbot de recrutement
# Lancer avec : python chatbot_api.py
# Frontend : POST http://localhost:5001/api/chat

from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types
import os
from dotenv import load_dotenv

# Charger les variables d'environnement depuis le fichier .env
load_dotenv() 

app = Flask(__name__)

# Configuration CORS pour autoriser le frontend React
CORS(app, origins=[
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://172.28.32.1:3000",
])

# ─── Configuration Gemini ────────────────────────────────────────────────────
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("❌ Variable d'environnement GEMINI_API_KEY non définie !")

client = genai.Client(api_key=GEMINI_API_KEY)

# ─── Prompt système : guide le comportement du bot ───────────────────────────
SYSTEM_PROMPT = """Tu es TalentBot, un expert en recrutement et préparation aux entretiens professionnels.

🎯 TES COMPÉTENCES :
- Préparation aux entretiens (présentiel et visio)
- Gestion du stress et confiance en soi
- Optimisation de CV et lettres de motivation
- Processus de recrutement et ATS
- Questions d'entretien et réponses stratégiques
- Communication professionnelle et langage corporel
- Négociation salariale
- Suivi post-entretien

⚠️ LIMITES STRICTES :
Si la question n'est PAS liée au recrutement/carrière, réponds UNIQUEMENT :
"Désolé, je suis spécialisé exclusivement dans le recrutement et la préparation aux entretiens professionnels. Je ne peux pas vous aider sur ce sujet. Puis-je vous accompagner sur votre préparation à un entretien ?"

📝 RÈGLES DE RÉPONSE OBLIGATOIRES :
1. **Longueur** : Réponses COMPLÈTES et DÉTAILLÉES (minimum 150-300 mots)
2. **Structure** : Utilise des paragraphes clairs, des listes à puces, des étapes numérotées
3. **Pratique** : Donne des CONSEILS CONCRETS et ACTIONNABLES, pas juste de la théorie
4. **Exemples** : Inclus des exemples pratiques quand c'est pertinent
5. **Ton** : Professionnel, bienveillant, encourageant mais pas trop familier
6. **Emojis** : Utilise-les avec MODÉRATION (1-2 max par réponse)
7. **Pertinence** : Réponds EXACTEMENT à la question posée, ne dévie pas

🎯 FORMAT DE RÉPONSE RECOMMANDÉ :
- Introduction courte qui reformule la question
- Développement structuré en 3-5 points clés avec titres en gras
- Conseils pratiques spécifiques et actionnables
- Conclusion encourageante avec un appel à l'action

💡 EXEMPLE DE BONNE RÉPONSE :
Question : "Comment gérer le stress avant un entretien ?"
Réponse : 
"Gérer le stress avant un entretien est essentiel pour performer. Voici 4 techniques éprouvées :

1️⃣ **Préparation approfondie** : Recherchez l'entreprise, anticipez les questions, préparez vos exemples concrets (méthode STAR). Plus vous êtes prêt, moins vous stresserez.

2️⃣ **Respiration 4-7-8** : Inspirez 4 secondes, retenez 7 secondes, expirez 8 secondes. Répétez 3-4 fois pour activer votre système nerveux parasympathique.

3️⃣ **Visualisation positive** : Imaginez-vous réussir l'entretien, sourire aux lèvres, répondant avec aisance. Cette technique mentale réduit l'anxiété de 40%.

4️⃣ **Routine pré-entretien** : 30 minutes avant, évitez la caféine, écoutez une musique apaisante, relisez vos notes clés.

💪 Rappelez-vous : un peu de stress est normal et même bénéfique pour rester alerte. Vous avez les compétences, faites-vous confiance !

Besoin de conseils sur une situation spécifique ?"

Réponds toujours en FRANÇAIS."""

# ─── Endpoint principal : /api/chat ──────────────────────────────────────────
@app.route("/api/chat", methods=["POST"])
def chat():
    """Endpoint pour recevoir les messages et générer des réponses via Gemini"""
    
    # Validation des données d'entrée
    data = request.get_json()
    if not data or "message" not in data:
        return jsonify({"error": "Message manquant"}), 400

    user_message = data["message"].strip()
    history = data.get("history", [])  # Liste de {role: "user"|"model", content: "..."}

    if not user_message:
        return jsonify({"error": "Message vide"}), 400

    try:
        # Construire les messages au format conversation pour Gemini
        messages = []
        
        # 1. Message système (instructions du bot)
        messages.append({
            "role": "user",
            "parts": [{"text": SYSTEM_PROMPT}]
        })
        
        # 2. Accusé de réception du modèle (pour initialiser la conversation)
        messages.append({
            "role": "model",
            "parts": [{"text": "Compris ! Je suis TalentBot, votre expert en recrutement. Je suis prêt à vous accompagner avec des conseils pratiques et détaillés. Comment puis-je vous aider aujourd'hui ?"}]
        })
        
        # 3. Historique de la conversation (si présent)
        if history:
            for msg in history:
                role = "user" if msg["role"] == "user" else "model"
                messages.append({
                    "role": role,
                    "parts": [{"text": msg["content"]}]
                })
        
        # 4. Message actuel de l'utilisateur
        messages.append({
            "role": "user",
            "parts": [{"text": user_message}]
        })

        # Appel à l'API Gemini avec configuration optimisée
        response = client.models.generate_content(
            model="models/gemini-flash-latest",  # ✅ Modèle disponible avec votre clé
            contents=messages,
            config=types.GenerateContentConfig(
                temperature=0.7,           # Créativité équilibrée
                max_output_tokens=2200,     # Réponses détaillées (augménté)
                top_p=0.9,                 # Cohérence des réponses
            )
        )

        bot_reply = response.text
        # Corrected version:
        if not bot_reply.rstrip().endswith(('.', '!', '?', '"', ')')):
            print(f"⚠️ Réponse potentiellement tronquée ({len(bot_reply)} caractères)")  # ✅ Indented with 4 spaces
            # Optional: add a note to the user
            bot_reply += "\n\n*[Réponse incomplète. Veuillez reformuler si nécessaire.]*"
        # Log pour déboguer les réponses trop courtes
        word_count = len(bot_reply.split())
        if word_count < 50:
            print(f"⚠️ Réponse courte détectée: {word_count} mots")
        
        return jsonify({"reply": bot_reply})

    except Exception as e:
        error_msg = str(e)
        print(f"❌ Erreur Gemini: {error_msg}")
        
        # Gestion spécifique des erreurs de quota (429)
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
            return jsonify({
                "error": "Quota API temporairement épuisé. Veuillez attendre 1 minute et réessayer.",
                "retry_after": 60
            }), 429
        
        # Gestion des erreurs de modèle non trouvé (404)
        elif "404" in error_msg or "NOT_FOUND" in error_msg:
            return jsonify({
                "error": "Le modèle IA n'est pas disponible. Veuillez contacter l'administrateur.",
                "hint": "Vérifiez que le modèle 'models/gemini-2.0-flash' est activé dans votre projet Google AI Studio"
            }), 503
        
        # Gestion des erreurs d'authentification (401/403)
        elif "401" in error_msg or "403" in error_msg or "UNAUTHENTICATED" in error_msg:
            return jsonify({
                "error": "Clé API invalide ou non autorisée. Contactez l'administrateur.",
            }), 401
        
        # Erreur générique
        return jsonify({
            "error": "Erreur temporaire du service. Veuillez réessayer dans quelques instants.",
            "details": error_msg[:200]  # Limiter la longueur pour la sécurité
        }), 500


# ─── Endpoint de santé : /api/health ─────────────────────────────────────────
@app.route("/api/health", methods=["GET"])
def health():
    """Endpoint pour vérifier que le serveur est opérationnel"""
    return jsonify({
        "status": "ok", 
        "bot": "TalentBot actif",
        "model": "models/gemini-2.0-flash"
    })


# ─── Point d'entrée principal ────────────────────────────────────────────────
if __name__ == "__main__":
    print("🚀 TalentBot API démarrée sur http://localhost:5001")
    print("📊 Modèle actif: models/gemini-2.0-flash")
    print("💡 Réponses détaillées et structurées activées")
    print("🔗 CORS autorisé pour: localhost:3000, 127.0.0.1:3000")
    app.run(port=5001, debug=True)