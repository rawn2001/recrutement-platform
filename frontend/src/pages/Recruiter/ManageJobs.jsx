// src/pages/Recruiter/ManageJobs.jsx
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
        <button className="dash-nav-item" onClick={() => navigate('/recruiter/post')}>
          <span className="dash-nav-icon">✦</span> Publier une offre
        </button>
        <button className="dash-nav-item active">
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

function ScoreBadge({ score }) {
  const n = score || 0;
  const cls = n >= 80 ? 'score-high' : n >= 55 ? 'score-mid' : 'score-low';
  return <span className={`score-badge ${cls}`}>{n}%</span>;
}

function StatusPill({ status }) {
  const map = {
    pending:   { label: 'En attente',  cls: 'status-pending'   },
    reviewed:  { label: 'Lu',          cls: 'status-reviewed'  },
    interview: { label: 'Entretien',   cls: 'status-interview' },
    accepted:  { label: 'Accepté',     cls: 'status-accepted'  },
    rejected:  { label: 'Refusé',      cls: 'status-rejected'  },
  };
  const m = map[status] || { label: status, cls: 'status-pending' };
  return <span className={`status-pill ${m.cls}`}>{m.label}</span>;
}

export default function ManageJobs() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [candidatesMap, setCandidatesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [updating, setUpdating] = useState(null);

  const fetchAll = async () => {
    const token = localStorage.getItem('token');
    const r = await axios.get(`${API}/job-offers/my-offers`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setOffers(r.data);
    const map = {};
    await Promise.all(r.data.map(async o => {
      const res = await axios.get(`${API}/job-applications/job-offer/${o.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      map[o.id] = res.data;
    }));
    setCandidatesMap(map);
  };

  useEffect(() => {
    fetchAll().finally(() => setLoading(false));
  }, []);

  const updateStatus = async (appId, status) => {
    setUpdating(appId);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/job-applications/${appId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchAll();
    } catch {
      alert('Erreur lors de la mise à jour du statut');
    } finally {
      setUpdating(null);
    }
  };

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const totalCandidatures = Object.values(candidatesMap).reduce((s, arr) => s + arr.length, 0);

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
          <div className="dash-page-title">Gérer les candidatures</div>
          <div className="dash-topbar-right">
            <button className="btn-apply" onClick={() => navigate('/recruiter/post')}>
              + Nouvelle offre
            </button>
          </div>
        </header>
        <main className="dash-content">
          <div className="page-layout">
            {/* Stats */}
            <div className="dash-stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
              {[
                { icon: '✦', label: 'Offres publiées',     value: offers.length,        accent: 'var(--primary)',  bg: 'var(--primary-bg)'  },
                { icon: '◷', label: 'Total candidatures',  value: totalCandidatures,    accent: 'var(--emerald)',  bg: 'var(--emerald-bg)' },
                { icon: '◎', label: 'Offres actives',      value: offers.filter(o=>o.is_active).length, accent: 'var(--sky)', bg: 'var(--sky-bg)' },
              ].map((s, i) => (
                <div className="dash-stat-card" key={i} style={{ '--accent': s.accent, '--accent-bg': s.bg }}>
                  <div className="dash-stat-icon-wrap" style={{ background: s.bg }}>
                    <span style={{ color: s.accent, fontSize: 18 }}>{s.icon}</span>
                  </div>
                  <div className="dash-stat-value">{s.value}</div>
                  <div className="dash-stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="page-header">
              <div>
                <h1>Vos offres & candidatures</h1>
                <p>Cliquez sur une offre pour voir les candidats</p>
              </div>
            </div>

            {offers.length === 0 ? (
              <div className="empty-state" style={{ padding: '60px 20px' }}>
                <div className="icon">✦</div>
                <p style={{ marginBottom: 20 }}>Vous n'avez pas encore publié d'offre.</p>
                <button className="btn-apply" onClick={() => navigate('/recruiter/post')}>
                  Publier ma première offre →
                </button>
              </div>
            ) : (
              offers.map((offer, idx) => {
                const candidates = candidatesMap[offer.id] || [];
                const isOpen = expanded[offer.id];
                return (
                  <div
                    className="offer-block"
                    key={offer.id}
                    style={{ animation: `fadeUp .4s ${idx * 0.06}s var(--ease) both` }}
                  >
                    {/* Offer Header */}
                    <div className="offer-block-header" onClick={() => toggleExpand(offer.id)}>
                      <div style={{ flex: 1 }}>
                        <div className="offer-block-title">{offer.title}</div>
                        <div className="offer-block-meta">
                          {offer.employment_type && <span style={{ marginRight: 10 }}>{offer.employment_type}</span>}
                          {offer.location && <span>📍 {offer.location}</span>}
                          <span style={{ marginLeft: 10, color: 'var(--tx-muted)' }}>
                            {candidates.length} candidature{candidates.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <div className="offer-block-badges">
                        {offer.is_active
                          ? <><div className="active-dot" /><span style={{ fontSize: 12, color: 'var(--emerald)' }}>Active</span></>
                          : <><div className="inactive-dot" /><span style={{ fontSize: 12, color: 'var(--rose)' }}>Inactive</span></>
                        }
                        <span style={{ fontSize: 14, color: 'var(--tx-muted)', marginLeft: 8 }}>
                          {isOpen ? '▲' : '▼'}
                        </span>
                      </div>
                    </div>

                    {/* Candidates Table */}
                    {isOpen && (
                      <div style={{ padding: '0 0 4px' }}>
                        {candidates.length === 0 ? (
                          <div className="empty-state" style={{ padding: '24px' }}>
                            <p>Aucune candidature reçue pour cette offre.</p>
                          </div>
                        ) : (
                          <table className="candidates-table">
                            <thead>
                              <tr>
                                <th>Candidat</th>
                                <th>CV</th>
                                <th>Score IA</th>
                                <th>Statut</th>
                                <th>Actions</th>
                                <th>Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {candidates
                                .sort((a, b) => (b.matching_score || 0) - (a.matching_score || 0))
                                .map(app => (
                                <tr key={app.id}>
                                  <td>
                                    <div className="cand-name">
                                      {app.candidate?.prenom || app.candidate?.first_name || 'Candidat'}
                                    </div>
                                    <div className="cand-email">{app.candidate?.email}</div>
                                  </td>
                                  <td>
                                    {app.cv_filename ? (
                                      <span style={{ color: 'var(--primary-light)', fontSize: 13 }}>
                                        📄 {app.cv_filename}
                                      </span>
                                    ) : <span style={{ color: 'var(--tx-muted)' }}>—</span>}
                                  </td>
                                  <td>
                                    <ScoreBadge score={app.matching_score} />
                                  </td>
                                  <td>
                                    <StatusPill status={app.status} />
                                  </td>
                                  <td>
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                      {app.status !== 'accepted' && (
                                        <button
                                          className="action-btn action-accept"
                                          disabled={updating === app.id}
                                          onClick={() => updateStatus(app.id, 'accepted')}
                                        >
                                          {updating === app.id ? '...' : '✓ Accepter'}
                                        </button>
                                      )}
                                      {app.status !== 'rejected' && (
                                        <button
                                          className="action-btn action-reject"
                                          disabled={updating === app.id}
                                          onClick={() => updateStatus(app.id, 'rejected')}
                                        >
                                          {updating === app.id ? '...' : '✕ Refuser'}
                                        </button>
                                      )}
                                      {app.status !== 'interview' && app.status !== 'rejected' && (
                                        <button
                                          className="action-btn"
                                          style={{ background: 'var(--primary-bg)', color: 'var(--primary-light)', border: '1px solid rgba(108,99,255,0.2)' }}
                                          disabled={updating === app.id}
                                          onClick={() => updateStatus(app.id, 'interview')}
                                        >
                                          🎥 Entretien
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                  <td style={{ color: 'var(--tx-muted)', fontSize: 12 }}>
                                    {new Date(app.applied_at).toLocaleDateString('fr-FR')}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>
    </div>
  );
}