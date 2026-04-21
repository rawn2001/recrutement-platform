// src/pages/Candidate/ApplyJob.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../pages/Dashboard/Dashboard.css';

const API = 'http://localhost:3000';

function DashSidebar({ navigate }) {
  return (
    <aside className="dash-sidebar">
      <div className="dash-sidebar-top">
        <div className="dash-logo">
          <div className="dash-logo-mark">TS</div>
          <span className="dash-logo-name">TalentSphere</span>
        </div>
      </div>
      <nav className="dash-nav">
        <div className="dash-nav-section">Navigation</div>
        <button className="dash-nav-item" onClick={() => navigate('/dashboard')}>
          <span className="dash-nav-icon">⬡</span> Tableau de bord
        </button>
        <button className="dash-nav-item active">
          <span className="dash-nav-icon">◎</span> Offres d'emploi
        </button>
        <button className="dash-nav-item" onClick={() => navigate('/candidate/my-applications')}>
          <span className="dash-nav-icon">◷</span> Mes candidatures
        </button>
      </nav>
      <div className="dash-sidebar-btm">
        <button className="dash-logout-btn" onClick={() => { localStorage.clear(); navigate('/login'); }}>
          <span>↩</span> Déconnexion
        </button>
      </div>
    </aside>
  );
}

export default function ApplyJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cv, setCv] = useState(null);
  const [cover, setCover] = useState('');
  const [applying, setApplying] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');

  useEffect(() => {
    axios.get(`${API}/job-offers/${id}`)
      .then(res => setOffer(res.data))
      .catch(() => { setMsg('Offre introuvable'); setMsgType('error'); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!cv) { setMsg('Veuillez uploader votre CV'); setMsgType('error'); return; }
    setApplying(true); setMsg('');
// Dans la fonction handleApply(), remplacez le bloc try par :

try {
  const token = localStorage.getItem('token');
  const fd = new FormData();
  fd.append('cv', cv);
  fd.append('cover_letter', cover);
  
  // 🔹 Affichez un message d'attente informatif
  setMsg('⏳ Analyse IA de votre CV en cours... Cela peut prendre 2-5 minutes. Veuillez patienter.');
  setMsgType('info');
  
  const res = await axios.post(`${API}/job-applications/apply/${id}`, fd, {
    headers: { Authorization: `Bearer ${token}` },
    // ✅ Timeout explicite pour éviter l'annulation prématurée
    timeout: 1800000,  // 30 minutes
  });
  
  // Dans handleApply(), après le succès :
setMsg(`✅ Candidature envoyée avec succès ! Score CV : ${res.data.matching_score}%`);
setMsgType('success');

// ✅✅✅ REDIRECTION AUTOMATIQUE VERS LE QUIZ ✅✅✅
setTimeout(() => {
  navigate(`/quiz/${id}`, { 
    state: { 
      cvScore: res.data.matching_score,
      jobTitle: offer.title,
      skills: offer.required_skills 
    } 
  });
}, 1500); // Attend 1.5s pour que l'utilisateur voie le message
  
} catch (err) {
  // 🔹 Gestion d'erreur améliorée
  if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
    setMsg('⚠️ L\'analyse prend plus de temps que prévu. Votre candidature a été reçue et sera traitée.');
    setMsgType('warning');
    // Optionnel : rediriger quand même
    setTimeout(() => navigate('/candidate/my-applications'), 3000);
  } else {
    setMsg(err.response?.data?.message || 'Erreur lors de l\'envoi');
    setMsgType('error');
  }
} finally {
  setApplying(false);
}
  };

  if (loading) return (
    <div className="dash-loading">
      <div className="dash-spinner" />
      <span>Chargement de l'offre</span>
    </div>
  );

  return (
    <div className="dash-layout">
      <DashSidebar navigate={navigate} />
      <div className="dash-main">
        <header className="dash-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn-back" onClick={() => navigate('/candidate/jobs')} style={{ marginTop: 0 }}>
              ← Retour
            </button>
            <span className="dash-page-title">{offer?.title || 'Détail offre'}</span>
          </div>
        </header>
        <main className="dash-content">
          {!offer ? (
            <div className="empty-state">
              <div className="icon">◎</div>
              <p>Offre introuvable.</p>
            </div>
          ) : (
            <div className="job-detail-layout">
              {/* Left: Job Info */}
              <div className="job-detail-main" style={{ animation: 'fadeUp .4s var(--ease) both' }}>
                <div className="job-badges" style={{ marginBottom: 14 }}>
                  {offer.employment_type && <span className="job-badge type">{offer.employment_type}</span>}
                  {offer.experience_level && <span className="job-badge level">{offer.experience_level}</span>}
                  {offer.location && <span className="job-badge location">📍 {offer.location}</span>}
                  {offer.salary_range && <span className="job-badge">💰 {offer.salary_range}</span>}
                </div>

                <h1 className="job-detail-title">{offer.title}</h1>

                {offer.application_deadline && (
                  <p style={{ fontSize: 13, color: 'var(--tx-muted)', marginBottom: 0 }}>
                    📅 Date limite : {new Date(offer.application_deadline).toLocaleDateString('fr-FR')}
                  </p>
                )}

                {offer.description && (
                  <div className="job-detail-section">
                    <h3>📋 Description du poste</h3>
                    <p style={{ whiteSpace: 'pre-line' }}>{offer.description}</p>
                  </div>
                )}

                {offer.required_skills?.length > 0 && (
                  <div className="job-detail-section">
                    <h3>🎯 Compétences requises</h3>
                    <div className="job-skills" style={{ marginTop: 8 }}>
                      {offer.required_skills.map((s, i) => (
                        <span key={i} className="skill-chip" style={{ padding: '6px 14px', fontSize: 13 }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {offer.benefits && (
                  <div className="job-detail-section">
                    <h3>🎁 Avantages</h3>
                    <p>{offer.benefits}</p>
                  </div>
                )}
              </div>

              {/* Right: Apply Card */}
              <div className="job-detail-sidebar" style={{ animation: 'fadeUp .4s .1s var(--ease) both' }}>
                <div className="apply-card">
                  <h3>📤 Postuler à cette offre</h3>

                  {msg && (
                    <div className={`alert ${msgType === 'success' ? 'alert-success' : 'alert-error'}`}>
                      {msg}
                    </div>
                  )}

                  <form onSubmit={handleApply}>
                    <div className="form-field">
                      <label>CV (PDF / DOC) *</label>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={e => setCv(e.target.files[0])}
                        required
                      />
                      {cv && (
                        <span style={{ fontSize: 12, color: 'var(--emerald)', marginTop: 4 }}>
                          ✓ {cv.name}
                        </span>
                      )}
                    </div>

                    <div className="form-field">
                      <label>Lettre de motivation (optionnel)</label>
                      <textarea
                        value={cover}
                        onChange={e => setCover(e.target.value)}
                        rows={4}
                        placeholder="Expliquez pourquoi vous êtes le candidat idéal..."
                      />
                    </div>

                    <button type="submit" className="btn-submit" disabled={applying}>
                      {applying ? '⏳ Envoi en cours...' : '🚀 Envoyer ma candidature'}
                    </button>
                  </form>
                </div>

                {/* Info card */}
                <div className="apply-card" style={{ background: 'var(--primary-bg)', border: '1px solid rgba(108,99,255,0.2)' }}>
                  <h3 style={{ color: 'var(--primary-light)', fontSize: 13 }}>💡 Comment ça marche ?</h3>
                  <ul style={{ paddingLeft: 16, fontSize: 13, color: 'var(--tx-secondary)', lineHeight: 1.8 }}>
                    <li>Uploadez votre CV</li>
                    <li>Notre IA analyse la compatibilité</li>
                    <li>Le recruteur reçoit votre dossier</li>
                    <li>Suivez l'état dans "Mes candidatures"</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}