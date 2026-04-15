// src/pages/Auth/ForgotPassword.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import logo from '../../assets/logo.png';

const API = 'http://localhost:3000';

export default function ForgotPassword() {
  const navigate = useNavigate();
  
  // ✅ États du formulaire
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // ✅ États de l'interface
  const [step, setStep] = useState(1); // 1=email, 2=code, 3=new password
  const [message, setMessage] = useState('');
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);

  // ✅ Étape 1: Envoyer le code
  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Email invalide');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await axios.post(`${API}/auth/forgot-password`, { email: email.trim() });
      setMessage('✅ Code envoyé ! Vérifiez votre boîte mail.');
      setStep(2); // Passer à l'étape code
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur envoi code');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Étape 2: Vérifier le code
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Le code doit contenir 6 chiffres');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // ✅ Appel backend pour vérifier le code
      await axios.post(`${API}/auth/verify-reset-code`, {
        email: email.trim(),
        code: code.trim()
      });
      
      setMessage('✅ Code valide ! Créez votre nouveau mot de passe.');
      setStep(3); // Passer à l'étape nouveau mot de passe
    } catch (err) {
      setError(err.response?.data?.message || 'Code incorrect ou expiré');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Étape 3: Changer le mot de passe
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      setError('Minimum 6 caractères requis');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await axios.post(`${API}/auth/reset-password`, {
        email: email.trim(),
        code: code.trim(),
        newPassword,
        confirmNewPassword: confirmPassword
      });
      
      alert('✅ Mot de passe modifié avec succès ! Connectez-vous.');
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur changement mot de passe');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Revenir à l'étape précédente
  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError('');
      setMessage('');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
          <img src={logo} alt="TalentSphere" style={{ width: 40, height: 40 }} />
          <span className="logo-text">Talent<span className="logo-accent">Sphere</span></span>
        </div>
        
        <h2>🔐 Mot de passe oublié</h2>
        
        {/* ✅ Barre de progression */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, justifyContent: 'center' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              width: 30, height: 4, borderRadius: 2,
              background: s <= step ? '#6366f1' : '#e2e8f0',
              transition: 'background 0.3s'
            }} />
          ))}
        </div>

        {/* ✅ Étape 1: Email */}
        {step === 1 && (
          <form onSubmit={handleSendCode}>
            <p className="auth-subtitle" style={{ marginBottom: 20 }}>
              Entrez votre email pour recevoir un code de vérification
            </p>
            <div className="field">
              <label>Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="vous@exemple.com" 
                required 
                autoComplete="off"
                autoFocus
              />
            </div>
            {error && <div className="error-msg">{error}</div>}
            {message && <div className="success-msg">{message}</div>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Envoi...' : '📧 Envoyer le code'}
            </button>
          </form>
        )}

        {/* ✅ Étape 2: Code de vérification */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode}>
            <p className="auth-subtitle" style={{ marginBottom: 20 }}>
              Code envoyé à <strong>{email}</strong><br/>
              <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: 13 }}>
                ↩ Changer d'email
              </button>
            </p>
            <div className="field">
              <label>Code de vérification *</label>
              <input 
                type="text" 
                value={code} 
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                placeholder="123456" 
                maxLength={6}
                pattern="\d{6}"
                required 
                style={{ textAlign: 'center', letterSpacing: 8, fontSize: 18 }}
                autoFocus
              />
            </div>
            {error && <div className="error-msg">{error}</div>}
            {message && <div className="success-msg">{message}</div>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn-back" onClick={goBack} style={{ flex: 1 }}>
                ← Retour
              </button>
              <button type="submit" className="btn-primary" disabled={loading || code.length !== 6} style={{ flex: 2 }}>
                {loading ? 'Vérification...' : '✅ Vérifier le code'}
              </button>
            </div>
          </form>
        )}

        {/* ✅ Étape 3: Nouveau mot de passe */}
        {step === 3 && (
          <form onSubmit={handleChangePassword}>
            <p className="auth-subtitle" style={{ marginBottom: 20 }}>
              Créez votre nouveau mot de passe pour <strong>{email}</strong>
            </p>
            <div className="field">
              <label>Nouveau mot de passe *</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                placeholder="Min. 6 caractères" 
                minLength={6}
                required 
              />
            </div>
            <div className="field">
              <label>Confirmer le mot de passe *</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                placeholder="Retapez le mot de passe" 
                required 
              />
            </div>
            {error && <div className="error-msg">{error}</div>}
            {message && <div className="success-msg">{message}</div>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn-back" onClick={goBack} style={{ flex: 1 }}>
                ← Retour
              </button>
              <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 2 }}>
                {loading ? 'Mise à jour...' : '🔐 Changer mon mot de passe'}
              </button>
            </div>
          </form>
        )}

        <p className="auth-switch" style={{ marginTop: 24 }}>
          <Link to="/login">← Retour à la connexion</Link>
        </p>
      </div>
    </div>
  );
}