# backend/src/flask-recommender/src/recommender.py
import numpy as np
import pandas as pd
import re
import logging
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
from src.preprocessor import TextPreprocessor
from src import SkillExtractor
from config import Config

logger = logging.getLogger(__name__)


class HybridRecommender:
    """Système de recommandation hybride: TF-IDF + BERT(lazy) + Skills"""

    def __init__(self, model_loader):
        self.loader = model_loader
        self.pipeline = model_loader.get_pipeline()
        self.jobs_pool = model_loader.get_jobs_pool()
        self._use_bert = model_loader.is_bert_available()
        self.bert_model = model_loader.get_bert_model() if self._use_bert else None
        self.w_opt = self.pipeline['w_opt']
        self.scalers = {
            'tf': self.pipeline['sc_tf'],
            'be': self.pipeline['sc_be'],
            'sk': self.pipeline['sc_sk']
        }
        self.skill_extractor = SkillExtractor()
        self.tfidf_pool = model_loader.get_tfidf_pool()

    def _compute_tfidf_score(self, cv_clean, indices):
        """Score TF-IDF entre CV et offres"""
        if self.tfidf_pool is None:
            return np.ones(len(indices)) * 0.5
        vec_cv = self.pipeline['tfidf'].transform([cv_clean])
        sims = cosine_similarity(vec_cv, self.tfidf_pool[indices]).flatten()
        return self.scalers['tf'].transform(sims.reshape(-1, 1)).flatten()

    def _compute_bert_score(self, cv_clean, indices):
        """Score BERT en lazy mode"""
        if not self._use_bert or self.bert_model is None:
            return np.ones(len(indices)) * 0.5
        try:
            emb_cv = self.bert_model.encode([cv_clean], normalize_embeddings=True, convert_to_numpy=True)
            job_texts = [self.jobs_pool.iloc[i]['cleaned_text'] for i in indices]
            emb_jobs = self.bert_model.encode(job_texts, batch_size=4, normalize_embeddings=True, convert_to_numpy=True)
            sims = (emb_jobs @ emb_cv.T).flatten()
            try:
                return self.scalers['be'].transform(sims.reshape(-1, 1)).flatten()
            except:
                return (sims - sims.min()) / (sims.max() - sims.min() + 1e-8)
        except Exception as e:
            logger.warning(f"⚠️ Erreur score BERT: {e}")
            return np.ones(len(indices)) * 0.5

    def _compute_skill_score(self, cv_skills, indices):
        """✅ CORRECTION: Retourne toujours un numpy array"""
        scores = np.zeros(len(indices))
        for i, idx in enumerate(indices):
            job_skills_raw = self.jobs_pool.iloc[idx].get('skills_set', [])
            job_skills = set(job_skills_raw) if isinstance(job_skills_raw, (list, tuple)) else job_skills_raw
            if not job_skills:
                continue
            inter = len(cv_skills & job_skills)
            union = cv_skills | job_skills
            scores[i] = 0.6 * (inter / len(job_skills)) + 0.4 * (inter / len(union) if union else 0)
        # ✅ Normalisation + conversion explicite en numpy array
        if scores.max() > scores.min():
            return self.scalers['sk'].transform(scores.reshape(-1, 1)).flatten()
        return np.array(scores)  # ✅ Force numpy array

    def _compute_exp_score(self, cv_exp, indices):
        """✅ CORRECTION: Retourne toujours un numpy array"""
        exp_order = self.pipeline.get('EXP_ORDER', {'Internship': 1, 'Junior': 2, 'Mid': 3, 'Senior': 4})
        # ✅ Utiliser .values pour obtenir un numpy array, pas un Series
        if 'exp_num' in self.jobs_pool.columns:
            exp_nums = self.jobs_pool.iloc[indices]['exp_num'].values
        else:
            exp_nums = np.array([2] * len(indices))
        result = np.maximum(0.0, 1.0 - np.abs(exp_order.get(cv_exp, 2) - exp_nums) * 0.3)
        return np.array(result)  # ✅ Force numpy array

    def _compute_kw_score(self, cv_words, indices):
        """✅ CORRECTION: Retourne toujours un numpy array"""
        scores = np.zeros(len(indices))
        for i, idx in enumerate(indices):
            job_title = str(self.jobs_pool.iloc[idx].get('job_title', '')).lower()
            jt_words = set(re.findall(r'\b[a-z]+\b', job_title))
            if jt_words:
                scores[i] = len(cv_words & jt_words) / len(jt_words)
        return np.array(scores)  # ✅ Force numpy array

    def recommend(self, cv_text, exp_level="Mid", top_k=10, sector="Tous", jobs_pool=None):
        """Génère des recommandations de métiers basées sur un CV"""
        # ✅ Si jobs_pool est fourni (live depuis NestJS), on l'utilise
        if jobs_pool is not None and not jobs_pool.empty:
            self.jobs_pool = jobs_pool.reset_index(drop=True)
            self.tfidf_pool = None
        
        if not cv_text or len(cv_text.strip()) < Config.MIN_CV_LENGTH:
            return pd.DataFrame(), "⚠️ Texte CV trop court"
        
        if self.jobs_pool.empty:
            return pd.DataFrame(), "❌ Aucune offre disponible"
        
        # Prétraitement du CV
        cv_clean = TextPreprocessor.clean_text(cv_text)
        cv_skills = set(self.skill_extractor.extract(cv_clean))
        cv_words = TextPreprocessor.extract_words(cv_clean)
        cv_exp = TextPreprocessor.normalize_experience(exp_level)
        
        # Filtre par secteur
        if sector != "Tous":
            if 'sector' in self.jobs_pool.columns:
                mask = self.jobs_pool['sector'] == sector
            else:
                mask = pd.Series([True] * len(self.jobs_pool))
            if not mask.any():
                return pd.DataFrame(), f"❌ Aucun poste pour '{sector}'"
            pool_indices = np.where(mask)[0]
        else:
            pool_indices = np.arange(len(self.jobs_pool))
        
        if len(pool_indices) == 0:
            return pd.DataFrame(), "❌ Pool vide"
        
        # Calcul des scores (tous retournent des numpy arrays ✅)
        s_tf = self._compute_tfidf_score(cv_clean, pool_indices)
        s_be = self._compute_bert_score(cv_clean, pool_indices) if self._use_bert else np.ones(len(pool_indices)) * 0.5
        
        raw_sk = (0.65 * self._compute_skill_score(cv_skills, pool_indices) + 
                  0.20 * self._compute_exp_score(cv_exp, pool_indices) + 
                  0.15 * self._compute_kw_score(cv_words, pool_indices))
        
        # ✅ Convertir raw_sk en numpy array avant reshape
        raw_sk = np.array(raw_sk)
        s_sk = self.scalers['sk'].transform(raw_sk.reshape(-1, 1)).flatten()
        
        # Combinaison des scores
        if self._use_bert:
            final_scores = self.w_opt[0] * s_tf + self.w_opt[1] * s_be + self.w_opt[2] * s_sk
        else:
            total_w = self.w_opt[0] + self.w_opt[2]
            final_scores = (self.w_opt[0]/total_w) * s_tf + (self.w_opt[2]/total_w) * s_sk
        
        # Sélection du top-k
        top_local_idx = np.argsort(final_scores)[::-1][:min(top_k, len(final_scores))]
        top_global_idx = pool_indices[top_local_idx]
        
        # Formatage des résultats
        results = []
        for rank, idx in enumerate(top_global_idx, 1):
            row = self.jobs_pool.iloc[idx]
            job_skills = set(row.get('skills_set', [])) if isinstance(row.get('skills_set'), (list, tuple)) else row.get('skills_set', set())
            matched = list(cv_skills & job_skills)
            missing = list(job_skills - cv_skills)
            
            results.append({
                'rank': rank,
                'job_id': row.get('job_id', row.name),
                'sector': row.get('sector', '—'),
                'job_title': row['job_title'],
                'company': row.get('company', 'Entreprise'),
                'location': row.get('job_location', 'Remote'),
                'exp_level': row.get('exp_level', 'Mid'),
                'match_score': float(final_scores[top_local_idx[rank-1]]),
                'skills_matched': matched[:5],
                'skills_missing': missing[:3]
            })
        
        mode = "BERT✅" if self._use_bert else "BERT❌"
        status = f"✅ {len(cv_skills)} skills | {len(pool_indices)} offres | {sector} | {cv_exp} | {mode}"
        return pd.DataFrame(results), status