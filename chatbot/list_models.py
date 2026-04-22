# list_models.py
from google import genai
import os
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

print("🔍 Modèles disponibles avec votre clé API :\n")
try:
    for model in client.models.list():
        name = model.name
        # Afficher uniquement les modèles Gemini pertinents
        if "gemini" in name.lower():
            print(f"✅ {name}")
except Exception as e:
    print(f"❌ Erreur: {e}")
    print("\n💡 Essayez avec l'ancien SDK pour comparer...")