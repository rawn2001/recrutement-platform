// src/pages/Auth/ForgotPassword.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:3000';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.post(`${API}/auth/forgot-password`, { email });
      setMessage({ 
        type: 'success', 
        text: '✅ Si cet email existe, vous recevrez un code de vérification sous peu.' 
      });
      // Optionnel: Rediriger après 3 secondes
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: '❌ ' + (err.response?.data?.message || 'Erreur') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>🔐 Mot de passe oublié</h2>
        <p style={{color:'#64748b', marginBottom:20}}>
          Entrez votre email pour recevoir un code de réinitialisation.
        </p>
        
        {message.text && (
          <div className={message.type === 'success' ? 'success-msg' : 'error-msg'} style={{marginBottom:16}}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email *</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="votre@email.com"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{width:'100%'}}>
            {loading ? 'Envoi...' : '📧 Envoyer le code'}
          </button>
        </form>

        <button className="btn-back" onClick={() => navigate('/login')}>
          ← Retour à la connexion
        </button>
      </div>
    </div>
  );
}