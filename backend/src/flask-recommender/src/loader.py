# backend/src/flask-recommender/src/loader.py
import joblib, pandas as pd, numpy as np, os, sys, traceback, logging, requests
from config import Config
from sklearn.exceptions import NotFittedError

logger = logging.getLogger(__name__)

class ModelLoader:
    _instance = None
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized: return
        logger.info("🔄 Initialisation ModelLoader...")
        
        # Pipeline
        self.pipeline = joblib.load(Config.PIPELINE_PATH)
        logger.info("✅ Pipeline chargé")
        
        # 🗑️ PLUS DE jobs.parquet → on charge depuis NestJS via app.py
        self.jobs_pool = pd.DataFrame()  # Sera rempli par app.py
        self._bert_available = False
        self.bert_model = None
        self.emb_all_pool = None
        
        # BERT lazy loading
        skip_bert = os.getenv("SKIP_BERT", "0") == "1"
        if not skip_bert:
            try:
                from sentence_transformers import SentenceTransformer
                self.bert_model = SentenceTransformer(
                    Config.BERT_MODEL_NAME, 
                    device='cpu', 
                    cache_folder=os.path.join(os.getcwd(), '.cache', 'sentence_transformers')
                )
                self._bert_available = True
                logger.info("✅ BERT prêt en mode LAZY")
            except Exception as e:
                logger.warning(f"⚠️ BERT indisponible: {e}")
        
        self._initialized = True
        mode = "COMPLET (BERT✅)" if self._bert_available else "DÉGRADÉ (BERT❌)"
        logger.info(f"✅ ModelLoader prêt ! Mode: {mode}")
    
    def set_jobs_pool(self, df: pd.DataFrame):
        """✅ Setter pour injecter les offres live depuis NestJS"""
        self.jobs_pool = df.reset_index(drop=True)
        if 'skills' in self.jobs_pool.columns and 'skills_set' not in self.jobs_pool.columns:
            self.jobs_pool['skills_set'] = self.jobs_pool['skills'].apply(
                lambda x: set(x) if isinstance(x, (list, tuple)) else set()
            )
        if 'exp_level' in self.jobs_pool.columns and 'exp_num' not in self.jobs_pool.columns:
            exp_order = self.pipeline.get('EXP_ORDER', {'Internship':1, 'Junior':2, 'Mid':3, 'Senior':4})
            self.jobs_pool['exp_num'] = self.jobs_pool['exp_level'].map(exp_order).fillna(2)
    
    def get_pipeline(self): return self.pipeline
    def get_jobs_pool(self): return self.jobs_pool
    def get_bert_model(self): return self.bert_model
    def is_bert_available(self): return self._bert_available
    def get_tfidf_pool(self):
        if self.jobs_pool.empty:
            return None
        return self.pipeline['tfidf'].transform(self.jobs_pool['cleaned_text'].tolist())
    def get_bert_pool(self): return None  # Lazy loading