// frontend/src/pages/Candidate/Recommendations/RecommendationsPage.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // ✅ Déjà importé

const RECOMMENDER_API = 'http://127.0.0.1:5004';

export default function RecommendationsPage() {
  const [cvText, setCvText] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  
  const navigate = useNavigate(); // ✅ Déjà déclaré

  const handleFileChange = async (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setLoading(true); setError('');
    
    const formData = new FormData();
    formData.append('file', selected);
    try {
      const res = await axios.post(`${RECOMMENDER_API}/api/extract-pdf`, formData);
      setCvText(res.data.text);
    } catch { setError('❌ Échec extraction PDF'); }
    finally { setLoading(false); }
  };

  const handleRecommend = async () => {
    if (!cvText.trim()) return setError('Veuillez uploader un CV ou coller le texte');
    setLoading(true); setError('');
    try {
      const res = await axios.post(`${RECOMMENDER_API}/api/recommend`, {
        cv_text: cvText,
        top_k: 3,
        sector: 'Tous'
      });
      if (res.data.success) setResults(res.data.results);
      else setError(res.data.error || 'Aucun match trouvé');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur réseau');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>🎯 Recommandation de Métiers</h2>
      <p style={{ color: '#64748b', marginBottom: 24 }}>
        Uploade ton CV pour découvrir les **3 offres** qui matchent le mieux.
      </p>

      <input type="file" accept=".pdf" onChange={handleFileChange} style={{ marginBottom: 12, padding: 8, border: '1px solid #e2e8f0', borderRadius: 8 }} />
      
      <textarea
        value={cvText} onChange={e => setCvText(e.target.value)}
        placeholder="Ou colle le texte de ton CV ici..."
        style={{ width: '100%', minHeight: 120, padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, marginBottom: 12 }}
      />

      <button onClick={handleRecommend} disabled={loading || !cvText.trim()} style={{
        padding: '10px 20px', borderRadius: 8, border: 'none',
        background: loading ? '#cbd5e1' : 'var(--primary, #667eea)',
        color: '#fff', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', width: '100%'
      }}>
        {loading ? '⏳ Analyse en cours...' : '🔍 Trouver les Top 3 Métiers'}
      </button>

      {error && <p style={{ color: '#ef4444', marginTop: 12, textAlign: 'center' }}>{error}</p>}

      {results.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>✅ {results.length} offre{results.length > 1 ? 's' : ''} trouvée{results.length > 1 ? 's' : ''}</h3>
          {results.map((job, i) => (
            <div key={job.job_id || i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: 0 }}>{job.job_title}</h4>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>
                    {job.company} • {job.job_location} • {job.exp_level}
                  </p>
                </div>
                <div style={{
                  padding: '6px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700,
                  background: job.match_score >= 0.7 ? '#dcfce7' : job.match_score >= 0.4 ? '#fef3c7' : '#fee2e2',
                  color: job.match_score >= 0.7 ? '#166534' : job.match_score >= 0.4 ? '#92400e' : '#991b1b'
                }}>
                  {Math.round(job.match_score * 100)}% match
                </div>
              </div>
              {job.matched_skills?.length > 0 && (
                <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {job.matched_skills.slice(0, 5).map((skill, idx) => (
                    <span key={idx} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: '#f1f5f9' }}>
                      ✅ {skill}
                    </span>
                  ))}
                </div>
              )}
              
              {/* ✅ CORRECTION: Remplacer <a href> par <button> avec useNavigate */}
              <button
                onClick={() => navigate(`/candidate/jobs/${job.job_id}`)}
                style={{
                  display: 'inline-block', 
                  marginTop: 12, 
                  padding: '8px 16px', 
                  borderRadius: 8,
                  background: 'var(--primary, #667eea)', 
                  color: '#fff', 
                  fontSize: 13, 
                  fontWeight: 500,
                  border: 'none', 
                  cursor: 'pointer',
                  textDecoration: 'none'
                }}
              >
                Voir l'offre & Postuler →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}