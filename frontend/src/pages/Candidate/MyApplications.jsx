// src/pages/Candidate/MyApplications.jsx
import { useEffect, useState } from 'react';
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
        <button className="dash-nav-item" onClick={() => navigate('/candidate/jobs')}>
          <span className="dash-nav-icon">◎</span> Offres d'emploi
        </button>
        <button className="dash-nav-item active">
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

const STATUS_META = {
  pending:   { label: 'En attente',  cls: 'status-pending'  },
  reviewed:  { label: 'Lu',          cls: 'status-reviewed' },
  interview: { label: 'Entretien',   cls: 'status-interview'},
  accepted:  { label: 'Accepté',     cls: 'status-accepted' },
  rejected:  { label: 'Refusé',      cls: 'status-rejected' },
};

function scoreClass(n) {
  if (n >= 80) return 'score-high';
  if (n >= 55) return 'score-mid';
  return 'score-low';
}

export default function MyApplications() {
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`${API}/job-applications/my-applications`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setApps(res.data))
      .finally(() => setLoading(false));
  }, []);

  const accepted = apps.filter(a => a.status === 'accepted').length;
  const pending  = apps.filter(a => a.status === 'pending').length;
  const avgScore = apps.length
    ? Math.round(apps.reduce((s, a) => s + (a.matching_score || 0), 0) / apps.length)
    : 0;

  if (loading) return (
    <div className="dash-loading">
      <div className="dash-spinner" />
      <span>Chargement</span>
    </div>
  );

  return (
    <div className="dash-layout">
      <DashSidebar navigate={navigate} />
      <div className="dash-main">
        <header className="dash-topbar">
          <div className="dash-page-title">Mes candidatures</div>
          <div className="dash-topbar-right">
            <button className="btn-apply" onClick={() => navigate('/candidate/jobs')}>
              + Nouvelles offres
            </button>
          </div>
        </header>
        <main className="dash-content">
          <div className="page-layout">
            {/* Summary stats */}
            {apps.length > 0 && (
              <div className="dash-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {[
                  { icon: '◷', label: 'Total',       value: apps.length, accent: 'var(--primary)',  accentBg: 'var(--primary-bg)'  },
                  { icon: '✓', label: 'Accepté(s)',   value: accepted,    accent: 'var(--emerald)',  accentBg: 'var(--emerald-bg)' },
                  { icon: '⏳', label: 'En attente',  value: pending,     accent: 'var(--amber)',    accentBg: 'var(--amber-bg)'   },
                  { icon: '⬡', label: 'Score moyen',  value: `${avgScore}%`, accent: 'var(--sky)', accentBg: 'var(--sky-bg)'     },
                ].map((s, i) => (
                  <div className="dash-stat-card" key={i} style={{ '--accent': s.accent, '--accent-bg': s.accentBg }}>
                    <div className="dash-stat-icon-wrap" style={{ background: s.accentBg }}>
                      <span style={{ color: s.accent, fontSize: 18 }}>{s.icon}</span>
                    </div>
                    <div className="dash-stat-value">{s.value}</div>
                    <div className="dash-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="page-header">
              <div>
                <h1>Suivi de mes candidatures</h1>
                <p>{apps.length} candidature{apps.length !== 1 ? 's' : ''} envoyée{apps.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {apps.length === 0 ? (
              <div className="empty-state" style={{ padding: '60px 20px' }}>
                <div className="icon">◷</div>
                <p style={{ marginBottom: 20 }}>Vous n'avez encore postulé à aucune offre.</p>
                <button className="btn-apply" onClick={() => navigate('/candidate/jobs')}>
                  Parcourir les offres →
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {apps.map((a, idx) => {
                  const meta = STATUS_META[a.status] || { label: a.status, cls: 'status-pending' };
                  const score = a.matching_score || 0;
                  return (
                    <div
                      className="app-card"
                      key={a.id}
                      style={{ animation: `fadeUp .4s ${idx * 0.05}s var(--ease) both` }}
                    >
                      <div style={{
                        width: 4, alignSelf: 'stretch', borderRadius: 4, flexShrink: 0,
                        background: score >= 80 ? 'var(--emerald)' : score >= 55 ? 'var(--amber)' : 'var(--rose)',
                        opacity: .6
                      }} />

                      <div className="app-card-left">
                        <div className="app-card-title">{a.jobOffer?.title || 'Poste inconnu'}</div>
                        <div className="app-card-meta">
                          {a.jobOffer?.employment_type && (
                            <span className="job-badge type" style={{ fontSize: 11 }}>{a.jobOffer.employment_type}</span>
                          )}
                          {a.jobOffer?.location && (
                            <span style={{ color: 'var(--tx-muted)', fontSize: 12 }}>📍 {a.jobOffer.location}</span>
                          )}
                          <span style={{ color: 'var(--tx-muted)', fontSize: 12 }}>
                            📅 {new Date(a.applied_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                        <div className="score-ring">
                          <div className={`score-badge ${scoreClass(score)}`}>{score}%</div>
                          <div className="score-label">Score IA</div>
                        </div>
                        <span className={`status-pill ${meta.cls}`}>{meta.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}