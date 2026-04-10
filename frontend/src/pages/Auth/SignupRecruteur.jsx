import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';
import logo from '../../assets/logo.png';

const API = 'http://localhost:3000/auth';
const PAYS = ['Tunisie', 'France', 'Algérie', 'Maroc', 'Belgique', 'Canada'];
const INDICATIFS = ['+216', '+33', '+213', '+212', '+32', '+1'];
const DOMAINES = ['Informatique', 'Finance', 'Santé', 'Éducation', 'Commerce', 'Industrie', 'Autre'];
const POSTES = ['Responsable RH', 'DRH', 'Manager', 'CEO', 'Chargé de recrutement', 'Autre'];

export default function SignupRecruteur() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    email: '', password: '', phone: '', phone_country: '+216',
    country: 'Tunisie', city: '', address: '',
    nom_societe: '', domaine: '', autre_domaine: '',
    poste_rh: '', autre_poste: '',
    date_creation_societe: '',
    verification_type: 'email', // ✅ Forcé à email
    logo_url: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => set('logo_url', reader.result);
      reader.readAsDataURL(file);
    }
  };

  const getCompanyInitials = () => {
    const words = (form.nom_societe || '').trim().split(/\s+/);
    if (words.length === 0) return '🏢';
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        role: 'recruteur',
        domaine: form.domaine === 'Autre' ? form.autre_domaine : form.domaine,
        poste_rh: form.poste_rh === 'Autre' ? form.autre_poste : form.poste_rh,
        logo_url: form.logo_url || undefined,
        phone_verified: false,
      };
      const res = await axios.post(`${API}/signup/email`, payload);
      navigate(`/verify/${res.data.userId}`);
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
        <h2>Inscription Recruteur</h2>
        <p className="auth-subtitle">Créez votre compte pour trouver vos talents</p>

        {/* 📸 UPLOAD LOGO */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div
            onClick={() => fileInputRef.current.click()}
            style={{
              width: 110, height: 110, borderRadius: '50%', overflow: 'hidden',
              background: form.logo_url ? '#fff' : '#e0e7ff',
              border: '3px solid #6C63FF', cursor: 'pointer', position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(108, 99, 255, 0.2)'
            }}
          >
            {form.logo_url ? (
              <img src={form.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 32, fontWeight: 'bold', color: '#4f46e5' }}>
                {getCompanyInitials()}
              </span>
            )}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 11, textAlign: 'center', padding: 4 }}>
              {form.logo_url ? 'Modifier' : 'Ajouter'}
            </div>
          </div>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleLogoChange} />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field"><label>Nom de la société *</label><input value={form.nom_societe} onChange={e => set('nom_societe', e.target.value)} required /></div>
          <div className="field"><label>Email professionnel *</label><input type="email" value={form.email} onChange={e => set('email', e.target.value)} required /></div>
          <div className="field"><label>Mot de passe *</label><input type="password" value={form.password} onChange={e => set('password', e.target.value)} required minLength={6} /></div>
          
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

          <div className="form-grid">
            <div className="field"><label>Domaine d'activité *</label><select value={form.domaine} onChange={e => set('domaine', e.target.value)} required>{DOMAINES.map(d => <option key={d}>{d}</option>)}</select></div>
            <div className="field"><label>Votre poste *</label><select value={form.poste_rh} onChange={e => set('poste_rh', e.target.value)} required>{POSTES.map(p => <option key={p}>{p}</option>)}</select></div>
          </div>
          {form.domaine === 'Autre' && <div className="field"><label>Précisez le domaine</label><input value={form.autre_domaine} onChange={e => set('autre_domaine', e.target.value)} /></div>}
          {form.poste_rh === 'Autre' && <div className="field"><label>Précisez votre poste</label><input value={form.autre_poste} onChange={e => set('autre_poste', e.target.value)} /></div>}
          <div className="field"><label>Date de création</label><input type="date" value={form.date_creation_societe} onChange={e => set('date_creation_societe', e.target.value)} /></div>

          {/* ❌ SUPPRIMÉ: Choix Email/SMS & PhoneVerification */}

          {error && <div className="error-msg">{error}</div>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Inscription...' : '✅ Créer mon compte recruteur'}
          </button>
          <p className="auth-switch">Déjà un compte ? <a href="/login">Se connecter</a></p>
        </form>
      </div>
    </div>
  );
}