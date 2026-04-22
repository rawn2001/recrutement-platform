// src/pages/Recruiter/ManageJobs.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../pages/Dashboard/Dashboard.css';

const API = 'http://localhost:3000';

/* ── SIDEBAR (design amélioré) ── */
function DashSidebar({ navigate }) {
  return (
    <aside className="dash-sidebar" style={{ 
      borderRight: '1px solid var(--border)',
      background: 'var(--card-bg, #fff)',
      boxShadow: '2px 0 12px rgba(0,0,0,0.04)'
    }}>
      <div className="dash-sidebar-top">
        <div className="dash-logo" style={{ padding: '8px 0' }}>
          <div className="dash-logo-mark" style={{ 
            background: 'var(--primary)', 
            boxShadow: '0 2px 8px rgba(108,99,255,0.3)'
          }}>TS</div>
          <span className="dash-logo-name">TalentSphere</span>
        </div>
      </div>
      <nav className="dash-nav">
        <div className="dash-nav-section" style={{ 
          fontSize: 10, fontWeight: 600, color: 'var(--tx-muted)',
          textTransform: 'uppercase', letterSpacing: '0.08em',
          padding: '0 16px 8px', marginTop: 8
        }}>Navigation</div>
        {[
          { icon: '⬡', label: 'Tableau de bord', path: '/dashboard' },
          { icon: '✦', label: 'Publier une offre', path: '/recruiter/post' },
          { icon: '◈', label: 'Gérer candidatures', path: null, active: true },
        ].map((item, i) => (
          <button 
            key={i}
            className={`dash-nav-item${item.active ? ' active' : ''}`} 
            onClick={() => item.path && navigate(item.path)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 16px', borderRadius: 8,
              background: item.active ? 'var(--primary-bg)' : 'transparent',
              color: item.active ? 'var(--primary)' : 'var(--tx)',
              fontWeight: item.active ? 500 : 400,
              border: item.active ? '1px solid var(--primary-light)' : 'none',
              transition: 'all 0.15s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!item.active) {
                e.currentTarget.style.background = 'var(--bg-hover, #f8f9fb)';
                e.currentTarget.style.color = 'var(--primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (!item.active) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--tx)';
              }
            }}
          >
            <span className="dash-nav-icon" style={{ 
              fontSize: 14, opacity: item.active ? 1 : 0.7 
            }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="dash-sidebar-btm">
        <button 
          className="dash-logout-btn" 
          onClick={() => { localStorage.clear(); navigate('/login'); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 16px', borderRadius: 8,
            color: 'var(--tx-muted)', fontSize: 12,
            border: '1px solid var(--border)',
            background: 'transparent', cursor: 'pointer',
            transition: 'all 0.15s ease',
            width: 'calc(100% - 32px)', margin: '0 16px 16px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--rose-bg)';
            e.currentTarget.style.color = 'var(--rose)';
            e.currentTarget.style.borderColor = 'var(--rose-light)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--tx-muted)';
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          <span style={{ fontSize: 14 }}>↩</span> Déconnexion
        </button>
      </div>
    </aside>
  );
}

/* ── SCORE BADGE (design amélioré) ── */
function ScoreBadge({ score }) {
  const n = score ?? 0;
  const cfg = n >= 80 
    ? { bg: 'var(--emerald-bg)', color: 'var(--emerald)', border: 'var(--emerald-light)' }
    : n >= 55 
    ? { bg: 'var(--amber-bg)', color: 'var(--amber)', border: 'var(--amber-light)' }
    : { bg: 'var(--rose-bg)', color: 'var(--rose)', border: 'var(--rose-light)' };
    
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 48, padding: '4px 12px', borderRadius: 20,
      fontSize: 12, fontWeight: 600, fontFamily: 'monospace',
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`,
      boxShadow: `0 1px 3px ${cfg.bg.replace('bg)', '00)')}`,
      transition: 'transform 0.1s ease',
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      {n}%
    </span>
  );
}

/* ── STATUS PILL (design amélioré) ── */
function StatusPill({ status }) {
  const map = {
    pending:   { label: 'En attente',  bg: 'var(--amber-bg)', color: 'var(--amber)', dot: 'var(--amber)' },
    reviewed:  { label: 'Lu',          bg: 'var(--sky-bg)',   color: 'var(--sky)',   dot: 'var(--sky)' },
    interview: { label: 'Entretien',   bg: 'var(--purple-bg)',color: 'var(--purple)',dot: 'var(--purple)' },
    accepted:  { label: 'Accepté',     bg: 'var(--emerald-bg)',color: 'var(--emerald)',dot: 'var(--emerald)' },
    rejected:  { label: 'Refusé',      bg: 'var(--rose-bg)',  color: 'var(--rose)',  dot: 'var(--rose)' },
  };
  const m = map[status] || map.pending;
  
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 12px', borderRadius: 20,
      fontSize: 11, fontWeight: 500,
      background: m.bg, color: m.color,
      border: `1px solid ${m.bg.replace('bg)', 'light)')}`,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ 
        width: 6, height: 6, borderRadius: '50%', 
        background: m.dot, 
        boxShadow: `0 0 0 2px ${m.bg}`,
        animation: 'pulse 2s infinite'
      }} />
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}`}</style>
      {m.label}
    </span>
  );
}

/* ── ACTION BUTTONS (design amélioré) ── */
function ActionBtn({ label, variant, onClick, disabled }) {
  const styles = {
    accept: { bg: 'var(--emerald)', hover: 'var(--emerald-dark)', text: '#fff' },
    reject: { bg: 'var(--rose)', hover: 'var(--rose-dark)', text: '#fff' },
    interview: { bg: 'var(--purple)', hover: 'var(--purple-dark)', text: '#fff' },
  }[variant] || { bg: 'var(--bg-2)', hover: 'var(--border)', text: 'var(--tx)' };

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        padding: '6px 14px', borderRadius: 8,
        fontSize: 11.5, fontWeight: 500,
        background: disabled ? 'var(--bg-2)' : styles.bg,
        color: styles.text,
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.15s ease',
        boxShadow: disabled ? 'none' : `0 2px 6px ${styles.bg}40`,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = styles.hover;
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = `0 4px 12px ${styles.hover}50`;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = styles.bg;
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = `0 2px 6px ${styles.bg}40`;
        }
      }}
    >
      {disabled ? '…' : label}
    </button>
  );
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
    <div className="dash-loading" style={{ 
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: 'var(--bg)',
    }}>
      <div className="dash-spinner" />
      <span style={{ marginLeft: 12, color: 'var(--tx)', fontSize: 14 }}>Chargement des candidatures…</span>
    </div>
  );

  return (
    <div className="dash-layout" style={{ background: 'var(--bg, #f5f7fa)' }}>
      <DashSidebar navigate={navigate} />
      
      <div className="dash-main" style={{ 
        display: 'flex', flexDirection: 'column', 
        background: 'var(--bg)', minHeight: '100vh'
      }}>
        {/* Topbar */}
        <header className="dash-topbar" style={{
          padding: '0 28px', height: 64,
          background: 'var(--card-bg, #fff)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 1px 0 var(--border)',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--tx)' }}>
              Gérer les candidatures
            </div>
            <div style={{ fontSize: 12, color: 'var(--tx-muted)', marginTop: 2 }}>
              Suivez et évaluez toutes vos offres
            </div>
          </div>
          <button 
            className="btn-apply" 
            onClick={() => navigate('/recruiter/post')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 10,
              background: 'var(--primary)', color: '#fff',
              fontSize: 13, fontWeight: 500,
              border: 'none', cursor: 'pointer',
              boxShadow: '0 2px 8px var(--primary-light)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--primary-dark)';
              e.currentTarget.style.boxShadow = '0 4px 16px var(--primary)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--primary)';
              e.currentTarget.style.boxShadow = '0 2px 8px var(--primary-light)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span style={{ fontSize: 16 }}>+</span> Nouvelle offre
          </button>
        </header>

        {/* Main content */}
        <main className="dash-content" style={{
          flex: 1, padding: '24px 28px 40px',
          overflowY: 'auto',
        }}>
          <div className="page-layout" style={{ maxWidth: 1400, margin: '0 auto' }}>
            
            {/* Stats Cards */}
            <div className="dash-stats-grid" style={{ 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: 16, marginBottom: 24 
            }}>
              {[
                { icon: '✦', label: 'Offres publiées', value: offers.length, accent: 'var(--primary)', bg: 'var(--primary-bg)' },
                { icon: '◷', label: 'Total candidatures', value: totalCandidatures, accent: 'var(--emerald)', bg: 'var(--emerald-bg)' },
                { icon: '◎', label: 'Offres actives', value: offers.filter(o=>o.is_active).length, accent: 'var(--sky)', bg: 'var(--sky-bg)' },
              ].map((s, i) => (
                <div 
                  key={i} 
                  className="dash-stat-card" 
                  style={{
                    background: 'var(--card-bg, #fff)',
                    border: '1px solid var(--border)',
                    borderRadius: 14,
                    padding: '18px 20px',
                    display: 'flex', alignItems: 'center', gap: 16,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                  }}
                >
                  <div 
                    className="dash-stat-icon-wrap" 
                    style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: s.bg, 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 2px 8px ${s.bg.replace('bg)', '00)')}`,
                    }}
                  >
                    <span style={{ color: s.accent, fontSize: 20 }}>{s.icon}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--tx)', lineHeight: 1 }}>
                      {s.value}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--tx-muted)', marginTop: 4 }}>
                      {s.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Section Header */}
            <div className="page-header" style={{
              marginBottom: 20,
              paddingBottom: 16,
              borderBottom: '1px solid var(--border)',
            }}>
              <div>
                <h1 style={{ 
                  fontSize: 20, fontWeight: 600, color: 'var(--tx)',
                  margin: 0, letterSpacing: '-0.02em'
                }}>
                  Vos offres & candidatures
                </h1>
                <p style={{ 
                  fontSize: 13, color: 'var(--tx-muted)', 
                  margin: '6px 0 0', lineHeight: 1.5 
                }}>
                  Cliquez sur une offre pour voir les candidats et leurs scores
                </p>
              </div>
            </div>

            {/* Empty State */}
            {offers.length === 0 ? (
              <div className="empty-state" style={{
                background: 'var(--card-bg, #fff)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: '60px 20px',
                textAlign: 'center',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              }}>
                <div className="icon" style={{
                  width: 64, height: 64, borderRadius: 16,
                  background: 'var(--primary-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: 28, color: 'var(--primary)',
                }}>✦</div>
                <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--tx)', marginBottom: 8 }}>
                  Aucune offre publiée
                </p>
                <p style={{ fontSize: 13, color: 'var(--tx-muted)', marginBottom: 24 }}>
                  Publiez votre première offre pour commencer à recevoir des candidatures.
                </p>
                <button 
                  className="btn-apply" 
                  onClick={() => navigate('/recruiter/post')}
                  style={{
                    padding: '10px 24px', borderRadius: 10,
                    background: 'var(--primary)', color: '#fff',
                    fontSize: 13, fontWeight: 500, border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Publier ma première offre →
                </button>
              </div>
            ) : (
              /* Offers List */
              offers.map((offer, idx) => {
                const candidates = candidatesMap[offer.id] || [];
                const isOpen = expanded[offer.id];
                
                return (
                  <div
                    key={offer.id}
                    className="offer-block"
                    style={{
                      background: 'var(--card-bg, #fff)',
                      border: `1px solid ${isOpen ? 'var(--primary-light)' : 'var(--border)'}`,
                      borderRadius: 16,
                      marginBottom: 16,
                      overflow: 'hidden',
                      boxShadow: isOpen 
                        ? '0 4px 20px rgba(108,99,255,0.12)' 
                        : '0 2px 8px rgba(0,0,0,0.04)',
                      transition: 'all 0.2s ease',
                      animation: `fadeUp 0.4s ${idx * 0.05}s ease-out both`,
                    }}
                  >
                    <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
                    
                    {/* Offer Header (clickable) */}
                    <div 
                      className="offer-block-header" 
                      onClick={() => toggleExpand(offer.id)}
                      style={{
                        padding: '16px 20px',
                        display: 'flex', alignItems: 'center', gap: 16,
                        cursor: 'pointer',
                        background: isOpen ? 'var(--primary-bg)' : 'transparent',
                        transition: 'background 0.15s ease',
                        borderBottom: isOpen ? '1px solid var(--border)' : 'none',
                      }}
                      onMouseEnter={(e) => {
                        if (!isOpen) e.currentTarget.style.background = 'var(--bg-hover)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isOpen) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {/* Icon */}
                      <div style={{
                        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                        background: isOpen ? 'var(--primary)' : 'var(--primary-bg)',
                        border: `1px solid ${isOpen ? 'var(--primary-dark)' : 'var(--primary-light)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s ease',
                      }}>
                        <span style={{ 
                          fontSize: 18, 
                          color: isOpen ? '#fff' : 'var(--primary)',
                          transition: 'color 0.15s ease',
                        }}>📋</span>
                      </div>
                      
                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="offer-block-title" style={{
                          fontSize: 15, fontWeight: 600, color: 'var(--tx)',
                          marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {offer.title}
                        </div>
                        <div className="offer-block-meta" style={{
                          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                          fontSize: 12, color: 'var(--tx-muted)',
                        }}>
                          {offer.employment_type && (
                            <span style={{ 
                              padding: '3px 10px', borderRadius: 20,
                              background: 'var(--bg-2)', color: 'var(--tx)',
                              fontWeight: 500, fontSize: 11,
                            }}>{offer.employment_type}</span>
                          )}
                          {offer.location && (
                            <span>📍 {offer.location}</span>
                          )}
                          <span style={{ 
                            padding: '3px 10px', borderRadius: 20,
                            background: candidates.length > 0 ? 'var(--emerald-bg)' : 'var(--bg-2)',
                            color: candidates.length > 0 ? 'var(--emerald)' : 'var(--tx-muted)',
                            fontWeight: 500, fontSize: 11,
                          }}>
                            {candidates.length} candidature{candidates.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      
                      {/* Badges */}
                      <div className="offer-block-badges" style={{
                        display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
                      }}>
                        {offer.is_active ? (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '5px 12px', borderRadius: 20,
                            fontSize: 11, fontWeight: 500,
                            background: 'var(--emerald-bg)', color: 'var(--emerald)',
                            border: '1px solid var(--emerald-light)',
                          }}>
                            <span style={{ 
                              width: 6, height: 6, borderRadius: '50%', 
                              background: 'var(--emerald)',
                              animation: 'pulse 2s infinite'
                            }} />
                            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}`}</style>
                            Active
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '5px 12px', borderRadius: 20,
                            fontSize: 11, fontWeight: 500,
                            background: 'var(--rose-bg)', color: 'var(--rose)',
                            border: '1px solid var(--rose-light)',
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--rose)' }} />
                            Inactive
                          </span>
                        )}
                        <span style={{
                          width: 32, height: 32, borderRadius: 8,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: isOpen ? 'var(--primary)' : 'var(--bg-2)',
                          color: isOpen ? '#fff' : 'var(--tx-muted)',
                          fontSize: 12, fontWeight: 600,
                          transition: 'all 0.15s ease',
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                        }}>
                          ▼
                        </span>
                      </div>
                    </div>

                    {/* Candidates Table (expanded) */}
                    {isOpen && (
                      <div style={{ padding: '0 20px 20px' }}>
                        {candidates.length === 0 ? (
                          <div className="empty-state" style={{
                            padding: '32px', textAlign: 'center',
                            color: 'var(--tx-muted)', fontSize: 13,
                          }}>
                            <span style={{ fontSize: 24, display: 'block', marginBottom: 8 }}>📭</span>
                            Aucune candidature reçue pour cette offre.
                          </div>
                        ) : (
                          <div style={{
                            border: '1px solid var(--border)',
                            borderRadius: 12,
                            overflow: 'hidden',
                            background: 'var(--card-bg, #fff)',
                          }}>
                            {/* Table Header */}
                            <div style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '12px 16px',
                              background: 'var(--bg)',
                              borderBottom: '1px solid var(--border)',
                              fontSize: 11, fontWeight: 600, color: 'var(--tx-muted)',
                              textTransform: 'uppercase', letterSpacing: '0.06em',
                            }}>
                              <span>{candidates.length} candidat{candidates.length !== 1 ? 's' : ''}</span>
                              <span style={{ fontSize: 10, color: 'var(--tx-muted)', fontWeight: 400 }}>
                                Tri: Score IA (décroissant)
                              </span>
                            </div>
                            
                            {/* Scrollable Table */}
                            <div style={{
                              maxHeight: 420, overflowY: 'auto',
                              // Scrollbar styling
                              scrollbarWidth: 'thin',
                              scrollbarColor: 'var(--border) transparent',
                            }}>
                              <style>{`
                                div::-webkit-scrollbar { width: 6px; }
                                div::-webkit-scrollbar-track { background: transparent; }
                                div::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
                                div::-webkit-scrollbar-thumb:hover { background: var(--tx-muted); }
                              `}</style>
                              
                              <table className="candidates-table" style={{
                                width: '100%', borderCollapse: 'collapse',
                                fontSize: 13, minWidth: 850,
                              }}>
                                <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--bg)' }}>
                                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    {['Candidat', 'CV', 'Scores', 'Statut', 'Actions', 'Date'].map((th, i) => (
                                      <th key={i} style={{
                                        padding: '12px 16px', textAlign: 'left',
                                        fontWeight: 600, color: 'var(--tx-muted)',
                                        fontSize: 10.5, textTransform: 'uppercase',
                                        letterSpacing: '0.06em', whiteSpace: 'nowrap',
                                        background: 'var(--bg)',
                                      }}>
                                        {th}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {candidates
                                    .sort((a, b) => (b.matching_score || 0) - (a.matching_score || 0))
                                    .map((app, rowIdx) => (
                                      <tr 
                                        key={app.id}
                                        style={{
                                          borderBottom: rowIdx < candidates.length - 1 ? '1px solid var(--border-soft)' : 'none',
                                          background: 'var(--card-bg, #fff)',
                                          transition: 'background 0.1s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.background = 'var(--bg-hover)';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.background = 'var(--card-bg, #fff)';
                                        }}
                                      >
                                        {/* Candidat */}
                                        <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{
                                              width: 36, height: 36, borderRadius: '50%',
                                              background: 'var(--primary-bg)',
                                              border: '1px solid var(--primary-light)',
                                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                                              fontSize: 13, fontWeight: 600, color: 'var(--primary)',
                                              flexShrink: 0,
                                            }}>
                                              {(app.candidate?.prenom || app.candidate?.first_name || 'C')?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                              <div className="cand-name" style={{
                                                fontSize: 13.5, fontWeight: 500, color: 'var(--tx)',
                                              }}>
                                                {app.candidate?.prenom || app.candidate?.first_name || 'Candidat'}
                                              </div>
                                              <div className="cand-email" style={{
                                                fontSize: 11.5, color: 'var(--tx-muted)',
                                                marginTop: 2, fontFamily: 'monospace',
                                              }}>
                                                {app.candidate?.email}
                                              </div>
                                            </div>
                                          </div>
                                        </td>

                                        {/* CV */}
                                        <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                                          {app.cv_filename ? (
                                            <span style={{
                                              display: 'inline-flex', alignItems: 'center', gap: 4,
                                              fontSize: 11.5, color: 'var(--primary)',
                                              background: 'var(--primary-bg)',
                                              padding: '4px 10px', borderRadius: 8,
                                              border: '1px solid var(--primary-light)',
                                              fontFamily: 'monospace',
                                              maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis',
                                            }}>
                                              📄 {app.cv_filename}
                                            </span>
                                          ) : (
                                            <span style={{ color: 'var(--tx-muted)', fontSize: 12 }}>—</span>
                                          )}
                                        </td>

                                        {/* Scores */}
                                        <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {/* Score IA + Classification */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                              <ScoreBadge score={app.matching_score} />
                                              {app.cv_classification && (
                                                <span style={{ 
                                                  fontSize: 10.5, color: 'var(--tx-muted)',
                                                  fontWeight: 500, whiteSpace: 'nowrap',
                                                }}>
                                                  🎓 {app.cv_classification}
                                                </span>
                                              )}
                                            </div>
                                            
                                            {/* Quiz + Final Scores */}
                                            <div style={{ 
                                              display: 'flex', alignItems: 'center', gap: 10,
                                              padding: '8px 0', borderTop: '1px dashed var(--border)',
                                            }}>
                                              <span style={{ 
                                                fontSize: 11.5, color: 'var(--sky)', fontWeight: 600,
                                                display: 'flex', alignItems: 'center', gap: 4,
                                              }}>
                                                🧠 {app.quiz_score ?? '—'}%
                                              </span>
                                              {app.final_score != null && (
                                                <span style={{
                                                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                  padding: '3px 10px', borderRadius: 16,
                                                  fontSize: 11, fontWeight: 600, fontFamily: 'monospace',
                                                  background: app.final_score >= 80 ? 'var(--emerald-bg)' : 
                                                              app.final_score >= 55 ? 'var(--amber-bg)' : 'var(--rose-bg)',
                                                  color: app.final_score >= 80 ? 'var(--emerald)' : 
                                                          app.final_score >= 55 ? 'var(--amber)' : 'var(--rose)',
                                                  border: `1px solid ${
                                                    app.final_score >= 80 ? 'var(--emerald-light)' : 
                                                    app.final_score >= 55 ? 'var(--amber-light)' : 'var(--rose-light)'
                                                  }`,
                                                }}>
                                                  🎯 {app.final_score}%
                                                </span>
                                              )}
                                            </div>
                                            
                                            {/* Skills detected */}
                                            {app.skills_detected?.length > 0 && (
                                              <details style={{ fontSize: 10 }}>
                                                <summary style={{
                                                  cursor: 'pointer', color: 'var(--primary)',
                                                  fontWeight: 500, listStyle: 'none',
                                                  '&::-webkit-details-marker': { display: 'none' },
                                                }}>
                                                  ⚡ {app.skills_detected.length} compétences ▼
                                                </summary>
                                                <div style={{
                                                  display: 'flex', gap: 4, flexWrap: 'wrap',
                                                  marginTop: 6, padding: '6px 8px',
                                                  background: 'var(--bg-2)', borderRadius: 8,
                                                  border: '1px solid var(--border)',
                                                }}>
                                                  {app.skills_detected.slice(0, 4).map((skill, i) => (
                                                    <span key={i} style={{
                                                      fontSize: 9.5, color: 'var(--primary)',
                                                      background: 'var(--primary-bg)',
                                                      padding: '2px 7px', borderRadius: 6,
                                                      border: '1px solid var(--primary-light)',
                                                    }}>
                                                      {skill}
                                                    </span>
                                                  ))}
                                                  {app.skills_detected.length > 4 && (
                                                    <span style={{ fontSize: 9.5, color: 'var(--tx-muted)' }}>
                                                      +{app.skills_detected.length - 4}
                                                    </span>
                                                  )}
                                                </div>
                                              </details>
                                            )}
                                          </div>
                                        </td>

                                        {/* Statut */}
                                        <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                                          <StatusPill status={app.status} />
                                        </td>

                                        {/* Actions */}
                                        <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                            {app.status !== 'accepted' && (
                                              <ActionBtn 
                                                label="✓ Accepter" 
                                                variant="accept" 
                                                disabled={updating === app.id} 
                                                onClick={() => updateStatus(app.id, 'accepted')} 
                                              />
                                            )}
                                            {app.status !== 'rejected' && (
                                              <ActionBtn 
                                                label="✕ Refuser" 
                                                variant="reject" 
                                                disabled={updating === app.id} 
                                                onClick={() => updateStatus(app.id, 'rejected')} 
                                              />
                                            )}
                                            {app.status !== 'interview' && app.status !== 'rejected' && (
                                              <ActionBtn 
                                                label="🎥 Entretien" 
                                                variant="interview" 
                                                disabled={updating === app.id} 
                                                onClick={() => updateStatus(app.id, 'interview')} 
                                              />
                                            )}
                                          </div>
                                        </td>

                                        {/* Date */}
                                        <td style={{ 
                                          padding: '14px 16px', verticalAlign: 'middle',
                                          color: 'var(--tx-muted)', fontSize: 11.5,
                                          fontFamily: 'monospace', whiteSpace: 'nowrap',
                                        }}>
                                          {new Date(app.applied_at).toLocaleDateString('fr-FR')}
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
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