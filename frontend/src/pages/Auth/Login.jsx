// src/pages/Auth/Login.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';


const BACKEND_URL = 'http://localhost:3000';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    const userJson = searchParams.get('user');
    
    if (token) {
      console.log('✅ Token OAuth reçu dans Login');
      localStorage.setItem('token', token);
      if (userJson) {
        try {
          const user = JSON.parse(decodeURIComponent(userJson));
          localStorage.setItem('user', JSON.stringify(user));
        } catch (e) {
          console.error('❌ Erreur parsing user OAuth:', e);
        }
      }
      window.history.replaceState({}, document.title, '/login');
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
    <div className="auth-page" style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #e3d3f3 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <div className="auth-card" style={{
        background: '#ffffff',
        borderRadius: 24,
        padding: 40,
        width: '100%',
        maxWidth: 480,
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
      }}>
        {/* Logo & Badge */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #a8b6f6 0%, #9ecede 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 24
            }}>
              👤
            </div>
            <span style={{ 
              fontSize: 28, 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #667eea 0%, #cbb7e0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              TalentSphere
            </span>
          </div>
          
          {/* Badge sécurisé */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 20,
            fontSize: 13,
            color: '#15803d',
            fontWeight: 500
          }}>
            <div style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#22c55e'
            }} />
            Plateforme RH sécurisée
          </div>
        </div>

        {/* Titre */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ 
            fontSize: 32, 
            fontWeight: 700,
            color: '#1a1a1a',
            marginBottom: 8
          }}>
            Bon retour
          </h1>
          <p style={{ 
            fontSize: 15, 
            color: '#6b7280',
            margin: 0
          }}>
            Connectez-vous à votre espace de travail
          </p>
        </div>

        {/* Boutons sociaux */}
        <div style={{ marginBottom: 24 }}>
          <button 
            type="button" 
            onClick={() => handleSocialLogin('google')}
            style={{
              width: '100%',
              padding: '14px 20px',
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              fontSize: 15,
              fontWeight: 500,
              color: '#374151',
              marginBottom: 12,
              transition: 'all 0.2s',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#667eea';
              e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.boxShadow = 'none';
            }}
          >
            <GoogleIcon /> 
            Continuer avec Google
          </button>
          
          <button 
            type="button" 
            onClick={() => handleSocialLogin('linkedin')}
            style={{
              width: '100%',
              padding: '14px 20px',
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              fontSize: 15,
              fontWeight: 500,
              color: '#374151',
              transition: 'all 0.2s',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#667eea';
              e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.boxShadow = 'none';
            }}
          >
            <LinkedInIcon /> 
            Continuer avec LinkedIn
          </button>
        </div>

        {/* Divider */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 16,
          margin: '28px 0',
          color: '#9ca3af',
          fontSize: 13
        }}>
          <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
          <span>ou avec votre email</span>
          <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ 
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              color: '#374151',
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              EMAIL
            </label>
            <input 
              type="email" 
              name="email" 
              value={form.email} 
              onChange={(e) => setForm({ ...form, email: e.target.value })} 
              placeholder="vous@entreprise.com"
              required 
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                fontSize: 15,
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: 8 }}>
            <label style={{ 
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              color: '#374151',
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              MOT DE PASSE
            </label>
            <input 
              type="password" 
              name="password" 
              value={form.password} 
              onChange={(e) => setForm({ ...form, password: e.target.value })} 
              placeholder="••••••••"
              required 
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                fontSize: 15,
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: '12px 16px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              color: '#dc2626',
              fontSize: 14,
              marginBottom: 16
            }}>
              {error}
            </div>
          )}

          {/* Mot de passe oublié */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <button 
              type="button" 
              onClick={() => navigate('/forgot-password')}
              style={{
                background: 'none',
                border: 'none',
                color: '#667eea',
                fontSize: 14,
                cursor: 'pointer',
                fontWeight: 500,
                padding: 0,
                textDecoration: 'none'
              }}
            >
              Mot de passe oublié ?
            </button>
          </div>

          {/* Bouton de connexion */}
          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 20px',
              background: loading ? '#9ca3af' : '#ffffff',
              color: loading ? '#6b7280' : '#667eea',
              border: '2px solid #667eea',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.background = '#667eea';
                e.target.style.color = '#ffffff';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.background = '#ffffff';
                e.target.style.color = '#667eea';
              }
            }}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {/* Footer */}
        <p style={{ 
          textAlign: 'center', 
          marginTop: 28,
          fontSize: 14,
          color: '#6b7280',
          margin: 0
        }}>
          Pas encore de compte ?{' '}
          <Link 
            to="/signup" 
            style={{
              color: '#667eea',
              textDecoration: 'none',
              fontWeight: 600
            }}
          >
            S'inscrire gratuitement
          </Link>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
    </svg>
  );
}