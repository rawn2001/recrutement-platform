# backend/src/flask-recommender/src/__init__.py
import re
from typing import List, Set
from config import Config

class SkillExtractor:
    """Extraction de compétences via dictionnaire"""
    
    TECH_SKILLS = sorted(set([
        "python","java","javascript","typescript","c++","c#","golang","rust","kotlin",
        "react","angular","vue","node.js","django","fastapi","spring boot","flask",
        "docker","kubernetes","terraform","aws","gcp","azure","git","jenkins",
        "sql","postgresql","mongodb","redis","elasticsearch","mysql","oracle",
        "spark","hadoop","kafka","airflow","dbt","snowflake","databricks",
        "tensorflow","pytorch","scikit-learn","keras","pandas","numpy",
        "machine learning","deep learning","nlp","computer vision","mlops",
        "solidworks","catia","autocad","bim","ansys","simulink","plc","matlab",
        "scada","revit","eplan","sap2000","primavera","fea","cfd","hvac",
        "excel","vba","bloomberg","sap","ifrs","gaap","basel","sox","aml","kyc",
        "financial modeling","risk management","compliance","valuation",
        "seo","sem","google analytics","salesforce","crm","hubspot","workday",
        "recruitment","payroll","agile","scrum","jira",
        "epic","cerner","ehr","hipaa","clinical trials","spss","sas",
        "erp","wms","tms","incoterms","forecasting","procurement","supply chain",
        "powerbi","tableau","statistics","negotiation","gdpr","research",
    ]), key=len, reverse=True)
    
    def extract(self, text: str, max_skills: int = 30) -> List[str]:
        if not text or len(text) < 10:
            return []
        t = ' ' + text.lower() + ' '
        found = []
        for skill in self.TECH_SKILLS:
            pattern = r'(?<![a-z0-9])' + re.escape(skill) + r'(?![a-z0-9])'
            if re.search(pattern, t):
                found.append(skill)
            if len(found) >= max_skills:
                break
        return found


class ExperienceMatcher:
    """Matching des niveaux d'expérience"""
    def __init__(self, exp_order: dict):
        self.exp_order = exp_order
    def match(self, cv_exp: str, job_exp: str) -> float:
        cv_val = self.exp_order.get(cv_exp, 2)
        job_val = self.exp_order.get(job_exp, 2)
        return max(0.0, 1.0 - abs(cv_val - job_val) * 0.3)


class KeywordMatcher:
    """Matching des mots-clés dans les titres"""
    @staticmethod
    def match(cv_text: str, job_title: str) -> float:
        cv_words = set(re.findall(r'\b[a-z]+\b', cv_text.lower()))
        jt_words = set(re.findall(r'\b[a-z]+\b', str(job_title).lower()))
        return len(cv_words & jt_words) / len(jt_words) if jt_words else 0.0  # ✅ CORRECT: pas de "/" à la fin