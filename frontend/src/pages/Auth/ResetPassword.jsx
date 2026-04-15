// src/pages/Auth/ResetPassword.jsx
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:3000';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || ''; // Email passé depuis ForgotPassword
  
  const [formData, setFormData] = useState({
    code: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Validation frontend
    if (formData.code.length !== 6) {
      return setMessage({ type: 'error', text: '❌ Le code doit contenir 6 chiffres' });
    }
    if (formData.newPassword.length < 6) {
      return setMessage({ type: 'error', text: '❌ Le mot de passe doit contenir au moins 6 caractères' });
    }
    if (formData.newPassword !== formData.confirmNewPassword) {
      return setMessage({ type: 'error', text: '❌ Les mots de passe ne correspondent pas' });
    }

    try {
      await axios.post(`${API}/auth/reset-password`, {
        email,
        code: formData.code,
        newPassword: formData.newPassword,
        confirmNewPassword: formData.confirmNewPassword
      });
      
      setMessage({ type: 'success', text: '✅ Mot de passe mis à jour ! Redirection...' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMessage({ type: 'error', text: '❌ ' + (err.response?.data?.message || 'Erreur') });
    } finally {
      setLoading(false);
    }
  };

  // Si pas d'email, rediriger vers forgot-password
  if (!email) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <p>Email manquant. <button className="btn-back" onClick={() => navigate('/forgot-password')}>Retourner</button></p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>🔐 Nouveau mot de passe</h2>
        <p style={{color:'#64748b', marginBottom:20}}>
          Code envoyé à : <strong>{email}</strong>
        </p>
        
        {message.text && (
          <div className={message.type === 'success' ? 'success-msg' : 'error-msg'} style={{marginBottom:16}}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Code de vérification (6 chiffres) *</label>
            <input 
              type="text" 
              name="code"
              value={formData.code} 
              onChange={handleChange} 
              required 
              placeholder="123456"
              maxLength={6}
              style={{textAlign:'center', letterSpacing:'8px', fontSize:'20px'}}
            />
          </div>
          <div className="field">
            <label>Nouveau mot de passe * (min. 6 caractères)</label>
            <input 
              type="password" 
              name="newPassword"
              value={formData.newPassword} 
              onChange={handleChange} 
              required 
              minLength={6}
            />
          </div>
          <div className="field">
            <label>Confirmer le mot de passe *</label>
            <input 
              type="password" 
              name="confirmNewPassword"
              value={formData.confirmNewPassword} 
              onChange={handleChange} 
              required 
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{width:'100%'}}>
            {loading ? 'Mise à jour...' : '🔐 Changer mon mot de passe'}
          </button>
        </form>

        <button className="btn-back" onClick={() => navigate('/forgot-password')}>
          ← Renvoyer un code
        </button>
      </div>
    </div>
  );
}