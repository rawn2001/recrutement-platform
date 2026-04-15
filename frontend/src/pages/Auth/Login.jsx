// src/pages/Auth/Login.jsx
import { useState, useEffect } from 'react'; // ← Ajoute useEffect
import { useNavigate, Link, useSearchParams } from 'react-router-dom'; // ← Ajoute useSearchParams
import axios from 'axios';
import logo from '../../assets/logo.png';

const BACKEND_URL = 'http://localhost:3000';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // ← Pour lire les params d'URL
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ CAPTURER LE TOKEN DEPUIS L'URL (après redirection Google)
  useEffect(() => {
    const token = searchParams.get('token');
    const userJson = searchParams.get('user');
    
    if (token) {
      console.log('✅ Token OAuth reçu dans Login');
      
      // Sauvegarder dans localStorage
      localStorage.setItem('token', token);
      if (userJson) {
        try {
          const user = JSON.parse(decodeURIComponent(userJson));
          localStorage.setItem('user', JSON.stringify(user));
        } catch (e) {
          console.error('❌ Erreur parsing user OAuth:', e);
        }
      }
      
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, '/login');
      
      // Rediriger vers le dashboard
      console.log('🔵 Redirection vers /dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${BACKEND_URL}/auth/login`, form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`🔵 Init ${provider} OAuth...`);
    window.location.href = `${BACKEND_URL}/auth/${provider}`;
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
          <img src={logo} alt="TalentSphere" style={{ width: 40, height: 40, objectFit: 'contain' }} />
          <span className="logo-text">Talent<span className="logo-accent">Sphere</span></span>
        </div>
        <h2>Connexion</h2>
        <p className="auth-subtitle">Bienvenue, connectez-vous à votre compte</p>

        <div className="social-buttons" style={{ marginBottom: 20 }}>
          <button 
            type="button" 
            className="btn-social btn-google" 
            onClick={() => handleSocialLogin('google')}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: 10,
              background: '#fff',
              border: '1px solid #ddd',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              fontSize: 14
            }}
          >
            <GoogleIcon /> Continuer avec Google
          </button>
          
          <button 
            type="button" 
            className="btn-social btn-linkedin" 
            onClick={() => handleSocialLogin('linkedin')}
            style={{
              width: '100%',
              padding: '12px',
              background: '#0077b5',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              fontSize: 14
            }}
          >
            <LinkedInIcon /> Continuer avec LinkedIn
          </button>
        </div>

        <div className="divider" style={{ textAlign: 'center', margin: '20px 0', color: '#666' }}>
          <span>─ ou utilisez votre email ─</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input 
              type="email" 
              name="email" 
              value={form.email} 
              onChange={(e) => setForm({ ...form, email: e.target.value })} 
              placeholder="vous@exemple.com" 
              required 
            />
          </div>
          <div className="field">
            <label>Mot de passe</label>
            <input 
              type="password" 
              name="password" 
              value={form.password} 
              onChange={(e) => setForm({ ...form, password: e.target.value })} 
              placeholder="••••••••" 
              required 
            />
          </div>
          {error && <div className="error-msg">{error}</div>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <div style={{textAlign:'right', marginTop:8}}>
          <button 
            type="button" 
            className="btn-back" 
            onClick={() => navigate('/forgot-password')}
            style={{fontSize:13, padding:0}}
          >
            Mot de passe oublié ?
          </button>
        </div>
        <p className="auth-switch">
          Pas encore de compte ? <Link to="/signup">S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}

// ✅ GoogleIcon
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

// ✅ LinkedInIcon
function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
    </svg>
  );
}