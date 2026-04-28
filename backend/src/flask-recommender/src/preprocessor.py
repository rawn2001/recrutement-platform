# src/preprocessor.py
import re
import nltk
from nltk.corpus import stopwords
from typing import List, Set
import logging

logger = logging.getLogger(__name__)

# Téléchargement NLTK au premier import
try:
    STOP_WORDS = set(stopwords.words('english'))
except:
    nltk.download('stopwords', quiet=True)
    STOP_WORDS = set(stopwords.words('english'))

class TextPreprocessor:
    """Nettoyage et normalisation du texte"""
    
    @staticmethod
    def clean_text(text: str) -> str:
        if not isinstance(text, str) or len(text.strip()) < 5:
            return ""
        
        text = text.lower()
        text = re.sub(r'<[^>]+>', ' ', text)  # HTML tags
        text = re.sub(r'http\S+|www\S+|https\S+', ' ', text)  # URLs
        text = re.sub(r'[^a-z0-9\s/+#]', ' ', text)  # Caractères spéciaux
        text = re.sub(r'\s+', ' ', text).strip()  # Espaces multiples
        
        return text
    
    @staticmethod
    def normalize_experience(exp_text: str) -> str:
        """Normalise le niveau d'expérience"""
        t = str(exp_text).lower()
        if any(w in t for w in ['intern', 'stage', 'entry', 'associate', 'junior']):
            return 'Internship' if 'intern' in t or 'stage' in t else 'Junior'
        if any(w in t for w in ['senior', 'lead', 'principal', 'director', 'expert', 'chief']):
            return 'Senior'
        return 'Mid'
    
    @staticmethod
    def extract_words(text: str) -> Set[str]:
        """Extrait les mots-clés d'un texte"""
        cleaned = TextPreprocessor.clean_text(text)
        return set(re.findall(r'\b[a-z]+\b', cleaned))