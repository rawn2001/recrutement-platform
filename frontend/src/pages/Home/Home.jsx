import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="pg">
      {/* Background layers */}
      <div className="mesh" />
      <div className="dots" />

      {/* Floating badges */}
      <div className="float-badge fb1">
        <div className="fb-ring"><div className="fb-dot" /></div>
        <div>
          <div className="fb-val">+243</div>
          <div className="fb-text">Offres aujourd'hui</div>
        </div>
      </div>
      <div className="float-badge fb2">
        <div className="fb-ring"><div className="fb-dot" /></div>
        <div>
          <div className="fb-val">98%</div>
          <div className="fb-text">Taux de satisfaction</div>
        </div>
      </div>

      {/* NAVBAR */}
      <nav>
        <div className="lw">
          <div className="logo-wrap">
            <img src={logo} alt="TalentSphere" />
          </div>
          <div className="logo-text">
            <div className="logo-name">TalentSphere</div>
            
          </div>
        </div>

        <div className="nav-pill">
          <button className="npill-item active">Accueil</button>
          <button className="npill-item" onClick={() => navigate('/offres')}>Offres</button>
          <button className="npill-item" onClick={() => navigate('/entreprises')}>Entreprises</button>
          <button className="npill-item" onClick={() => navigate('/about')}>À propos</button>
        </div>

        <div className="nav-right">
          <button className="btn-n-ghost" onClick={() => navigate('/login')}>Connexion</button>
          <button className="btn-n-solid" onClick={() => navigate('/signup')}>S'inscrire</button>
        </div>
      </nav>

      {/* HERO */}
      <div className="hero">
        <div className="h-tag">
          <div className="h-tag-dot" />
          Plateforme de recrutement intelligente
        </div>

        <h1 className="htitle">
          <span className="line1">Connecter les talents</span>
          <span className="line2">aux opportunités</span>
        </h1>

        <p className="h-sub">
          TalentSphere réunit candidats ambitieux et entreprises visionnaires
          — avec la puissance de <strong>l'IA</strong>.
        </p>

        {/* CHOICE CARDS */}
        <div className="choice-section">
          <div className="choice-label">Vous êtes ?</div>
          <div className="choice-row">

            <div className="choice-card candidate" onClick={() => navigate('/signup?role=candidate')}>
              <div className="cc-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="#7C73FF" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="8" r="4"/>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
              </div>
              <div className="cc-text">
                <div className="cc-title">Je suis candidat</div>
                <div className="cc-desc">Trouver mon prochain poste</div>
              </div>
              <div className="cc-arrow">
                <svg viewBox="0 0 10 10" fill="none" stroke="#9D9BB5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 5h6M5 2l3 3-3 3"/>
                </svg>
              </div>
            </div>

            <div className="choice-card recruiter" onClick={() => navigate('/signup?role=recruiter')}>
              <div className="cc-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="#1DB87A" strokeWidth="2" strokeLinecap="round">
                  <rect x="2" y="7" width="20" height="14" rx="2"/>
                  <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                  <line x1="12" y1="12" x2="12" y2="16"/>
                  <line x1="10" y1="14" x2="14" y2="14"/>
                </svg>
              </div>
              <div className="cc-text">
                <div className="cc-title">Je recrute</div>
                <div className="cc-desc">Trouver les meilleurs profils</div>
              </div>
              <div className="cc-arrow">
                <svg viewBox="0 0 10 10" fill="none" stroke="#5DCAA5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 5h6M5 2l3 3-3 3"/>
                </svg>
              </div>
            </div>

          </div>
        </div>

        {/* STATS */}
        <div className="stats-section">
          <div className="stats-inner">
            <div className="stat-item">
              <div className="sn">12<em>K+</em></div>
              <div className="sl">Candidats</div>
            </div>
            <div className="stat-item">
              <div className="sn">3<em>K+</em></div>
              <div className="sl">Entreprises</div>
            </div>
            <div className="stat-item">
              <div className="sn">47<em>K</em></div>
              <div className="sl">Matchs réussis</div>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div className="features">
        <div className="feat f1">
          <div className="feat-accent" />
          <div className="feat-num">94%</div>
          <div className="feat-title">Matching par IA</div>
          <div className="feat-desc">Notre algorithme connecte automatiquement les bons profils aux offres qui correspondent.</div>
          <div className="feat-tag">Précision maximale</div>
        </div>
        <div className="feat f2">
          <div className="feat-accent" />
          <div className="feat-num">∞</div>
          <div className="feat-title">Profil intelligent</div>
          <div className="feat-desc">Créez un profil dynamique qui évolue avec vos compétences et expériences.</div>
          <div className="feat-tag">Mise à jour auto</div>
        </div>
        <div className="feat f3">
          <div className="feat-accent" />
          <div className="feat-num">3×</div>
          <div className="feat-title">Recrutement rapide</div>
          <div className="feat-desc">Réduisez le temps de recrutement de 60% grâce à nos outils de présélection avancés.</div>
          <div className="feat-tag">Temps réduit ×3</div>
        </div>
      </div>
    </div>
  );
}