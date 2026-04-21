// src/pages/Recruiter/ManageJobs.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../../assets/logo.png';

const API = 'http://localhost:3000';

/* ── TOKENS ── */
const C = {
  white: '#FFFFFF', bg: '#F5F7FA', bgHover: '#FAFBFC',
  border: '#E8EBF2', borderSoft: '#F0F2F8',
  tx: '#111827', tx2: '#6B7280', tx3: '#B0B7C9',
  blue: '#2563EB', blueBg: '#EFF6FF', blueBd: '#BFDBFE', blueDeep: '#1D4ED8',
  green: '#059669', greenBg: '#ECFDF5', greenBd: '#A7F3D0',
  amber: '#D97706', amberBg: '#FFFBEB', amberBd: '#FDE68A',
  red: '#DC2626', redBg: '#FEF2F2', redBd: '#FECACA',
  purple: '#7C3AED', purpleBg: '#F5F3FF', purpleBd: '#DDD6FE', purpleDark: '#6D28D9',
};

const font = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const mono = "'JetBrains Mono', 'Fira Mono', monospace";

/* ── SIDEBAR ── */
function NavItem({ item, navigate }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={() => item.path && navigate(item.path)}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
        borderRadius: 8, cursor: 'pointer', border: 'none', textAlign: 'left',
        width: '100%', fontSize: 13, fontWeight: item.active ? 500 : 400,
        fontFamily: font,
        background: item.active ? C.blueBg : hov ? '#F8F9FB' : 'transparent',
        color: item.active ? C.blue : hov ? C.tx : C.tx2, transition: 'all .15s',
      }}
    >
      <span style={{
        width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
        background: item.active ? C.blue : hov ? C.tx3 : C.border,
        transition: 'background .15s',
      }} />
      {item.label}
    </button>
  );
}

function Sidebar({ navigate }) {
  const items = [
    { label: 'Tableau de bord', path: '/dashboard', active: false },
    { label: 'Publier une offre', path: '/recruiter/post', active: false },
    { label: 'Gérer candidatures', path: null, active: true },
  ];
  return (
    <aside style={{
      width: 232, minWidth: 232, background: C.white,
      borderRight: `1px solid ${C.border}`,
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        padding: '22px 18px 18px', borderBottom: `1px solid ${C.borderSoft}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: C.blueBg,
          border: `1px solid ${C.blueBd}`, display: 'flex',
          alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          flexShrink: 0,
        }}>
          <img src={logo} alt="TalentSphere" style={{ width: 22, height: 22, objectFit: 'contain' }}
            onError={e => {
              e.target.style.display = 'none';
              e.target.parentNode.innerHTML = `<svg viewBox="0 0 20 20" width="20" height="20" fill="none"><circle cx="10" cy="7" r="4" fill="#2563EB"/><path d="M3 18c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke="#2563EB" stroke-width="1.6" stroke-linecap="round"/></svg>`;
            }} />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.tx, letterSpacing: '-.02em' }}>TalentSphere</div>
          <div style={{ fontSize: 11, color: C.tx3, marginTop: 1 }}>Recruiter</div>
        </div>
      </div>
      <nav style={{ padding: '14px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: C.tx3, letterSpacing: '.08em', textTransform: 'uppercase', padding: '0 10px 10px' }}>Menu</div>
        {items.map((item, i) => <NavItem key={i} item={item} navigate={navigate} />)}
      </nav>
      <div style={{ padding: '10px 10px 16px', borderTop: `1px solid ${C.borderSoft}` }}>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }}
          onMouseEnter={e => { e.currentTarget.style.color = C.red; e.currentTarget.style.background = C.redBg; }}
          onMouseLeave={e => { e.currentTarget.style.color = C.tx3; e.currentTarget.style.background = 'none'; }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8,
            cursor: 'pointer', color: C.tx3, fontSize: 12.5, border: 'none', background: 'none',
            width: '100%', textAlign: 'left', fontFamily: font, transition: 'all .15s',
          }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Déconnexion
        </button>
      </div>
    </aside>
  );
}

/* ── SCORE CHIP ── */
function ScoreChip({ score }) {
  if (score == null) return <span style={{ color: C.tx3, fontSize: 11 }}>—</span>;
  const cfg = score >= 80 ? { bg: C.greenBg, color: C.green, bd: C.greenBd }
    : score >= 55 ? { bg: C.amberBg, color: C.amber, bd: C.amberBd }
    : { bg: C.redBg, color: C.red, bd: C.redBd };
  return (
    <span style={{
      display: 'inline-flex', padding: '2px 8px', borderRadius: 20, fontSize: 11,
      fontWeight: 500, fontFamily: mono, background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.bd}`,
    }}>{score}%</span>
  );
}

/* ── STATUS PILL ── */
function StatusPill({ status }) {
  const map = {
    pending: { label: 'En attente', bg: C.amberBg, color: C.amber, dot: C.amber },
    reviewed: { label: 'Lu', bg: C.blueBg, color: C.blue, dot: C.blue },
    interview: { label: 'Entretien', bg: C.purpleBg, color: C.purpleDark, dot: C.purple },
    accepted: { label: 'Accepté', bg: C.greenBg, color: C.green, dot: C.green },
    rejected: { label: 'Refusé', bg: C.redBg, color: C.red, dot: C.red },
  };
  const m = map[status] || map.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px',
      borderRadius: 20, fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap',
      background: m.bg, color: m.color,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: m.dot }} />
      {m.label}
    </span>
  );
}

/* ── ACTION BTN ── */
function ActionBtn({ label, variant, onClick, disabled }) {
  const [hov, setHov] = useState(false);
  const v = {
    accept: { color: C.green, bd: C.greenBd, bg: C.greenBg },
    reject: { color: C.red, bd: C.redBd, bg: C.redBg },
    interview: { color: C.purpleDark, bd: C.purpleBd, bg: C.purpleBg },
  }[variant] || { color: C.tx2, bd: C.border, bg: C.bg };
  return (
    <button disabled={disabled} onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: '5px 11px', borderRadius: 7, fontSize: 11.5, fontWeight: 500,
        border: `1px solid ${hov ? v.bd : C.border}`, fontFamily: font,
        background: hov ? v.bg : C.white, color: hov ? v.color : C.tx2,
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .45 : 1,
        transition: 'all .15s',
      }}>
      {disabled ? '…' : label}
    </button>
  );
}

/* ── SORT TOGGLE BUTTON ── */
function SortToggle({ sortBy, onSortChange }) {
  const [hov, setHov] = useState(false);
  const labels = {
    final_desc: '🎯 Final: + élevé',
    final_asc: '🎯 Final: + faible',
    quiz_desc: '🧠 Quiz: + élevé',
    quiz_asc: '🧠 Quiz: + faible',
    cv_desc: '📄 CV: + élevé',
    cv_asc: '📄 CV: + faible',
  };
  return (
    <button
      onClick={onSortChange}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', borderRadius: 7, fontSize: 11,
        fontWeight: 500, fontFamily: font, cursor: 'pointer',
        border: `1px solid ${hov ? C.blueBd : C.border}`,
        background: hov ? C.blueBg : C.white,
        color: hov ? C.blue : C.tx2,
        transition: 'all .15s',
        whiteSpace: 'nowrap',
      }}
      title="Changer l'ordre de tri"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.8 }}>
        <path d="M3 4h6M3 7h4M3 10h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
      {labels[sortBy] || 'Trier'}
    </button>
  );
}

/* ── TABLE ROW ── */
function CandRow({ app, updating, updateStatus }) {
  const [hov, setHov] = useState(false);
  const name = app.candidate?.prenom || app.candidate?.first_name || 'Candidat';
  const tdBase = { padding: '12px 16px', verticalAlign: 'middle' };
  return (
    <tr onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ borderBottom: `1px solid ${C.borderSoft}`, background: hov ? '#FAFBFD' : C.white, transition: 'background .1s' }}>
      <td style={tdBase}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', background: C.blueBg,
            border: `1px solid ${C.blueBd}`, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 12, fontWeight: 600, color: C.blue,
            flexShrink: 0,
          }}>{name.charAt(0).toUpperCase()}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: C.tx }}>{name}</div>
            <div style={{ fontSize: 11, color: C.tx3, marginTop: 1, fontFamily: mono }}>{app.candidate?.email}</div>
          </div>
        </div>
      </td>
      <td style={tdBase}>
        {app.cv_filename ? (
          <span style={{
            fontSize: 11, color: C.blue, background: C.blueBg, padding: '3px 8px',
            borderRadius: 6, fontFamily: mono, border: `1px solid ${C.blueBd}`,
            whiteSpace: 'nowrap', display: 'inline-block', maxWidth: 130,
            overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{app.cv_filename}</span>
        ) : <span style={{ color: C.tx3, fontSize: 12 }}>—</span>}
      </td>
      <td style={tdBase}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {[['IA', app.matching_score], ['Quiz', app.quiz_score], ['Final', app.final_score]].map(([lbl, val]) => (
            <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 10, color: C.tx3, minWidth: 30, fontFamily: font }}>{lbl}</span>
              <ScoreChip score={val} />
            </div>
          ))}
          {app.skills_detected?.length > 0 && (
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 2 }}>
              {app.skills_detected.slice(0, 3).map((sk, i) => (
                <span key={i} style={{
                  fontSize: 10, color: C.purpleDark, background: C.purpleBg,
                  padding: '1px 6px', borderRadius: 4, border: `1px solid ${C.purpleBd}`,
                }}>{sk}</span>
              ))}
              {app.skills_detected.length > 3 && <span style={{ fontSize: 10, color: C.tx3 }}>+{app.skills_detected.length - 3}</span>}
            </div>
          )}
        </div>
      </td>
      <td style={tdBase}><StatusPill status={app.status} /></td>
      <td style={tdBase}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {app.status !== 'accepted' && <ActionBtn label="Accepter" variant="accept" disabled={updating === app.id} onClick={() => updateStatus(app.id, 'accepted')} />}
          {app.status !== 'rejected' && <ActionBtn label="Refuser" variant="reject" disabled={updating === app.id} onClick={() => updateStatus(app.id, 'rejected')} />}
          {app.status !== 'interview' && app.status !== 'rejected' && <ActionBtn label="Entretien" variant="interview" disabled={updating === app.id} onClick={() => updateStatus(app.id, 'interview')} />}
        </div>
      </td>
      <td style={{ ...tdBase, fontSize: 11, color: C.tx3, fontFamily: mono, whiteSpace: 'nowrap' }}>
        {new Date(app.applied_at).toLocaleDateString('fr-FR')}
      </td>
    </tr>
  );
}

/* ── CANDIDATES TABLE (avec scroll + tri) ── */
function CandidatesTable({ candidates, updating, updateStatus, sortBy }) {
  if (!candidates.length) return (
    <div style={{ padding: '28px 20px', textAlign: 'center', color: C.tx3, fontSize: 13 }}>
      Aucune candidature reçue pour cette offre.
    </div>
  );

  // 🔹 TRI DES CANDIDATS selon sortBy
  const sorted = [...candidates].sort((a, b) => {
    const [field, order] = sortBy.split('_'); // ex: "final_desc" → field="final", order="desc"
    const valA = a[`${field}_score`] ?? 0;
    const valB = b[`${field}_score`] ?? 0;
    return order === 'desc' ? valB - valA : valA - valB;
  });

  const th = (w) => ({
    padding: '10px 16px', textAlign: 'left', fontFamily: font, fontSize: 10.5,
    fontWeight: 600, color: C.tx3, letterSpacing: '.06em', textTransform: 'uppercase',
    background: C.bg, borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap', width: w,
    position: 'sticky', top: 0, zIndex: 1, // ← ✅ Sticky header pour scroll
  });

  return (
    <div style={{
      // ✅ SCROLL VERTICAL dans le tableau seulement (max 400px)
      maxHeight: 400, overflowY: 'auto', overflowX: 'auto',
      border: `1px solid ${C.borderSoft}`, borderRadius: '0 0 12px 12px',
    }}>
      <style>{`
        /* Scrollbar personnalisée */
        div::-webkit-scrollbar { width: 6px; height: 6px; }
        div::-webkit-scrollbar-track { background: ${C.bg}; }
        div::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
        div::-webkit-scrollbar-thumb:hover { background: ${C.tx3}; }
      `}</style>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
        <thead>
          <tr>
            <th style={th(180)}>Candidat</th>
            <th style={th(140)}>CV</th>
            <th style={th(160)}>Scores</th>
            <th style={th(110)}>Statut</th>
            <th style={th()}>Actions</th>
            <th style={th(95)}>Date</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(app => (
            <CandRow key={app.id} app={app} updating={updating} updateStatus={updateStatus} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── OFFER BLOCK ── */
function OfferBlock({ offer, candidates, updating, updateStatus, idx, sortBy, onSortChange }) {
  const [open, setOpen] = useState(false);
  const [hov, setHov] = useState(false);
  return (
    <div style={{
      background: C.white, border: `1px solid ${open ? C.border : hov ? '#D1D5E0' : C.border}`,
      borderRadius: 12, overflow: 'hidden',
      boxShadow: open ? '0 2px 8px rgba(0,0,0,0.04)' : 'none',
      animation: `fadeUp .25s ${idx * 0.04}s both`,
      transition: 'box-shadow .2s, border-color .15s',
    }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div onClick={() => setOpen(p => !p)} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', userSelect: 'none', background: hov && !open ? '#FAFBFD' : C.white, transition: 'background .12s' }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
          background: C.blueBg, border: `1px solid ${C.blueBd}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="3" width="12" height="10" rx="2" stroke={C.blue} strokeWidth="1.4"/>
            <path d="M5 7h6M5 10h4" stroke={C.blue} strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 500, color: C.tx }}>{offer.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5, flexWrap: 'wrap' }}>
            {offer.employment_type && <span style={{ fontSize: 11, color: C.tx3 }}>{offer.employment_type}</span>}
            {offer.location && <span style={{ fontSize: 11, color: C.tx3 }}>• {offer.location}</span>}
            <span style={{ fontSize: 11, color: C.tx2, background: C.bg, padding: '2px 8px', borderRadius: 20, border: `1px solid ${C.border}` }}>
              {candidates.length} candidature{candidates.length !== 1 ? 's' : ''}
            </span>
            {offer.is_active
              ? <span style={{ fontSize: 11, fontWeight: 500, color: C.green, background: C.greenBg, padding: '2px 8px', borderRadius: 20, border: `1px solid ${C.greenBd}` }}>Active</span>
              : <span style={{ fontSize: 11, fontWeight: 500, color: C.red, background: C.redBg, padding: '2px 8px', borderRadius: 20, border: `1px solid ${C.redBd}` }}>Inactive</span>
            }
          </div>
        </div>
        <div style={{
          width: 28, height: 28, borderRadius: 7, flexShrink: 0,
          background: open ? C.blueBg : C.bg, border: `1px solid ${open ? C.blueBd : C.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s',
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s' }}>
            <path d="M2 4l4 4 4-4" stroke={open ? C.blue : C.tx3} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {open && (
        <div style={{ borderTop: `1px solid ${C.borderSoft}` }}>
          {/* ✅ Header avec tri + compteur */}
          <div style={{
            padding: '10px 16px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', background: C.bg,
            borderBottom: `1px solid ${C.borderSoft}`,
          }}>
            <span style={{ fontSize: 11, color: C.tx3, fontFamily: font }}>
              {candidates.length} candidat{candidates.length !== 1 ? 's' : ''}
            </span>
            <SortToggle sortBy={sortBy} onSortChange={onSortChange} />
          </div>
          {/* ✅ Tableau avec scroll */}
          <CandidatesTable candidates={candidates} updating={updating} updateStatus={updateStatus} sortBy={sortBy} />
        </div>
      )}
    </div>
  );
}

/* ── MAIN PAGE ── */
export default function ManageJobs() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [candidatesMap, setCandidatesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  
  // ✅ État pour le tri (par défaut: final_score décroissant)
  const [sortConfig, setSortConfig] = useState({}); // { [offerId]: 'final_desc' | 'final_asc' | ... }

  const fetchAll = async () => {
    const token = localStorage.getItem('token');
    const { data: offersList } = await axios.get(`${API}/job-offers/my-offers`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setOffers(offersList);
    const map = {};
    await Promise.all(offersList.map(async o => {
      const { data } = await axios.get(`${API}/job-applications/job-offer/${o.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      map[o.id] = data;
    }));
    setCandidatesMap(map);
  };

  useEffect(() => { fetchAll().finally(() => setLoading(false)); }, []);

  const updateStatus = async (appId, status) => {
    setUpdating(appId);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/job-applications/${appId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchAll();
    } catch { alert('Erreur lors de la mise à jour du statut.'); }
    finally { setUpdating(null); }
  };

  // ✅ Fonction pour changer le tri
  const toggleSort = (offerId) => {
    const current = sortConfig[offerId] || 'final_desc';
    const order = current.endsWith('_desc') ? 'asc' : 'desc';
    const field = current.split('_')[0];
    setSortConfig(prev => ({ ...prev, [offerId]: `${field}_${order}` }));
  };

  const totalCandidatures = Object.values(candidatesMap).reduce((s, a) => s + a.length, 0);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 12, color: C.tx2, fontFamily: font, fontSize: 13, background: C.bg }}>
      <div style={{ width: 22, height: 22, border: `2.5px solid ${C.border}`, borderTop: `2.5px solid ${C.blue}`, borderRadius: '50%', animation: 'spin .75s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      Chargement…
    </div>
  );

  const stats = [
    { label: 'Offres publiées', value: offers.length, icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="3" width="14" height="12" rx="2.5" stroke={C.blue} strokeWidth="1.5"/><path d="M5 8h8M5 11.5h5" stroke={C.blue} strokeWidth="1.4" strokeLinecap="round"/></svg>, iconBg: C.blueBg, iconBd: C.blueBd, color: C.blue },
    { label: 'Candidatures', value: totalCandidatures, icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6" r="3.5" stroke={C.green} strokeWidth="1.5"/><path d="M3 16.5c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke={C.green} strokeWidth="1.5" strokeLinecap="round"/></svg>, iconBg: C.greenBg, iconBd: C.greenBd, color: C.green },
    { label: 'Offres actives', value: offers.filter(o => o.is_active).length, icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="6.5" stroke={C.purple} strokeWidth="1.5"/><path d="M6.5 9l2 2 3-3" stroke={C.purple} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>, iconBg: C.purpleBg, iconBd: C.purpleBd, color: C.purple },
  ];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <div style={{ display: 'flex', height: '100vh', fontFamily: font, background: C.bg }}>
        <Sidebar navigate={navigate} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          {/* Topbar */}
          <header style={{ height: 56, padding: '0 28px', background: C.white, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.tx }}>Gérer les candidatures</div>
              <div style={{ fontSize: 11, color: C.tx3, marginTop: 1 }}>Suivez et gérez toutes vos offres</div>
            </div>
            <button onClick={() => navigate('/recruiter/post')}
              onMouseEnter={e => { e.currentTarget.style.background = C.blueDeep; }}
              onMouseLeave={e => { e.currentTarget.style.background = C.blue; }}
              style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px',
                borderRadius: 8, background: C.blue, color: C.white, fontSize: 13,
                fontWeight: 500, border: 'none', cursor: 'pointer', fontFamily: font,
                transition: 'background .15s',
              }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M6.5 1v11M1 6.5h11" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              Nouvelle offre
            </button>
          </header>

          {/* Main content */}
          <main style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', padding: '22px 28px 60px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {stats.map((s, i) => (
                <div key={i} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 11, flexShrink: 0, background: s.iconBg, border: `1px solid ${s.iconBd}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize: 26, fontWeight: 600, color: C.tx, lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: 11.5, color: C.tx3, marginTop: 4 }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: C.tx }}>Vos offres</span>
              <span style={{ fontSize: 11.5, color: C.tx3 }}>Cliquez sur une offre pour voir les candidats</span>
            </div>

            {/* Empty state */}
            {offers.length === 0 ? (
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: '56px 20px', textAlign: 'center' }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: C.blueBg, border: `1px solid ${C.blueBd}`, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <rect x="3" y="4" width="16" height="14" rx="3" stroke={C.blue} strokeWidth="1.6"/>
                    <path d="M7 10h8M7 14h5" stroke={C.blue} strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </div>
                <p style={{ fontSize: 14, fontWeight: 500, color: C.tx, marginBottom: 6 }}>Aucune offre publiée</p>
                <p style={{ fontSize: 12.5, color: C.tx3, marginBottom: 22 }}>Publiez votre première offre pour commencer à recevoir des candidatures.</p>
                <button onClick={() => navigate('/recruiter/post')} style={{ padding: '9px 20px', borderRadius: 8, background: C.blue, color: C.white, fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', fontFamily: font }}>
                  Publier une offre
                </button>
              </div>
            ) : (
              offers.map((offer, idx) => (
                <OfferBlock
                  key={offer.id}
                  offer={offer}
                  candidates={candidatesMap[offer.id] || []}
                  updating={updating}
                  updateStatus={updateStatus}
                  idx={idx}
                  sortBy={sortConfig[offer.id] || 'final_desc'}
                  onSortChange={() => toggleSort(offer.id)}
                />
              ))
            )}
          </main>
        </div>
      </div>
    </>
  );
}