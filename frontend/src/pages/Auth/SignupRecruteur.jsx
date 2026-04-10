import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';
import logo from '../../assets/logo.png';

const API = 'http://localhost:3000/auth';

const PAYS_DATA = [
  { name: 'Afghanistan', code: '+93', flag: '🇦🇫' },
  { name: 'Afrique du Sud', code: '+27', flag: '🇿🇦' },
  { name: 'Albanie', code: '+355', flag: '🇦🇱' },
  { name: 'Algérie', code: '+213', flag: '🇩🇿' },
  { name: 'Allemagne', code: '+49', flag: '🇩🇪' },
  { name: 'Andorre', code: '+376', flag: '🇦🇩' },
  { name: 'Angola', code: '+244', flag: '🇦🇴' },
  { name: 'Arabie Saoudite', code: '+966', flag: '🇸🇦' },
  { name: 'Argentine', code: '+54', flag: '🇦🇷' },
  { name: 'Arménie', code: '+374', flag: '🇦🇲' },
  { name: 'Australie', code: '+61', flag: '🇦🇺' },
  { name: 'Autriche', code: '+43', flag: '🇦🇹' },
  { name: 'Azerbaïdjan', code: '+994', flag: '🇦🇿' },
  { name: 'Bahreïn', code: '+973', flag: '🇧🇭' },
  { name: 'Bangladesh', code: '+880', flag: '🇧🇩' },
  { name: 'Belgique', code: '+32', flag: '🇧🇪' },
  { name: 'Bénin', code: '+229', flag: '🇧🇯' },
  { name: 'Bolivie', code: '+591', flag: '🇧🇴' },
  { name: 'Bosnie-Herzégovine', code: '+387', flag: '🇧🇦' },
  { name: 'Botswana', code: '+267', flag: '🇧🇼' },
  { name: 'Brésil', code: '+55', flag: '🇧🇷' },
  { name: 'Bulgarie', code: '+359', flag: '🇧🇬' },
  { name: 'Burkina Faso', code: '+226', flag: '🇧🇫' },
  { name: 'Burundi', code: '+257', flag: '🇧🇮' },
  { name: 'Cambodge', code: '+855', flag: '🇰🇭' },
  { name: 'Cameroun', code: '+237', flag: '🇨🇲' },
  { name: 'Canada', code: '+1', flag: '🇨🇦' },
  { name: 'Chili', code: '+56', flag: '🇨🇱' },
  { name: 'Chine', code: '+86', flag: '🇨🇳' },
  { name: 'Chypre', code: '+357', flag: '🇨🇾' },
  { name: 'Colombie', code: '+57', flag: '🇨🇴' },
  { name: 'Congo', code: '+242', flag: '🇨🇬' },
  { name: 'Corée du Sud', code: '+82', flag: '🇰🇷' },
  { name: "Côte d'Ivoire", code: '+225', flag: '🇨🇮' },
  { name: 'Croatie', code: '+385', flag: '🇭🇷' },
  { name: 'Cuba', code: '+53', flag: '🇨🇺' },
  { name: 'Danemark', code: '+45', flag: '🇩🇰' },
  { name: 'Djibouti', code: '+253', flag: '🇩🇯' },
  { name: 'Égypte', code: '+20', flag: '🇪🇬' },
  { name: 'Émirats Arabes Unis', code: '+971', flag: '🇦🇪' },
  { name: 'Équateur', code: '+593', flag: '🇪🇨' },
  { name: 'Espagne', code: '+34', flag: '🇪🇸' },
  { name: 'Estonie', code: '+372', flag: '🇪🇪' },
  { name: 'États-Unis', code: '+1', flag: '🇺🇸' },
  { name: 'Éthiopie', code: '+251', flag: '🇪🇹' },
  { name: 'Finlande', code: '+358', flag: '🇫🇮' },
  { name: 'France', code: '+33', flag: '🇫🇷' },
  { name: 'Gabon', code: '+241', flag: '🇬🇦' },
  { name: 'Gambie', code: '+220', flag: '🇬🇲' },
  { name: 'Ghana', code: '+233', flag: '🇬🇭' },
  { name: 'Grèce', code: '+30', flag: '🇬🇷' },
  { name: 'Guatemala', code: '+502', flag: '🇬🇹' },
  { name: 'Guinée', code: '+224', flag: '🇬🇳' },
  { name: 'Haïti', code: '+509', flag: '🇭🇹' },
  { name: 'Honduras', code: '+504', flag: '🇭🇳' },
  { name: 'Hongrie', code: '+36', flag: '🇭🇺' },
  { name: 'Inde', code: '+91', flag: '🇮🇳' },
  { name: 'Indonésie', code: '+62', flag: '🇮🇩' },
  { name: 'Irak', code: '+964', flag: '🇮🇶' },
  { name: 'Iran', code: '+98', flag: '🇮🇷' },
  { name: 'Irlande', code: '+353', flag: '🇮🇪' },
  { name: 'Islande', code: '+354', flag: '🇮🇸' },
  { name: 'Israël', code: '+972', flag: '🇮🇱' },
  { name: 'Italie', code: '+39', flag: '🇮🇹' },
  { name: 'Jamaïque', code: '+1876', flag: '🇯🇲' },
  { name: 'Japon', code: '+81', flag: '🇯🇵' },
  { name: 'Jordanie', code: '+962', flag: '🇯🇴' },
  { name: 'Kazakhstan', code: '+7', flag: '🇰🇿' },
  { name: 'Kenya', code: '+254', flag: '🇰🇪' },
  { name: 'Koweït', code: '+965', flag: '🇰🇼' },
  { name: 'Laos', code: '+856', flag: '🇱🇦' },
  { name: 'Lettonie', code: '+371', flag: '🇱🇻' },
  { name: 'Liban', code: '+961', flag: '🇱🇧' },
  { name: 'Libye', code: '+218', flag: '🇱🇾' },
  { name: 'Lituanie', code: '+370', flag: '🇱🇹' },
  { name: 'Luxembourg', code: '+352', flag: '🇱🇺' },
  { name: 'Madagascar', code: '+261', flag: '🇲🇬' },
  { name: 'Malaisie', code: '+60', flag: '🇲🇾' },
  { name: 'Mali', code: '+223', flag: '🇲🇱' },
  { name: 'Malte', code: '+356', flag: '🇲🇹' },
  { name: 'Maroc', code: '+212', flag: '🇲🇦' },
  { name: 'Mauritanie', code: '+222', flag: '🇲🇷' },
  { name: 'Maurice', code: '+230', flag: '🇲🇺' },
  { name: 'Mexique', code: '+52', flag: '🇲🇽' },
  { name: 'Moldavie', code: '+373', flag: '🇲🇩' },
  { name: 'Monaco', code: '+377', flag: '🇲🇨' },
  { name: 'Mongolie', code: '+976', flag: '🇲🇳' },
  { name: 'Monténégro', code: '+382', flag: '🇲🇪' },
  { name: 'Mozambique', code: '+258', flag: '🇲🇿' },
  { name: 'Myanmar', code: '+95', flag: '🇲🇲' },
  { name: 'Namibie', code: '+264', flag: '🇳🇦' },
  { name: 'Népal', code: '+977', flag: '🇳🇵' },
  { name: 'Nicaragua', code: '+505', flag: '🇳🇮' },
  { name: 'Niger', code: '+227', flag: '🇳🇪' },
  { name: 'Nigeria', code: '+234', flag: '🇳🇬' },
  { name: 'Norvège', code: '+47', flag: '🇳🇴' },
  { name: 'Nouvelle-Zélande', code: '+64', flag: '🇳🇿' },
  { name: 'Oman', code: '+968', flag: '🇴🇲' },
  { name: 'Ouganda', code: '+256', flag: '🇺🇬' },
  { name: 'Pakistan', code: '+92', flag: '🇵🇰' },
  { name: 'Palestine', code: '+970', flag: '🇵🇸' },
  { name: 'Panama', code: '+507', flag: '🇵🇦' },
  { name: 'Paraguay', code: '+595', flag: '🇵🇾' },
  { name: 'Pays-Bas', code: '+31', flag: '🇳🇱' },
  { name: 'Pérou', code: '+51', flag: '🇵🇪' },
  { name: 'Philippines', code: '+63', flag: '🇵🇭' },
  { name: 'Pologne', code: '+48', flag: '🇵🇱' },
  { name: 'Portugal', code: '+351', flag: '🇵🇹' },
  { name: 'Qatar', code: '+974', flag: '🇶🇦' },
  { name: 'République Tchèque', code: '+420', flag: '🇨🇿' },
  { name: 'Roumanie', code: '+40', flag: '🇷🇴' },
  { name: 'Royaume-Uni', code: '+44', flag: '🇬🇧' },
  { name: 'Russie', code: '+7', flag: '🇷🇺' },
  { name: 'Rwanda', code: '+250', flag: '🇷🇼' },
  { name: 'Sénégal', code: '+221', flag: '🇸🇳' },
  { name: 'Serbie', code: '+381', flag: '🇷🇸' },
  { name: 'Singapour', code: '+65', flag: '🇸🇬' },
  { name: 'Slovaquie', code: '+421', flag: '🇸🇰' },
  { name: 'Slovénie', code: '+386', flag: '🇸🇮' },
  { name: 'Somalie', code: '+252', flag: '🇸🇴' },
  { name: 'Soudan', code: '+249', flag: '🇸🇩' },
  { name: 'Sri Lanka', code: '+94', flag: '🇱🇰' },
  { name: 'Suède', code: '+46', flag: '🇸🇪' },
  { name: 'Suisse', code: '+41', flag: '🇨🇭' },
  { name: 'Syrie', code: '+963', flag: '🇸🇾' },
  { name: 'Tanzanie', code: '+255', flag: '🇹🇿' },
  { name: 'Tchad', code: '+235', flag: '🇹🇩' },
  { name: 'Thaïlande', code: '+66', flag: '🇹🇭' },
  { name: 'Togo', code: '+228', flag: '🇹🇬' },
  { name: 'Tunisie', code: '+216', flag: '🇹🇳' },
  { name: 'Turquie', code: '+90', flag: '🇹🇷' },
  { name: 'Ukraine', code: '+380', flag: '🇺🇦' },
  { name: 'Uruguay', code: '+598', flag: '🇺🇾' },
  { name: 'Venezuela', code: '+58', flag: '🇻🇪' },
  { name: 'Vietnam', code: '+84', flag: '🇻🇳' },
  { name: 'Yémen', code: '+967', flag: '🇾🇪' },
  { name: 'Zambie', code: '+260', flag: '🇿🇲' },
  { name: 'Zimbabwe', code: '+263', flag: '🇿🇼' },
];

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
    verification_type: 'email',
    logo_url: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    if (!words[0]) return '🏢';
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
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-logo">
          <img src={logo} alt="TalentSphere" style={{ width: 40, height: 40, objectFit: 'contain' }} />
          <span className="logo-text">Talent<span className="logo-accent">Sphere</span></span>
        </div>
        <h2>Inscription Recruteur</h2>
        <p className="auth-subtitle">Créez votre compte pour trouver vos talents</p>

        {/* LOGO SOCIÉTÉ */}
        <div className="photo-upload-wrap">
          <div className="photo-circle" onClick={() => fileInputRef.current.click()}>
            {form.logo_url ? (
              <img src={form.logo_url} alt="Logo" className="photo-preview" />
            ) : (
              <span className="photo-initials" style={{ fontSize: 30 }}>{getCompanyInitials()}</span>
            )}
            <div className="photo-overlay">{form.logo_url ? 'Modifier' : 'Ajouter logo'}</div>
          </div>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleLogoChange} />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Nom de la société *</label>
            <input value={form.nom_societe} onChange={e => set('nom_societe', e.target.value)} required placeholder="Nom de votre entreprise" />
          </div>

          <div className="field">
            <label>Email professionnel *</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="contact@entreprise.com" />
          </div>

          {/* MOT DE PASSE + VOIR */}
          <div className="field">
            <label>Mot de passe *</label>
            <div className="input-icon-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => set('password', e.target.value)}
                required minLength={6}
                placeholder="Minimum 6 caractères"
                style={{ paddingRight: 48 }}
              />
              <button
                type="button"
                className="toggle-pw"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
                aria-label={showPassword ? 'Masquer' : 'Afficher'}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* TÉLÉPHONE */}
          <div className="field">
            <label>Téléphone</label>
            <div className="phone-row">
              <div className="custom-select-wrap phone-code-wrap">
                <select
                  value={form.phone_country}
                  onChange={e => set('phone_country', e.target.value)}
                  className="phone-code-select"
                >
                  {PAYS_DATA.map(p => (
                    <option key={p.name + p.code} value={p.code}>
                      {p.flag} {p.code}
                    </option>
                  ))}
                </select>
              </div>
              <input
                value={form.phone}
                onChange={e => set('phone', e.target.value.replace(/[^\d\s-]/g, ''))}
                placeholder="22 333 444"
                className="phone-input"
              />
            </div>
          </div>

          {/* PAYS */}
          <div className="form-grid">
            <div className="field">
              <label>Pays *</label>
              <select value={form.country} onChange={e => set('country', e.target.value)} required>
                {PAYS_DATA.map(p => (
                  <option key={p.name} value={p.name}>{p.flag} {p.name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Ville *</label>
              <input value={form.city} onChange={e => set('city', e.target.value)} required placeholder="Votre ville" />
            </div>
          </div>

          <div className="field">
            <label>Adresse</label>
            <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Rue, quartier..." />
          </div>

          <div className="form-grid">
            <div className="field">
              <label>Domaine d'activité *</label>
              <select value={form.domaine} onChange={e => set('domaine', e.target.value)} required>
                <option value="">-- Choisir --</option>
                {DOMAINES.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Votre poste *</label>
              <select value={form.poste_rh} onChange={e => set('poste_rh', e.target.value)} required>
                <option value="">-- Choisir --</option>
                {POSTES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {form.domaine === 'Autre' && (
            <div className="field">
              <label>Précisez le domaine</label>
              <input value={form.autre_domaine} onChange={e => set('autre_domaine', e.target.value)} placeholder="Votre domaine d'activité" />
            </div>
          )}
          {form.poste_rh === 'Autre' && (
            <div className="field">
              <label>Précisez votre poste</label>
              <input value={form.autre_poste} onChange={e => set('autre_poste', e.target.value)} placeholder="Votre intitulé de poste" />
            </div>
          )}

          <div className="field">
            <label>Date de création de la société</label>
            <input type="date" value={form.date_creation_societe} onChange={e => set('date_creation_societe', e.target.value)} />
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Inscription...' : 'Créer mon compte recruteur'}
          </button>
          <p className="auth-switch">Déjà un compte ? <a href="/login">Se connecter</a></p>
        </form>
      </div>
    </div>
  );
}