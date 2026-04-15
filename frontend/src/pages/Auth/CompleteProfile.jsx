import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:3000/auth';

const PAYS_DATA = [
  { name: 'Afghanistan', code: '+93', flag: '🇦🇫' },
  { name: 'Afrique du Sud', code: '+27', flag: '🇿🇦' },
  { name: 'Albanie', code: '+355', flag: '🇦🇱' },
  { name: 'Algérie', code: '+213', flag: '🇩🇿' },
  { name: 'Allemagne', code: '+49', flag: '🇩🇪' },
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

const PROFESSIONS = [
  'Développeur / Ingénieur logiciel',
  'Ingénieur (autre)',
  'Designer / UX-UI',
  'Chef de projet / Manager',
  'Commercial / Business développeur',
  'Comptable / Financier',
  'Juriste / Avocat',
  'Médecin / Professionnel de santé',
  'Enseignant / Formateur',
  'Étudiant',
  'Autre',
];

const NIVEAUX = ['Bac', 'BTS / DUT', 'Licence', 'Master', 'Ingénieur', 'Doctorat', 'Autre'];

const DOMAINES = [
  'Informatique / Tech',
  'Finance / Banque',
  'Industrie / Manufacturing',
  'Santé / Médical',
  'Commerce / Retail',
  'Éducation / Formation',
  'Tourisme / Hôtellerie',
  'Télécommunications',
  'Immobilier',
  'Autre',
];

/* ─────────── Styles injectés une fois ─────────── */
const CSS = `
  .cp-page {
    min-height: 100vh;
    background: #f5f6fa;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 2.5rem 1rem 4rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .cp-card {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.06);
    width: 100%;
    max-width: 640px;
    overflow: hidden;
  }

  /* ── Header banner ── */
  .cp-header {
    background: #0f172a;
    padding: 2rem 2rem 1.5rem;
    color: #fff;
  }
  .cp-header-top {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
  }
  .cp-avatar-ring {
    width: 42px; height: 42px;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,.25);
    background: rgba(255,255,255,.1);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .cp-header h2 {
    font-size: 18px; font-weight: 600; margin: 0 0 4px;
    color: #fff;
  }
  .cp-header p {
    font-size: 13px; color: rgba(255,255,255,.6); margin: 0; line-height: 1.5;
  }
  .cp-steps {
    display: flex; gap: 6px; margin-top: 16px;
  }
  .cp-step {
    height: 3px; flex: 1; border-radius: 2px;
    background: rgba(255,255,255,.18);
    transition: background .3s;
  }
  .cp-step.done { background: #6366f1; }
  .cp-step.active { background: #fff; }

  /* ── Body ── */
  .cp-body { padding: 1.75rem 2rem; }

  /* ── Section title ── */
  .cp-section-title {
    font-size: 11px; font-weight: 600; letter-spacing: .08em;
    text-transform: uppercase; color: #94a3b8;
    margin: 0 0 14px;
  }

  /* ── Role toggle ── */
  .cp-role-row {
    display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
    margin-bottom: 24px;
  }
  .cp-role-btn {
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    background: #fff;
    padding: 14px 12px;
    cursor: pointer;
    transition: all .18s;
    display: flex; flex-direction: column;
    align-items: center; gap: 8px;
    text-align: center;
  }
  .cp-role-btn:hover { border-color: #6366f1; background: #f5f3ff; }
  .cp-role-btn.active {
    border-color: #6366f1;
    background: #f5f3ff;
    box-shadow: 0 0 0 3px rgba(99,102,241,.12);
  }
  .cp-role-icon {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    background: #ede9fe;
  }
  .cp-role-btn.active .cp-role-icon { background: #6366f1; }
  .cp-role-label {
    font-size: 13px; font-weight: 600; color: #334155;
  }
  .cp-role-sub {
    font-size: 11px; color: #94a3b8; line-height: 1.3;
  }

  /* ── Divider ── */
  .cp-divider {
    border: none; border-top: 1px solid #f1f5f9;
    margin: 20px 0;
  }

  /* ── Field ── */
  .cp-field { margin-bottom: 14px; }
  .cp-label {
    display: block; font-size: 13px; font-weight: 500;
    color: #475569; margin-bottom: 6px;
  }
  .cp-label span { color: #ef4444; margin-left: 2px; }

  /* ── Input / Select base ── */
  .cp-input, .cp-select {
    width: 100%; height: 42px;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    padding: 0 13px;
    font-size: 14px; color: #1e293b;
    background: #fff;
    outline: none;
    transition: border-color .15s, box-shadow .15s;
    box-sizing: border-box;
    appearance: none;
  }
  .cp-input:focus, .cp-select:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,.12);
  }
  .cp-input::placeholder { color: #cbd5e1; }

  .cp-select-wrap {
    position: relative;
  }
  .cp-select-wrap::after {
    content: '';
    position: absolute; right: 13px; top: 50%;
    transform: translateY(-50%);
    width: 0; height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid #94a3b8;
    pointer-events: none;
  }

  /* ── Phone row ── */
  .cp-phone-row {
    display: flex; gap: 8px;
  }
  .cp-phone-country {
    display: flex; align-items: center; gap: 6px;
    border: 1.5px solid #e2e8f0; border-radius: 10px;
    background: #f8fafc;
    padding: 0 10px 0 12px;
    height: 42px; min-width: 120px;
    position: relative; cursor: pointer;
    transition: border-color .15s;
    flex-shrink: 0;
  }
  .cp-phone-country:focus-within {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,.12);
  }
  .cp-phone-country select {
    position: absolute; inset: 0; opacity: 0;
    width: 100%; height: 100%; cursor: pointer;
  }
  .cp-flag { font-size: 18px; line-height: 1; }
  .cp-dial-code { font-size: 13px; font-weight: 500; color: #475569; }
  .cp-chevron {
    margin-left: 2px;
    width: 0; height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 4px solid #94a3b8;
  }
  .cp-phone-input { flex: 1; }

  /* ── 2-col grid ── */
  .cp-grid-2 {
    display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
  }

  /* ── Error ── */
  .cp-error {
    background: #fef2f2; border: 1px solid #fecaca;
    border-radius: 10px; padding: 10px 14px;
    font-size: 13px; color: #dc2626;
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 14px;
  }

  /* ── Submit button ── */
  .cp-submit {
    width: 100%; height: 46px;
    background: #6366f1; color: #fff;
    border: none; border-radius: 12px;
    font-size: 15px; font-weight: 600;
    cursor: pointer; letter-spacing: .01em;
    transition: background .15s, transform .1s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    margin-top: 4px;
  }
  .cp-submit:hover:not(:disabled) { background: #4f46e5; }
  .cp-submit:active:not(:disabled) { transform: scale(.985); }
  .cp-submit:disabled { opacity: .55; cursor: not-allowed; }

  /* ── Spinner ── */
  .cp-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: cp-spin .7s linear infinite;
  }
  @keyframes cp-spin { to { transform: rotate(360deg); } }

  @media (max-width: 520px) {
    .cp-header, .cp-body { padding-left: 1.25rem; padding-right: 1.25rem; }
    .cp-grid-2 { grid-template-columns: 1fr; }
  }
`;

/* ─────────── Icons SVG ─────────── */
const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M3 18c0-4 3.134-7 7-7s7 3 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const IconBuilding = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
    <rect x="3" y="5" width="14" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M7 5V4a1 1 0 011-1h4a1 1 0 011 1v1" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M7 10h2m4 0h-2m-4 4h2m4 0h-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);
const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
    <path d="M4 10l4.5 4.5L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconAlert = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" style={{flexShrink:0}}>
    <circle cx="10" cy="10" r="8" stroke="#dc2626" strokeWidth="1.5"/>
    <path d="M10 6v4m0 3v1" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const IconProfile = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" stroke="rgba(255,255,255,.8)" strokeWidth="1.5"/>
    <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="rgba(255,255,255,.8)" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);


/* ══════════════════════════════════════════
   Composant principal
══════════════════════════════════════════ */
export default function CompleteProfile() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tempToken = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [selectedFlag, setSelectedFlag] = useState({ flag: '🇹🇳', code: '+216' });

  const [form, setForm] = useState({
    tempToken: tempToken || '',
    role: 'candidat',
    phone: '',
    phone_country: '+216',
    country: 'Tunisie',
    city: '',
    profession: '',
    niveau_etude: '',
    date_naissance: '',
    genre: 'homme',
    nom_societe: '',
    domaine: '',
    poste_rh: '',
    date_creation_societe: '',
  });

  useEffect(() => {
    if (!tempToken) navigate('/signup');
  }, [tempToken, navigate]);

  /* Inject styles once */
  useEffect(() => {
    const id = 'cp-styles';
    if (!document.getElementById(id)) {
      const tag = document.createElement('style');
      tag.id = id;
      tag.textContent = CSS;
      document.head.appendChild(tag);
    }
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handlePhoneCountryChange = (e) => {
    const val = e.target.value;        // "code|flag"
    const [code, flag] = val.split('|');
    setSelectedFlag({ flag, code });
    set('phone_country', code);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API}/signup/social/complete`, form);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la finalisation.');
    } finally {
      setLoading(false);
    }
  };

  /* Étapes visuelles dans le header */
  const steps = [
    { label: 'Compte', done: true  },
    { label: 'Profil', done: false, active: true },
    { label: 'Dashboard', done: false },
  ];

  return (
    <div className="cp-page">
      <div className="cp-card">

        {/* ── Header ── */}
        <div className="cp-header">
          <div className="cp-header-top">
            <div className="cp-avatar-ring">
              <IconProfile />
            </div>
            <div>
              <h2>Compléter votre profil</h2>
              <p>Dernière étape avant d'accéder à votre espace</p>
            </div>
          </div>
          <div className="cp-steps">
            {steps.map((s, i) => (
              <div
                key={i}
                className={`cp-step ${s.done ? 'done' : ''} ${s.active ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="cp-body">
          <form onSubmit={handleSubmit}>

            {/* ── Rôle ── */}
            <div className="cp-section-title">Vous êtes ?</div>
            <div className="cp-role-row">
              <button
                type="button"
                className={`cp-role-btn ${form.role === 'candidat' ? 'active' : ''}`}
                onClick={() => set('role', 'candidat')}
              >
                <div className="cp-role-icon">
                  <IconUser color={form.role === 'candidat' ? '#fff' : '#6366f1'} />
                </div>
                <div>
                  <div className="cp-role-label">Candidat</div>
                  <div className="cp-role-sub">Je cherche un emploi</div>
                </div>
              </button>
              <button
                type="button"
                className={`cp-role-btn ${form.role === 'recruteur' ? 'active' : ''}`}
                onClick={() => set('role', 'recruteur')}
              >
                <div className="cp-role-icon">
                  <IconBuilding color={form.role === 'recruteur' ? '#fff' : '#6366f1'} />
                </div>
                <div>
                  <div className="cp-role-label">Recruteur</div>
                  <div className="cp-role-sub">Je recrute des talents</div>
                </div>
              </button>
            </div>

            <hr className="cp-divider" />

            {/* ── Coordonnées ── */}
            <div className="cp-section-title">Coordonnées</div>

            {/* Téléphone */}
            <div className="cp-field">
              <label className="cp-label">Téléphone <span>*</span></label>
              <div className="cp-phone-row">
                <div className="cp-phone-country">
                  <span className="cp-flag">{selectedFlag.flag}</span>
                  <span className="cp-dial-code">{selectedFlag.code}</span>
                  <span className="cp-chevron" />
                  <select
                    value={`${selectedFlag.code}|${selectedFlag.flag}`}
                    onChange={handlePhoneCountryChange}
                  >
                    {PAYS_DATA.map(p => (
                      <option key={p.name} value={`${p.code}|${p.flag}`}>
                        {p.flag} {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="tel"
                  className="cp-input cp-phone-input"
                  placeholder="Ex : 22 123 456"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Pays + Ville */}
            <div className="cp-grid-2">
              <div className="cp-field" style={{ marginBottom: 0 }}>
                <label className="cp-label">Pays <span>*</span></label>
                <div className="cp-select-wrap">
                  <select
                    className="cp-select"
                    value={form.country}
                    onChange={e => set('country', e.target.value)}
                    required
                  >
                    {PAYS_DATA.map(p => (
                      <option key={p.name} value={p.name}>
                        {p.flag}  {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="cp-field" style={{ marginBottom: 0 }}>
                <label className="cp-label">Ville</label>
                <input
                  type="text"
                  className="cp-input"
                  placeholder="Ex : Tunis"
                  value={form.city}
                  onChange={e => set('city', e.target.value)}
                />
              </div>
            </div>

            <hr className="cp-divider" />

            {/* ── Section Candidat ── */}
            {form.role === 'candidat' && (
              <>
                <div className="cp-section-title">Profil candidat</div>

                <div className="cp-grid-2">
                  <div className="cp-field" style={{ marginBottom: 0 }}>
                    <label className="cp-label">Profession <span>*</span></label>
                    <div className="cp-select-wrap">
                      <select
                        className="cp-select"
                        value={form.profession}
                        onChange={e => set('profession', e.target.value)}
                        required
                      >
                        <option value="">— Choisir —</option>
                        {PROFESSIONS.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="cp-field" style={{ marginBottom: 0 }}>
                    <label className="cp-label">Niveau d'études <span>*</span></label>
                    <div className="cp-select-wrap">
                      <select
                        className="cp-select"
                        value={form.niveau_etude}
                        onChange={e => set('niveau_etude', e.target.value)}
                        required
                      >
                        <option value="">— Choisir —</option>
                        {NIVEAUX.map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="cp-grid-2" style={{ marginTop: 14 }}>
                  <div className="cp-field" style={{ marginBottom: 0 }}>
                    <label className="cp-label">Date de naissance <span>*</span></label>
                    <input
                      type="date"
                      className="cp-input"
                      value={form.date_naissance}
                      onChange={e => set('date_naissance', e.target.value)}
                      required
                    />
                  </div>
                  <div className="cp-field" style={{ marginBottom: 0 }}>
                    <label className="cp-label">Genre</label>
                    <div className="cp-select-wrap">
                      <select
                        className="cp-select"
                        value={form.genre}
                        onChange={e => set('genre', e.target.value)}
                      >
                        <option value="homme">Homme</option>
                        <option value="femme">Femme</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── Section Recruteur ── */}
            {form.role === 'recruteur' && (
              <>
                <div className="cp-section-title">Profil recruteur</div>

                <div className="cp-field">
                  <label className="cp-label">Nom de la société <span>*</span></label>
                  <input
                    type="text"
                    className="cp-input"
                    placeholder="Ex : Tunisie Telecom"
                    value={form.nom_societe}
                    onChange={e => set('nom_societe', e.target.value)}
                    required
                  />
                </div>

                <div className="cp-grid-2">
                  <div className="cp-field" style={{ marginBottom: 0 }}>
                    <label className="cp-label">Domaine <span>*</span></label>
                    <div className="cp-select-wrap">
                      <select
                        className="cp-select"
                        value={form.domaine}
                        onChange={e => set('domaine', e.target.value)}
                        required
                      >
                        <option value="">— Choisir —</option>
                        {DOMAINES.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="cp-field" style={{ marginBottom: 0 }}>
                    <label className="cp-label">Votre poste <span>*</span></label>
                    <input
                      type="text"
                      className="cp-input"
                      placeholder="Ex : DRH, Manager RH"
                      value={form.poste_rh}
                      onChange={e => set('poste_rh', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="cp-field" style={{ marginTop: 14 }}>
                  <label className="cp-label">Date de création de la société</label>
                  <input
                    type="date"
                    className="cp-input"
                    value={form.date_creation_societe}
                    onChange={e => set('date_creation_societe', e.target.value)}
                  />
                </div>
              </>
            )}

            {/* ── Erreur ── */}
            {error && (
              <div className="cp-error">
                <IconAlert />
                {error}
              </div>
            )}

            {/* ── Submit ── */}
            <button type="submit" className="cp-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="cp-spinner" />
                  Finalisation en cours…
                </>
              ) : (
                <>
                  <IconCheck />
                  Accéder au tableau de bord
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}