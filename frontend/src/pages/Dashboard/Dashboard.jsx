// src/pages/Dashboard/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const API = 'http://localhost:3000';

/* ─── Mini helpers ─────────────────────────────────────────── */
function Avatar({ src, initials, size = 44 }) {
  if (src) {
    return (
      <img
        src={src}
        alt="avatar"
        className="dash-avatar-img"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div className="dash-avatar-placeholder" style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {initials}
    </div>
  );
}

function StatCard({ icon, value, label, accent }) {
  return (
    <div className="dash-stat-card" style={{ '--accent': accent }}>
      <div className="dash-stat-icon">{icon}</div>
      <div className="dash-stat-value">{value}</div>
      <div className="dash-stat-label">{label}</div>
    </div>
  );
}

/* ─── Nav items by role ────────────────────────────────────── */
const NAV_CANDIDAT = [
  { icon: '◈', label: 'Tableau de bord', id: 'home'         },
  { icon: '🔍', label: 'Offres d\'emploi', id: 'jobs'        },
  { icon: '📄', label: 'Mon CV',            id: 'cv'          },
  { icon: '📨', label: 'Candidatures',      id: 'applications'},
  { icon: '🎥', label: 'Entretiens',         id: 'interviews'  },
  { icon: '👤', label: 'Profil',             id: 'profile'     },
];
const NAV_RECRUTEUR = [
  { icon: '◈', label: 'Tableau de bord',  id: 'home'        },
  { icon: '➕', label: 'Publier offre',     id: 'post'        },
  { icon: '💼', label: 'Mes offres',        id: 'jobs'        },
  { icon: '👥', label: 'Candidatures',      id: 'applications'},
  { icon: '🎥', label: 'Entretiens',         id: 'interviews'  },
  { icon: '👤', label: 'Profil entreprise', id: 'profile'     },
];

/* ─── Main Component ───────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setNav]   = useState('home');
  const [collapsed, setCollapsed] = useState(false);

  /* ── Auth logic (unchanged from original) ── */
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      localStorage.setItem('token', tokenFromUrl);
      navigate('/dashboard', { replace: true });
    }
    const token = tokenFromUrl || localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      })
      .finally(() => setLoading(false));
  }, [navigate, searchParams]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="dash-loading">
        <div className="dash-spinner" />
        <span>Chargement de TalentSphere…</span>
      </div>
    );
  }

  if (!user) return null;

  /* ── Derived display values ── */
  const isRecruteur = user.role === 'recruteur';
  const NAV = isRecruteur ? NAV_RECRUTEUR : NAV_CANDIDAT;

  const displayName = user.nom_societe
    ? user.nom_societe
    : user.prenom
      ? `${user.prenom} ${user.nom || ''}`.trim()
      : user.first_name
        ? `${user.first_name} ${user.last_name || ''}`.trim()
        : 'Utilisateur';

  const displayPhoto = user.photo_url || user.photo || null;
  const initials = displayName
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const providerIcon =
    user.social_provider === 'google'   ? '🔵' :
    user.social_provider === 'linkedin' ? '🔷' : '📧';

  /* ── Logout ── */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  /* ── RENDER ── */
  return (
    <div className={`dash-layout ${collapsed ? 'dash-collapsed' : ''}`}>

      {/* ════ SIDEBAR ════ */}
      <aside className="dash-sidebar">
        {/* Logo */}
        <div className="dash-sidebar-top">
          <div className="dash-logo">
            <span className="dash-logo-mark">TS</span>
            {!collapsed && <span className="dash-logo-name">TalentSphere</span>}
          </div>
          <button
            className="dash-collapse-btn"
            onClick={() => setCollapsed(p => !p)}
            title={collapsed ? 'Déplier' : 'Réduire'}
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* User card */}
        {!collapsed && (
          <div className="dash-user-card">
            <Avatar src={displayPhoto} initials={initials} size={40} />
            <div className="dash-user-info">
              <div className="dash-user-name">{displayName}</div>
              <span className={`dash-role-badge ${isRecruteur ? 'rec' : 'cand'}`}>
                {isRecruteur ? '🏢 Recruteur' : '🎯 Candidat'}
              </span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="dash-nav">
          {NAV.map(item => (
            <button
              key={item.id}
              className={`dash-nav-item ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => setNav(item.id)}
              title={collapsed ? item.label : ''}
            >
              <span className="dash-nav-icon">{item.icon}</span>
              {!collapsed && <span className="dash-nav-label">{item.label}</span>}
              {!collapsed && activeNav === item.id && <span className="dash-nav-dot" />}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="dash-sidebar-btm">
          {!collapsed && (
            <div className="dash-upgrade-card">
              <div className="dash-upgrade-title">✨ Plan Gratuit</div>
              <div className="dash-upgrade-desc">Passez Pro pour débloquer toutes les fonctionnalités</div>
              <button className="dash-upgrade-btn">Passer Pro →</button>
            </div>
          )}
          <button className="dash-logout-btn" onClick={logout} title="Déconnexion">
            <span>🚪</span>
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* ════ MAIN ════ */}
      <div className="dash-main">

        {/* ── Topbar ── */}
        <header className="dash-topbar">
          <div className="dash-topbar-left">
            <h1 className="dash-page-title">
              {NAV.find(n => n.id === activeNav)?.label || 'Tableau de bord'}
            </h1>
          </div>
          <div className="dash-topbar-right">
            <button className="dash-topbar-btn" title="Notifications">🔔</button>
            <button className="dash-topbar-btn" title="Paramètres" onClick={() => setNav('profile')}>⚙</button>
            <button className="dash-topbar-avatar" onClick={() => setNav('profile')} title="Mon profil">
              {displayPhoto
                ? <img src={displayPhoto} alt={displayName} />
                : <span>{initials}</span>
              }
            </button>
          </div>
        </header>

        {/* ── Content ── */}
        <main className="dash-content">

          {/* ────────────── HOME VIEW ────────────── */}
          {activeNav === 'home' && (
            <div className="dash-home">

              {/* Welcome banner */}
              <div className="dash-welcome-banner">
                <div className="dash-welcome-orb" />
                <div className="dash-welcome-left">
                  <Avatar src={displayPhoto} initials={initials} size={64} />
                  <div>
                    <h2>Bonjour, <span className="dash-gold">{displayName}</span> 👋</h2>
                    <p>
                      {isRecruteur
                        ? 'Gérez vos offres et découvrez les meilleurs talents grâce à l\'IA.'
                        : 'Trouvez votre emploi idéal. Votre prochaine opportunité est ici.'}
                    </p>
                  </div>
                </div>
                <div className="dash-welcome-actions">
                  <button
                    className="dash-btn-gold"
                    onClick={() => setNav(isRecruteur ? 'post' : 'cv')}
                  >
                    {isRecruteur ? '➕ Publier une offre' : '📄 Analyser mon CV'}
                  </button>
                  <button className="dash-btn-ghost" onClick={() => setNav('profile')}>
                    👤 Mon profil
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="dash-stats-grid">
                {isRecruteur ? (<>
                  <StatCard icon="💼" value="4"  label="Offres actives"      accent="var(--gold)" />
                  <StatCard icon="👥" value="38" label="Candidatures reçues" accent="var(--teal)" />
                  <StatCard icon="🎥" value="6"  label="Entretiens planifiés" accent="var(--rose)" />
                  <StatCard icon="✅" value="11" label="Recrutements réussis" accent="var(--gold)" />
                </>) : (<>
                  <StatCard icon="📨" value="7"   label="Candidatures"    accent="var(--gold)" />
                  <StatCard icon="🎯" value="84%" label="Score CV IA"      accent="var(--teal)" />
                  <StatCard icon="🎥" value="3"   label="Entretiens"       accent="var(--rose)" />
                  <StatCard icon="👁" value="42"  label="Vues du profil"   accent="var(--gold)" />
                </>)}
              </div>

              {/* Grid */}
              <div className="dash-home-grid">

                {/* Recent activity */}
                <div className="dash-card">
                  <div className="dash-card-header">
                    <h3>Activité récente</h3>
                  </div>
                  <div className="dash-card-body">
                    {[
                      { icon:'✅', text: isRecruteur ? 'Offre "Dev React" publiée'         : 'Candidature envoyée chez TechCorp TN', time:'Il y a 2h',  c:'var(--teal)' },
                      { icon:'📧', text: isRecruteur ? 'Nouveau CV reçu — Sarra B.'         : 'Email de confirmation reçu',           time:'Il y a 5h',  c:'var(--gold)' },
                      { icon:'🎥', text: isRecruteur ? 'Entretien planifié avec Mehdi K.'   : 'Entretien planifié — 15 jan à 14h',    time:'Hier',        c:'var(--rose)' },
                      { icon:'🔔', text: isRecruteur ? '3 nouvelles candidatures'            : 'Profil consulté 5 fois cette semaine', time:'Il y a 2j',  c:'var(--gold)' },
                    ].map((a, i) => (
                      <div className="dash-activity-row" key={i}>
                        <div className="dash-activity-dot" style={{ background: a.c }}>{a.icon}</div>
                        <div>
                          <div className="dash-activity-text">{a.text}</div>
                          <div className="dash-activity-time">{a.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick actions */}
                <div className="dash-card">
                  <div className="dash-card-header"><h3>Actions rapides</h3></div>
                  <div className="dash-card-body">
                    {(isRecruteur ? [
                      { icon:'➕', l:'Publier une offre',     id:'post'         },
                      { icon:'👥', l:'Voir candidatures',     id:'applications' },
                      { icon:'📅', l:'Planifier un entretien',id:'interviews'   },
                      { icon:'💼', l:'Mes offres actives',    id:'jobs'         },
                    ] : [
                      { icon:'🔍', l:'Chercher un emploi',    id:'jobs'         },
                      { icon:'📄', l:'Analyser mon CV',       id:'cv'           },
                      { icon:'👤', l:'Compléter mon profil',  id:'profile'      },
                      { icon:'🎥', l:'Voir mes entretiens',   id:'interviews'   },
                    ]).map((a, i) => (
                      <button
                        key={i}
                        className={`dash-quick-btn ${i === 0 ? 'primary' : ''}`}
                        onClick={() => setNav(a.id)}
                      >
                        <span>{a.icon}</span>{a.l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Upcoming interviews */}
                <div className="dash-card">
                  <div className="dash-card-header">
                    <h3>Entretiens à venir</h3>
                    <button className="dash-card-action" onClick={() => setNav('interviews')}>Voir tout →</button>
                  </div>
                  <div className="dash-card-body">
                    {[
                      { name: isRecruteur ? 'Sarra Belhadj' : 'TechCorp TN', date:'15 Jan · 14:00', meet:'https://meet.google.com/abc-def-ghi' },
                      { name: isRecruteur ? 'Mehdi Khelifi'  : 'DataInc',    date:'17 Jan · 10:30', meet:'https://meet.google.com/xyz-uvw-xyz' },
                    ].map((iv, i) => (
                      <div className="dash-iv-row" key={i}>
                        <span className="dash-iv-icon">🎥</span>
                        <div className="dash-iv-info">
                          <div className="dash-iv-name">{iv.name}</div>
                          <div className="dash-iv-date">📅 {iv.date}</div>
                        </div>
                        <a href={iv.meet} target="_blank" rel="noopener noreferrer" className="dash-iv-btn">
                          Rejoindre
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ────────────── PROFILE VIEW ────────────── */}
          {activeNav === 'profile' && (
            <div className="dash-profile-view">
              {/* Hero */}
              <div className="dash-profile-hero">
                <div className="dash-profile-hero-bg" />
                <div className="dash-profile-hero-avatar">
                  <Avatar src={displayPhoto} initials={initials} size={80} />
                </div>
                <div className="dash-profile-hero-info">
                  <h2>{displayName}</h2>
                  <p>
                    {isRecruteur
                      ? `${user.poste || 'Recruteur'} · ${user.nom_societe || ''}`
                      : user.profession || user.email}
                  </p>
                  <span className={`dash-role-badge ${isRecruteur ? 'rec' : 'cand'}`}>
                    {isRecruteur ? '🏢 Recruteur' : '🎯 Candidat'}
                  </span>
                </div>
              </div>

              {/* Info cards */}
              <div className="dash-profile-grid">
                <div className="dash-card">
                  <div className="dash-card-header">
                    <h3>{isRecruteur ? 'Informations entreprise' : 'Informations personnelles'}</h3>
                  </div>
                  <div className="dash-card-body">
                    <div className="dash-info-grid">
                      {isRecruteur ? (<>
                        <InfoRow icon="🏢" label="Société"     value={user.nom_societe} />
                        <InfoRow icon="✉"  label="Email"       value={user.email} verified={user.email_verified} />
                        <InfoRow icon="💼" label="Poste"       value={user.poste} />
                        <InfoRow icon="◈"  label="Domaine"     value={user.domaine} />
                        <InfoRow icon="📍" label="Pays"        value={user.pays_societe} />
                        <InfoRow icon="📱" label="Téléphone"   value={user.phone_societe ? `${user.phone_societe_code || ''} ${user.phone_societe}` : null} />
                        <InfoRow icon="📅" label="Fondée en"   value={user.date_creation_societe} />
                      </>) : (<>
                        <InfoRow icon="👤" label="Prénom"      value={user.prenom || user.first_name} />
                        <InfoRow icon="👤" label="Nom"         value={user.nom    || user.last_name} />
                        <InfoRow icon="✉"  label="Email"       value={user.email} verified={user.email_verified} />
                        <InfoRow icon="♂"  label="Genre"       value={user.genre} />
                        <InfoRow icon="🎂" label="Naissance"   value={user.date_naissance} />
                        <InfoRow icon="📍" label="Pays"        value={user.pays} />
                        <InfoRow icon="📱" label="Téléphone"   value={user.phone ? `${user.phone_code || ''} ${user.phone}` : null} />
                        <InfoRow icon="💼" label="Profession"  value={user.profession} />
                      </>)}
                    </div>
                  </div>
                </div>

                <div className="dash-card">
                  <div className="dash-card-header"><h3>Compte</h3></div>
                  <div className="dash-card-body">
                    <div className="dash-account-rows">
                      <div className="dash-account-row">
                        <span>📧 Email</span>
                        <span className={user.email_verified ? 'dash-ok' : 'dash-warn'}>
                          {user.email_verified ? '✓ Vérifié' : '⚠ Non vérifié'}
                        </span>
                      </div>
                      <div className="dash-account-row">
                        <span>📱 Téléphone</span>
                        <span className={user.phone_verified ? 'dash-ok' : 'dash-warn'}>
                          {user.phone_verified ? '✓ Vérifié' : '⚠ Non vérifié'}
                        </span>
                      </div>
                      <div className="dash-account-row">
                        <span>🔑 Connexion via</span>
                        <span>{providerIcon} {user.social_provider || 'Email'}</span>
                      </div>
                      <div className="dash-account-row">
                        <span>🗓 Membre depuis</span>
                        <span>
                          {user.created_at
                            ? new Date(user.created_at).toLocaleDateString('fr-FR', { month:'long', year:'numeric' })
                            : '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Debug */}
              <details className="dash-debug">
                <summary>🐛 Debug — données brutes</summary>
                <pre>{JSON.stringify(user, null, 2)}</pre>
              </details>
            </div>
          )}

          {/* ────────────── PLACEHOLDER VIEWS ────────────── */}
          {activeNav !== 'home' && activeNav !== 'profile' && (
            <PlaceholderView id={activeNav} isRecruteur={isRecruteur} onNav={setNav} />
          )}

        </main>
      </div>
    </div>
  );
}

/* ─── Info row helper ────────────────────────────────────────── */
function InfoRow({ icon, label, value, verified }) {
  return (
    <div className="dash-info-row">
      <span className="dash-info-icon">{icon}</span>
      <span className="dash-info-label">{label}</span>
      <span className="dash-info-value">
        {value || <em>—</em>}
        {verified && <span className="dash-verified">✓ Vérifié</span>}
      </span>
    </div>
  );
}

/* ─── Placeholder for unbuilt pages ─────────────────────────── */
function PlaceholderView({ id, isRecruteur, onNav }) {
  const MAP = {
    jobs:         { icon:'💼', title:'Offres d\'emploi',   desc:'Parcourez les offres et postulez selon votre score de matching IA.' },
    post:         { icon:'➕', title:'Publier une offre',   desc:'Créez une nouvelle offre et laissez l\'IA scorer les candidats.' },
    cv:           { icon:'📄', title:'Analyse CV',          desc:'Uploadez votre CV pour obtenir votre score IA et des recommandations.' },
    applications: { icon:'📨', title:'Candidatures',        desc: isRecruteur ? 'Gérez les candidatures reçues pour vos offres.' : 'Suivez l\'état de vos candidatures en temps réel.' },
    interviews:   { icon:'🎥', title:'Entretiens Vidéo',   desc:'Vos entretiens planifiés avec analyse IA des émotions, voix et gestes.' },
  };
  const page = MAP[id] || { icon:'◈', title:'Page', desc:'En construction.' };

  return (
    <div className="dash-placeholder">
      <div className="dash-placeholder-inner">
        <div className="dash-placeholder-icon">{page.icon}</div>
        <h2>{page.title}</h2>
        <p>{page.desc}</p>
        <button className="dash-btn-gold" onClick={() => onNav('home')}>← Retour au dashboard</button>
      </div>
    </div>
  );
}
