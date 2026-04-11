// src/pages/Recruiter/PostJob.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
          <span className="dash-nav-icon">✦</span> Publier une offre
        </button>
        <button className="dash-nav-item" onClick={() => navigate('/recruiter/manage')}>
          <span className="dash-nav-icon">◈</span> Gérer candidatures
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

export default function PostJob() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', skills: '',
    type: 'CDI', level: 'Mid', location: '',
    salary: '', deadline: ''
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/job-offers`, {
        title: form.title,
        description: form.description,
        required_skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        employment_type: form.type,
        experience_level: form.level,
        location: form.location,
        salary_range: form.salary,
        application_deadline: form.deadline ? new Date(form.deadline).toISOString() : null
      }, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess('✅ Offre publiée avec succès !');
      setTimeout(() => navigate('/recruiter/manage'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la publication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dash-layout">
      <DashSidebar navigate={navigate} />
      <div className="dash-main">
        <header className="dash-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn-back" onClick={() => navigate('/dashboard')} style={{ marginTop: 0 }}>
              ← Retour
            </button>
            <span className="dash-page-title">Publier une offre</span>
          </div>
        </header>
        <main className="dash-content">
          <div style={{ animation: 'fadeUp .4s var(--ease) both' }}>
            <div className="post-job-layout">
              {/* Form */}
              <div className="post-job-form">
                <h2>✦ Nouvelle offre d'emploi</h2>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="form-field" style={{ marginBottom: 16 }}>
                    <label>Titre du poste *</label>
                    <input
                      name="title" value={form.title} onChange={handleChange}
                      required placeholder="Ex: Développeur React Senior"
                    />
                  </div>

                  <div className="form-field" style={{ marginBottom: 16 }}>
                    <label>Description du poste *</label>
                    <textarea
                      name="description" value={form.description} onChange={handleChange}
                      rows={6} required
                      placeholder="Décrivez les responsabilités, l'environnement de travail..."
                      style={{ padding: '12px 14px', borderRadius: 'var(--r-md)', background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--tx-primary)', fontSize: '13.5px', fontFamily: 'var(--f-body)', resize: 'vertical', outline: 'none', lineHeight: 1.6, width: '100%', transition: 'border-color .2s' }}
                      onFocus={e => e.target.style.borderColor = 'rgba(108,99,255,0.4)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                  </div>

                  <div className="form-field" style={{ marginBottom: 16 }}>
                    <label>Compétences requises (séparées par virgules)</label>
                    <input
                      name="skills" value={form.skills} onChange={handleChange}
                      placeholder="Ex: React, Node.js, Git, SQL"
                    />
                  </div>

                  <div className="form-grid" style={{ marginBottom: 16 }}>
                    <div className="form-field">
                      <label>Type de contrat</label>
                      <select name="type" value={form.type} onChange={handleChange}>
                        <option value="CDI">CDI</option>
                        <option value="CDD">CDD</option>
                        <option value="Stage">Stage</option>
                        <option value="Freelance">Freelance</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label>Niveau d'expérience</label>
                      <select name="level" value={form.level} onChange={handleChange}>
                        <option value="Junior">Junior</option>
                        <option value="Mid">Confirmé</option>
                        <option value="Senior">Senior</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-grid" style={{ marginBottom: 16 }}>
                    <div className="form-field">
                      <label>Localisation</label>
                      <input name="location" value={form.location} onChange={handleChange} placeholder="Tunis, Remote, Sfax..." />
                    </div>
                    <div className="form-field">
                      <label>Fourchette salariale</label>
                      <input name="salary" value={form.salary} onChange={handleChange} placeholder="Ex: 2000–3500 TND" />
                    </div>
                  </div>

                  <div className="form-field" style={{ marginBottom: 22 }}>
                    <label>Date limite de candidature (optionnel)</label>
                    <input type="date" name="deadline" value={form.deadline} onChange={handleChange} />
                  </div>

                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={loading}
                    style={{ fontSize: 15 }}
                  >
                    {loading ? '⏳ Publication en cours...' : '🚀 Publier l\'offre'}
                  </button>
                </form>
              </div>

              {/* Tips */}
              <div className="tips-card" style={{ animation: 'fadeUp .4s .1s var(--ease) both' }}>
                <h3>💡 Conseils pour une bonne offre</h3>
                <ul>
                  <li>Soyez précis dans le titre du poste</li>
                  <li>Listez les compétences clés séparées par virgules</li>
                  <li>Une description claire attire plus de candidats qualifiés</li>
                  <li>Indiquez le salaire pour plus de visibilité</li>
                  <li>Précisez si le poste est remote ou sur site</li>
                </ul>

                <div style={{
                  marginTop: 20, padding: 14, borderRadius: 'var(--r-lg)',
                  background: 'var(--primary-bg)', border: '1px solid rgba(108,99,255,0.2)'
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-light)', marginBottom: 6 }}>
                    ⬡ Score IA automatique
                  </div>
                  <p style={{ fontSize: 12.5, color: 'var(--tx-secondary)', lineHeight: 1.7 }}>
                    Chaque candidature reçoit automatiquement un score de compatibilité IA basé sur le CV et les compétences requises.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}