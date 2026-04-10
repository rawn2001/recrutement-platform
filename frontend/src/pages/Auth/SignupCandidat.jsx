import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';
import logo from '../../assets/logo.png';
const API = 'http://localhost:3000/auth';
const PAYS = ['Tunisie', 'France', 'Algérie', 'Maroc', 'Belgique', 'Canada'];
const INDICATIFS = ['+216', '+33', '+213', '+212', '+32', '+1'];
const PROFESSIONS = ['Étudiant', 'Ingénieur', 'Développeur', 'Designer', 'Manager', 'Autre'];
const NIVEAUX = ['Bac', 'Licence', 'Master', 'Doctorat', 'BTS'];

export default function SignupCandidat() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [form, setForm] = useState({
    email: '', password: '', phone: '', phone_country: '+216',
    country: 'Tunisie', city: '', address: '',
    nom: '', prenom: '', genre: 'homme', date_naissance: '',
    profession: '', niveau_etude: '', autre_profession: '',
    verification_type: 'email', // ✅ Forcé à email
    photo_url: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => set('photo_url', reader.result);
      reader.readAsDataURL(file);
    }
  };

  const getInitials = () => {
    const n = (form.nom || '').trim().charAt(0).toUpperCase();
    const p = (form.prenom || '').trim().charAt(0).toUpperCase();
    return n + p;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        role: 'candidat',
        profession: form.profession === 'Autre' ? form.autre_profession : form.profession,
        photo_url: form.photo_url || undefined,
        phone_verified: false, // ❌ Pas de vérification SMS
      };
      const res = await axios.post(`${API}/signup/email`, payload);
      navigate(`/verify/${res.data.userId}`); // ✅ Redirection vers vérification email
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
          <img src={logo} alt="TalentSphere" style={{ width: 40, height: 40, objectFit: 'contain' }} />
          <span className="logo-text">Talent<span className="logo-accent">Sphere</span></span>
        </div>
        <h2>Inscription Candidat</h2>
        <p className="auth-subtitle">Créez votre profil pour trouver votre emploi</p>

        {/* 📸 UPLOAD PHOTO */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div 
            onClick={() => fileInputRef.current.click()}
            style={{
              width: 110, height: 110, borderRadius: '50%', overflow: 'hidden',
              background: form.photo_url ? '#fff' : '#e0e7ff',
              border: '3px solid #6C63FF', cursor: 'pointer', position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(108, 99, 255, 0.2)'
            }}
          >
            {form.photo_url ? (
              <img src={form.photo_url} alt="Aperçu" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 36, fontWeight: 'bold', color: '#4f46e5' }}>
                {getInitials() || '👤'}
              </span>
            )}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 11, textAlign: 'center', padding: 4 }}>
              {form.photo_url ? 'Modifier' : 'Ajouter'}
            </div>
          </div>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handlePhotoChange} />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field"><label>Prénom *</label><input value={form.prenom} onChange={e => set('prenom', e.target.value)} required /></div>
            <div className="field"><label>Nom *</label><input value={form.nom} onChange={e => set('nom', e.target.value)} required /></div>
          </div>
          <div className="field"><label>Email *</label><input type="email" value={form.email} onChange={e => set('email', e.target.value)} required /></div>
          <div className="field"><label>Mot de passe *</label><input type="password" value={form.password} onChange={e => set('password', e.target.value)} required minLength={6} /></div>
          
          {/* 📞 Téléphone (optionnel, pas de vérification) */}
          <div className="field">
            <label>Téléphone</label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <select value={form.phone_country} onChange={e => set('phone_country', e.target.value)} style={{ flex: '0 0 100px', padding: '10px', borderRadius: 10, border: '1.5px solid #e5e7eb' }}>
                {INDICATIFS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
              <input value={form.phone} onChange={e => set('phone', e.target.value.replace(/[^\d\s-]/g, ''))} placeholder="22 333 444" style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb' }} />
            </div>
          </div>

          <div className="form-grid">
            <div className="field"><label>Pays *</label><select value={form.country} onChange={e => set('country', e.target.value)}>{PAYS.map(p => <option key={p}>{p}</option>)}</select></div>
            <div className="field"><label>Ville *</label><input value={form.city} onChange={e => set('city', e.target.value)} required /></div>
          </div>
          <div className="field"><label>Adresse</label><input value={form.address} onChange={e => set('address', e.target.value)} /></div>
          
          <div className="field">
            <label>Genre</label>
            <div className="radio-row">
              <label><input type="radio" value="homme" checked={form.genre === 'homme'} onChange={() => set('genre', 'homme')} /> Homme</label>
              <label><input type="radio" value="femme" checked={form.genre === 'femme'} onChange={() => set('genre', 'femme')} /> Femme</label>
            </div>
          </div>
          <div className="field"><label>Date de naissance *</label><input type="date" value={form.date_naissance} onChange={e => set('date_naissance', e.target.value)} required /></div>
          
          <div className="form-grid">
            <div className="field"><label>Profession *</label><select value={form.profession} onChange={e => set('profession', e.target.value)} required>{PROFESSIONS.map(p => <option key={p}>{p}</option>)}</select></div>
            <div className="field"><label>Niveau d'études *</label><select value={form.niveau_etude} onChange={e => set('niveau_etude', e.target.value)} required>{NIVEAUX.map(n => <option key={n}>{n}</option>)}</select></div>
          </div>
          {form.profession === 'Autre' && <div className="field"><label>Précisez</label><input value={form.autre_profession} onChange={e => set('autre_profession', e.target.value)} /></div>}
          
          {/* ❌ SUPPRIMÉ: Choix Email/SMS & PhoneVerification */}

          {error && <div className="error-msg">{error}</div>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Inscription...' : '✅ Créer mon compte'}
          </button>
          <p className="auth-switch">Déjà un compte ? <a href="/login">Se connecter</a></p>
        </form>
      </div>
    </div>
  );
}