// src/pages/Auth/ResetPassword.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import logo from '../../assets/logo.png';

const API = 'http://localhost:3000';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // ✅ DÉCLARER TOUS LES STATES NÉCESSAIRES
  const [email, setEmail] = useState('');
  const [form, setForm] = useState({
    code: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);  // ← C'EST ÇA QUI MANQUAIT !

  // ✅ Récupérer l'email depuis l'URL au montage
  useEffect(() => {
    const rawEmail = searchParams.get('email');
    console.log('🔍 ResetPassword - emailFromUrl:', rawEmail);
    
    if (rawEmail) {
      const decoded = decodeURIComponent(rawEmail);
      console.log('🔍 ResetPassword - email décodé:', decoded);
      setEmail(decoded);
      setReady(true);  // ← Maintenant ça marche !
    } else {
      navigate('/forgot-password', { replace: true });
    }
  }, [searchParams, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
// Dans ResetPassword.jsx - handleSubmit
const handleSubmit = async (e) => {
  e.preventDefault();
  
  const emailToSend = email?.trim();
  if (!emailToSend) {
    setError('Email manquant');
    return;
  }
  
  setLoading(true);
  setError('');
  
  if (form.newPassword !== form.confirmNewPassword) {
    setError('Les mots de passe ne correspondent pas');
    setLoading(false); return;
  }
  if (form.newPassword.length < 6) {
    setError('Minimum 6 caractères');
    setLoading(false); return;
  }

  // ✅ Payload simple
  const payload = {
    email: emailToSend,
    code: String(form.code).trim(),
    newPassword: form.newPassword,
    confirmNewPassword: form.confirmNewPassword
  };
  
  console.log('🚀 ENVOI:', payload);

  try {
    // ✅ Envoi simple avec JSON
    await axios.post(`${API}/auth/reset-password`, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    alert('✅ Mot de passe modifié !');
    navigate('/login', { replace: true });
    
  } catch (err) {
    const msg = err.response?.data?.message || 'Erreur';
    console.error('❌ Backend error:', msg);
    setError('❌ ' + msg);
  } finally {
    setLoading(false);
  }
};
  // ✅ Afficher un loader tant que l'email n'est pas chargé
  if (!ready) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
            <img src={logo} alt="TalentSphere" style={{ width: 40, height: 40 }} />
            <span className="logo-text">Talent<span className="logo-accent">Sphere</span></span>
          </div>
          <p style={{textAlign:'center', padding: 20}}>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
          <img src={logo} alt="TalentSphere" style={{ width: 40, height: 40 }} />
          <span className="logo-text">Talent<span className="logo-accent">Sphere</span></span>
        </div>
        <h2>🔐 Réinitialiser le mot de passe</h2>
        <p className="auth-subtitle">Pour : <strong>{email}</strong></p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Code de vérification *</label>
            <input 
              type="text" 
              name="code" 
              value={form.code} 
              onChange={handleChange} 
              placeholder="Ex: 123456" 
              maxLength={6}
              required 
            />
          </div>
          <div className="field">
            <label>Nouveau mot de passe *</label>
            <input 
              type="password" 
              name="newPassword" 
              value={form.newPassword} 
              onChange={handleChange} 
              placeholder="Min. 6 caractères" 
              minLength={6}
              required 
            />
          </div>
          <div className="field">
            <label>Confirmer le mot de passe *</label>
            <input 
              type="password" 
              name="confirmNewPassword" 
              value={form.confirmNewPassword} 
              onChange={handleChange} 
              placeholder="Retapez le mot de passe" 
              required 
            />
          </div>
          {error && <div className="error-msg">{error}</div>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Validation...' : '✅ Valider'}
          </button>
        </form>
        <p className="auth-switch">
          <Link to="/login">← Retour connexion</Link>
        </p>
      </div>
    </div>
  );
}