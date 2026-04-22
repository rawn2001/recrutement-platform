// src/pages/Candidate/CvAdviceModal.jsx
import { useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:3000';

export default function CvAdviceModal({ onClose, job = null }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!file) { setError('Veuillez sélectionner un CV'); return; }
    setLoading(true); setError(''); setResult(null);

    const fd = new FormData();
    fd.append('cv', file);
    
    // ✅ Envoie aussi les détails de l'offre pour des conseils personnalisés
    if (job) {
      fd.append('job_title', job.title || '');
      fd.append('job_skills', JSON.stringify(job.required_skills || []));
      fd.append('job_description', job.description || '');
    }

    try {
      const token = localStorage.getItem('token');
      // ✅ Appel à l'endpoint qui accepte job_text
      const res = await axios.post(`${API}/ml-advice/analyze`, fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur analyse IA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', 
      display: 'flex', alignItems: 'center', justifyContent: 'center', 
      zIndex: 2000, padding: 20
    }}>
      <div style={{ 
        background: '#fff', borderRadius: 16, padding: 24, 
        maxWidth: 520, width: '100%', maxHeight: '90vh', overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>
            💡 Conseils pour <strong>{job?.title || 'cette offre'}</strong>
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>

        {!result ? (
          <>
            {/* Upload CV */}
            <div style={{ border: '2px dashed #ccc', borderRadius: 12, padding: 20, textAlign: 'center', marginBottom: 16 }}>
              <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={e => setFile(e.target.files[0])} style={{ display: 'none' }} id="cv-advice-input" />
              <label htmlFor="cv-advice-input" style={{ cursor: 'pointer', color: '#5B5FE8', fontWeight: 500 }}>
                {file ? `✅ ${file.name}` : '📄 Cliquer pour uploader votre CV'}
              </label>
              <div style={{ fontSize: 11, color: '#999', marginTop: 6 }}>
                PDF, DOCX ou TXT · Max 15MB
              </div>
            </div>

            {/* Info sur l'offre cible */}
            {job && (
              <div style={{ 
                background: 'var(--primary-bg)', padding: 12, borderRadius: 10, 
                marginBottom: 16, fontSize: 12, color: 'var(--tx-secondary)'
              }}>
                <strong>🎯 Offre cible :</strong> {job.title}<br/>
                <strong>Compétences requises :</strong> {(job.required_skills || []).slice(0, 5).join(', ')}
                {(job.required_skills || []).length > 5 && '...'}
              </div>
            )}

            {error && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 12 }}>{error}</p>}
            
            <button 
              onClick={handleAnalyze} 
              disabled={loading || !file}
              style={{ 
                width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                background: loading || !file ? '#ccc' : '#5B5FE8', color: '#fff',
                fontWeight: 600, cursor: loading || !file ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? '🤖 Analyse en cours...' : '🔍 Analyser mon CV pour cette offre'}
            </button>
          </>
        ) : (
          <div style={{ textAlign: 'left' }}>
            {/* Score de compatibilité */}
            <div style={{ 
              background: result.score_competences >= 70 ? '#ECFDF5' : result.score_competences >= 40 ? '#FFFBEB' : '#FEF2F2',
              padding: 14, borderRadius: 12, marginBottom: 16,
              border: `1px solid ${result.score_competences >= 70 ? '#A7F3D0' : result.score_competences >= 40 ? '#FDE68A' : '#FECACA'}`
            }}>
              <div style={{ fontWeight: 600, color: '#111' }}>
                Score de compatibilité : <span style={{ color: result.score_competences >= 70 ? '#059669' : result.score_competences >= 40 ? '#D97706' : '#DC2626' }}>{result.score_competences}%</span>
              </div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                {result.matched_skills}/{result.total_skills} compétences maîtrisées pour <strong>{result.metier}</strong>
              </div>
            </div>

            {/* Compétences manquantes */}
            {result.manquants.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 500, color: '#333', marginBottom: 8 }}>📉 À renforcer pour cette offre :</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {result.manquants.map((m, i) => (
                    <span key={i} style={{
                      background: '#FFF7ED', color: '#C2410C', padding: '4px 10px',
                      borderRadius: 20, fontSize: 11, fontWeight: 500, border: '1px solid #FED7AA'
                    }}>
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Conseils personnalisés */}
            <div style={{ 
              background: '#F0FDF4', padding: 16, borderRadius: 12, 
              whiteSpace: 'pre-line', fontSize: 13, lineHeight: 1.6, color: '#065F46',
              border: '1px solid #A7F3D0', marginBottom: 20
            }}>
              {result.conseils}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => { setResult(null); setFile(null); }}
                style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}
              >
                🔄 Nouvelle analyse
              </button>
              <button
                onClick={onClose}
                style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#5B5FE8', color: '#fff', fontWeight: 500, cursor: 'pointer' }}
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}