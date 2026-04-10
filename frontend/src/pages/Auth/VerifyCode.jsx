import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const API = 'http://localhost:3000/auth';

export default function VerifyCode() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleDigit = (i, val) => {
    const next = [...digits];
    next[i] = val.slice(-1);
    setDigits(next);
    if (val && i < 5) {
      document.getElementById(`otp-${i + 1}`)?.focus();
    }
    if (i === 5 && val) verify(next.join(''));
  };

  const verify = async (code) => {
    if (code.length !== 6) return;
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API}/verify/${userId}`, { code, userId: Number(userId) });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Code incorrect');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    try {
      await axios.post(`${API}/resend-verification`, { userId: Number(userId) });
      setTimer(60);
      alert('Nouveau code envoyé !');
    } catch {
      alert('Erreur lors de l\'envoi');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-text">Talent<span className="logo-accent">Sphere</span></span>
        </div>
        <h2>Vérification</h2>
        <p className="auth-subtitle">Code à 6 chiffres envoyé par email ou SMS</p>
        
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', margin: '24px 0' }}>
          {digits.map((d, i) => (
            <input key={i} id={`otp-${i}`} type="text" inputMode="numeric"
              value={d} onChange={e => handleDigit(i, e.target.value)}
              style={{ width: 52, height: 56, textAlign: 'center', fontSize: 22, fontWeight: 600, border: '1.5px solid #e5e7eb', borderRadius: 10, background: '#fff' }}
              maxLength={1} />
          ))}
        </div>
        
        {error && <div className="error-msg">{error}</div>}
        
        <button className="btn-primary" onClick={() => verify(digits.join(''))} disabled={loading || digits.some(d => !d)}>
          {loading ? 'Vérification...' : 'Confirmer'}
        </button>
        
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: '#6B7280' }}>
          {timer > 0 ? `Renvoyer dans ${timer}s` : <button onClick={resend} style={{ background: 'none', border: 'none', color: '#6C63FF', cursor: 'pointer', textDecoration: 'underline' }}>Renvoyer le code</button>}
        </p>
      </div>
    </div>
  );
}