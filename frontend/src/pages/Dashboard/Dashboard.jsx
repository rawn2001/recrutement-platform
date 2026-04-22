// src/pages/Dashboard/Dashboard.jsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';
import logo from '../../assets/logo.png';
import TalentBot from '../../components/ChatBot/TalentBot';

const API = 'http://localhost:3000';

// 🔹 Composant Avatar - VERSION CORRIGÉE
function Avatar({ src, name, size = 42, className = '' }) {
  const initial = name?.[0]?.toUpperCase() || 'U';
  const [error, setError] = useState(false);
  
  if (!src || error) {
    return (
      <div 
        className={`dash-avatar-placeholder ${className}`} 
        style={{ 
          width: size, 
          height: size, 
          borderRadius: '50%', 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 600,
          fontSize: size * 0.4,
          flexShrink: 0
        }}
      >
        {initial}
      </div>
    );
  }
  
  return (
    <img 
      src={src} 
      alt={name || 'Avatar'} 
      className={`dash-avatar-img ${className}`}
      style={{ 
        width: size, 
        height: size, 
        borderRadius: '50%', 
        objectFit: 'cover',
        border: '2px solid #e2e8f0',
        flexShrink: 0
      }}
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
    />
  );
}

const RECRUITER_TIPS = [
  { icon: '✦', title: 'Titre accrocheur', desc: 'Un titre précis augmente les candidatures de 40%.' },
  { icon: '◎', title: 'Listez les skills', desc: 'Séparez par virgules pour le matching IA.' },
  { icon: '💰', title: 'Indiquez le salaire', desc: 'Les offres avec salaire reçoivent 3× plus de vues.' },
  { icon: '📍', title: 'Précisez le lieu', desc: 'Remote / Hybride / Sur site : soyez explicite.' },
];

const CANDIDATE_TIPS = [
  { icon: '📄', title: 'CV à jour', desc: 'Un CV récent améliore votre score de matching IA.' },
  { icon: '🎯', title: 'Postulez ciblé', desc: '5 candidatures ciblées > 20 aléatoires.' },
  { icon: '✦', title: 'Lettre de motivation', desc: 'Personnalisez chaque lettre pour vous démarquer.' },
  { icon: '◷', title: 'Suivez vos statuts', desc: 'Relancez après 7 jours sans réponse.' },
];

const HOT_FIELDS = [
  { label: 'Développement Web', icon: '💻', demand: 94 },
  { label: 'Data & Intelligence Artificielle', icon: '🤖', demand: 98 },
  { label: 'DevOps / Cloud', icon: '☁️', demand: 91 },
  { label: 'Cybersécurité', icon: '🔒', demand: 89 },
  { label: 'Design UX/UI', icon: '🎨', demand: 82 },
  { label: 'Finance & Audit', icon: '📊', demand: 76 },
];

function Sidebar({ user, activePath, navigate, onLogout }) {
  const isRecruteur = user?.role === 'recruteur';
  const name = user?.nom_societe || user?.prenom || user?.first_name || 'Utilisateur';

  const navItems = isRecruteur
    ? [
        { path: '/dashboard', icon: '⬡', label: 'Tableau de bord' },
        { path: '/recruiter/post', icon: '✦', label: 'Publier une offre' },
        { path: '/recruiter/manage', icon: '◈', label: 'Gérer candidatures' },
        { path: '/profile', icon: '👤', label: 'Mon Profil' },
      ]
    : [
        { path: '/dashboard', icon: '⬡', label: 'Tableau de bord' },
        { path: '/candidate/jobs', icon: '◎', label: "Offres d'emploi" },
        { path: '/candidate/my-applications', icon: '◷', label: 'Mes candidatures' },
        { path: '/profile', icon: '👤', label: 'Mon Profil' },
      ];

  return (
    <aside className="dash-sidebar">
      <TalentBot />
      <div className="dash-sidebar-top">
        <div className="dash-logo">
          <img
            src={logo}
            alt="TalentSphere"
            className="dash-logo-img"
            onError={e => { e.target.style.display = 'none'; document.getElementById('dash-logo-fallback').style.display = 'flex'; }}
          />
          <div id="dash-logo-fallback" className="dash-logo-mark" style={{ display: 'none' }}>TS</div>
          <span className="dash-logo-name">TalentSphere</span>
        </div>
      </div>

      <div className="dash-user-card">
        <Avatar src={user?.photo_url} name={name} size={42} />
        <div className="dash-user-info">
          <div className="dash-user-name">{name}</div>
          <span className={`dash-role-badge ${isRecruteur ? 'rec' : 'cand'}`}>
            {isRecruteur ? '🏢 Recruteur' : '🎯 Candidat'}
          </span>
        </div>
      </div>

      <nav className="dash-nav">
        <div className="dash-nav-section">Navigation</div>
        {navItems.map(item => (
          <button
            key={item.path}
            className={`dash-nav-item ${activePath === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="dash-nav-icon">{item.icon}</span>
            <span className="dash-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="dash-sidebar-tips">
        <div className="dash-sidebar-tips-title">
          💡 {isRecruteur ? 'Conseils recruteur' : 'Conseils candidat'}
        </div>
        {(isRecruteur ? RECRUITER_TIPS : CANDIDATE_TIPS).map((tip, i) => (
          <div className="dash-tip-row" key={i}>
            <span className="dash-tip-icon">{tip.icon}</span>
            <div>
              <div className="dash-tip-title">{tip.title}</div>
              <div className="dash-tip-desc">{tip.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-sidebar-btm">
        <button className="dash-logout-btn" onClick={onLogout}>
          <span>↩</span> Déconnexion
        </button>
      </div>
    </aside>
  );
}

function HotFieldsPanel() {
  return (
    <div className="dash-hot-fields">
      <div className="dash-card-header" style={{ padding: '16px 20px 10px' }}>
        <h3>🔥 Secteurs en demande</h3>
        <span className="dash-card-action">Tunisie · 2025</span>
      </div>
      <div style={{ padding: '4px 20px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {HOT_FIELDS.map((f, i) => (
          <div key={i} className="dash-field-row">
            <span className="dash-field-icon">{f.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="dash-field-label">{f.label}</div>
              <div className="dash-field-bar-wrap">
                <div
                  className="dash-field-bar"
                  style={{
                    width: `${f.demand}%`,
                    animationDelay: `${i * 0.1}s`,
                    background: f.demand >= 90
                      ? 'linear-gradient(90deg,#5B5FE8,#9B95FF)'
                      : f.demand >= 80
                        ? 'linear-gradient(90deg,#059669,#34D399)'
                        : 'linear-gradient(90deg,#D97706,#FCD34D)',
                  }}
                />
              </div>
            </div>
            <span className="dash-field-pct" style={{
              color: f.demand >= 90 ? '#5B5FE8' : f.demand >= 80 ? '#059669' : '#D97706'
            }}>{f.demand}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HomeView({ user, stats, navigate }) {
  const isRecruteur = user?.role === 'recruteur';
  const name = user?.nom_societe || user?.prenom || user?.first_name || 'Utilisateur';

  const statCards = isRecruteur
    ? [
        { icon: '◈', label: 'Offres publiées', value: stats.offers, accent: '#5B5FE8', accentBg: 'rgba(91,95,232,0.08)' },
        { icon: '◷', label: 'Candidatures reçues', value: stats.apps, accent: '#059669', accentBg: 'rgba(5,150,105,0.08)' },
        { icon: '◎', label: 'Vues ce mois', value: '—', accent: '#0284C7', accentBg: 'rgba(2,132,199,0.08)' },
        { icon: '✦', label: 'Taux de réponse', value: '—', accent: '#D97706', accentBg: 'rgba(217,119,6,0.08)' },
      ]
    : [
        { icon: '◷', label: 'Candidatures', value: stats.apps, accent: '#5B5FE8', accentBg: 'rgba(91,95,232,0.08)' },
        { icon: '◎', label: 'Offres disponibles', value: '—', accent: '#059669', accentBg: 'rgba(5,150,105,0.08)' },
        { icon: '✦', label: 'En attente', value: '—', accent: '#D97706', accentBg: 'rgba(217,119,6,0.08)' },
        { icon: '⬡', label: 'Score moyen', value: '—', accent: '#0284C7', accentBg: 'rgba(2,132,199,0.08)' },
      ];

  return (
    <div className="dash-home">
      <div className="dash-welcome-banner">
        <div className="dash-welcome-dots" />
        <div className="dash-welcome-left">
          <Avatar src={user?.photo_url} name={name} size={58} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2>Bonjour, {name} 👋</h2>
            <p>{isRecruteur
              ? 'Gérez vos offres et trouvez les meilleurs talents.'
              : "Trouvez l'emploi idéal parmi nos offres."}</p>
          </div>
        </div>
        <div className="dash-welcome-actions">
          <button className="dash-btn-primary" onClick={() => navigate(isRecruteur ? '/recruiter/post' : '/candidate/jobs')}>
            {isRecruteur ? '✦ Publier une offre' : '◎ Voir les offres'}
          </button>
          <button className="dash-btn-outline" onClick={() => navigate(isRecruteur ? '/recruiter/manage' : '/candidate/my-applications')}>
            {isRecruteur ? '◈ Gérer candidatures' : '◷ Mes candidatures'}
          </button>
        </div>
      </div>

      <div className="dash-stats-grid">
        {statCards.map((s, i) => (
          <div className="dash-stat-card" key={i}
            style={{ '--accent': s.accent, '--accent-bg': s.accentBg, animationDelay: `${i * 0.07}s` }}>
            <div className="dash-stat-icon-wrap" style={{ background: s.accentBg }}>
              <span style={{ color: s.accent, fontSize: 20 }}>{s.icon}</span>
            </div>
            <div className="dash-stat-value">{s.value}</div>
            <div className="dash-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="dash-home-main">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="dash-card">
            <div className="dash-card-header"><h3>⚡ Actions rapides</h3></div>
            <div className="dash-card-body">
              <button className="dash-quick-btn primary" onClick={() => navigate(isRecruteur ? '/recruiter/post' : '/candidate/jobs')}>
                <span>{isRecruteur ? '✦' : '◎'}</span>
                {isRecruteur ? 'Publier une offre' : 'Parcourir les offres'}
              </button>
              <button className="dash-quick-btn" onClick={() => navigate(isRecruteur ? '/recruiter/manage' : '/candidate/my-applications')}>
                <span>{isRecruteur ? '◈' : '◷'}</span>
                {isRecruteur ? 'Voir les candidatures' : 'Mes candidatures'}
              </button>
            </div>
          </div>

          <div className="dash-card">
            <div className="dash-card-header">
              <h3>{isRecruteur ? '🏢 Espace recruteur' : '🎯 Espace candidat'}</h3>
            </div>
            <div className="dash-card-body">
              <ul style={{ paddingLeft: 18, fontSize: 13.5, color: 'var(--tx-secondary)', lineHeight: 1.9 }}>
                {isRecruteur ? (
                  <>
                    <li>Publiez des offres d'emploi ciblées</li>
                    <li>Consultez les candidatures reçues</li>
                    <li>Scores de matching IA automatiques</li>
                    <li>Acceptez, refusez ou invitez en entretien</li>
                  </>
                ) : (
                  <>
                    <li>Parcourez toutes les offres disponibles</li>
                    <li>Postulez avec votre CV (PDF/DOC)</li>
                    <li>Score IA de compatibilité instantané</li>
                    <li>Suivez l'état de vos candidatures</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <div className="dash-card">
            <div className="dash-card-header"><h3>🕐 Activité récente</h3></div>
            <div className="dash-card-body">
              <div className="dash-activity-row">
                <div className="dash-activity-dot">👋</div>
                <div>
                  <div className="dash-activity-text">Connexion réussie</div>
                  <div className="dash-activity-time">À l'instant</div>
                </div>
              </div>
              <div className="dash-activity-row">
                <div className="dash-activity-dot">⬡</div>
                <div>
                  <div className="dash-activity-text">Tableau de bord chargé</div>
                  <div className="dash-activity-time">Il y a quelques secondes</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <HotFieldsPanel />

          <div className="dash-promo-card">
            <div className="dash-promo-bg" />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: 30, marginBottom: 10 }}>{isRecruteur ? '🚀' : '🌟'}</div>
              <div className="dash-promo-title">
                {isRecruteur ? 'Trouvez le talent idéal' : 'Votre prochain emploi vous attend'}
              </div>
              <div className="dash-promo-desc">
                {isRecruteur
                  ? "Notre IA analyse chaque CV et vous présente les candidats les plus compatibles avec votre offre."
                  : "Avec le score IA, votre candidature est automatiquement évaluée pour maximiser vos chances."}
              </div>
              <button className="dash-promo-btn" onClick={() => navigate(isRecruteur ? '/recruiter/post' : '/candidate/jobs')}>
                {isRecruteur ? 'Publier maintenant →' : 'Explorer les offres →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ offers: 0, apps: 0 });
  const [loading, setLoading] = useState(true);

  // ✅ Fonction pour charger les données utilisateur (mémorisée avec useCallback)
  const fetchUserData = useCallback(async (token) => {
    try {
      const res = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      
      if (res.data.role === 'recruteur') {
        const r = await axios.get(`${API}/job-offers/my-offers`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats({ offers: r.data.length, apps: 0 });
      } else {
        const r = await axios.get(`${API}/job-applications/my-applications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats({ offers: 0, apps: r.data.length });
      }
    } catch (err) {
      console.error('❌ Erreur chargement user:', err);
      localStorage.clear();
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

 // ✅ useEffect principal : chargement initial + capture token OAuth
useEffect(() => {
  // 1️⃣ D'abord, vérifier si on a un token OAuth dans l'URL
  const urlParams = new URLSearchParams(location.search);
  const oauthToken = urlParams.get('token');
  const userJson = urlParams.get('user');
  
  if (oauthToken) {
    console.log('✅ Token OAuth reçu dans Dashboard');
    
    // Sauvegarder le token OAuth dans localStorage
    localStorage.setItem('token', oauthToken);
    if (userJson) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userJson));
        localStorage.setItem('user', JSON.stringify(parsedUser));
        setUser(parsedUser);
      } catch (e) {
        console.error('❌ Erreur parsing user OAuth:', e);
      }
    }
    
    // Nettoyer l'URL
    window.history.replaceState({}, document.title, '/dashboard');
    
    // Recharger les données avec le nouveau token
    fetchUserData(oauthToken);
    return; // ← IMPORTANT: sortir de la fonction
  }

  // 2️⃣ Ensuite, vérifier localStorage
  const token = localStorage.getItem('token');
  
  // Si pas de token dans localStorage, rediriger vers login
  if (!token) {
    navigate('/login');
    return;
  }

  // 3️⃣ Chargement normal avec le token existant
  fetchUserData(token);
}, [location, fetchUserData, navigate]);
  const handleLogout = () => { 
    localStorage.clear(); 
    navigate('/login'); 
  };

  if (loading) return (
    <div className="dash-loading">
      <div className="dash-spinner" />
      <span>Chargement de votre espace</span>
    </div>
  );
  
  if (!user) return null;

  const name = user.nom_societe || user.prenom || user.first_name || 'Utilisateur';

  return (
    <div className="dash-layout">
      <Sidebar user={user} activePath={location.pathname} navigate={navigate} onLogout={handleLogout} />
      <div className="dash-main">
        <header className="dash-topbar">
          <div className="dash-page-title">Tableau de bord</div>
          <div className="dash-topbar-right">
            <button className="dash-topbar-btn" title="Notifications">🔔</button>
            <Avatar src={user?.photo_url} name={name} size={36} className="dash-topbar-avatar-img" />
          </div>
        </header>
        <main className="dash-content">
          <HomeView user={user} stats={stats} navigate={navigate} />
        </main>
      </div>
    </div>
  );
}