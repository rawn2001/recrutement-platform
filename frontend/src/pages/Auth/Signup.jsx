import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();

  const handleSocial = (provider: 'google' | 'linkedin') => {
    window.location.href = `http://localhost:3000/auth/${provider}?role=candidat`;
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-text">Talent<span className="logo-accent">Sphere</span></span>
        </div>
        <h2>Créer un compte</h2>
        <p className="auth-subtitle">Rejoignez TalentSphere dès maintenant</p>

        <div className="social-buttons">
          <button className="btn-social btn-google" onClick={() => handleSocial('google')}>
            <GoogleIcon /> Continuer avec Google
          </button>
          <button className="btn-social btn-linkedin" onClick={() => handleSocial('linkedin')}>
            <LinkedInIcon /> Continuer avec LinkedIn
          </button>
        </div>

        <div className="divider"><span>ou choisissez votre profil</span></div>

        <div className="role-cards">
          <button className="role-card" onClick={() => navigate('/signup/candidat')}>
            <div className="role-icon">👤</div>
            <div className="role-title">Candidat</div>
            <div className="role-desc">Je cherche un emploi</div>
          </button>
          <button className="role-card" onClick={() => navigate('/signup/recruteur')}>
            <div className="role-icon">🏢</div>
            <div className="role-title">Recruteur</div>
            <div className="role-desc">Je recrute des talents</div>
          </button>
        </div>

        <p className="auth-switch">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/><path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/><path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18z"/><path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/></svg>;
}

function LinkedInIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
}