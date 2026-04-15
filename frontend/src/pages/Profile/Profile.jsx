// src/pages/Profile/Profile.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:3000';

// ✅ Valeurs par défaut pour tous les champs du formulaire
const DEFAULT_FORM_VALUES = {
  phone: '',
  phone_country: '',
  country: '',
  city: '',
  address: '',
  // Candidat
  nom: '',
  prenom: '',
  profession: '',
  niveau_etude: '',
  date_naissance: '',
  genre: '',
  // Recruteur
  nom_societe: '',
  domaine: '',
  poste_rh: '',
  date_creation_societe: '',
};

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // ✅ Initialiser avec les valeurs par défaut (pas un objet vide !)
  const [form, setForm] = useState(DEFAULT_FORM_VALUES);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const u = res.data;
        setUser(u);
        
        // ✅ Fusionner avec les valeurs par défaut pour éviter undefined
        const initial = {
          ...DEFAULT_FORM_VALUES, // ← Toujours partir des defaults
          phone: u.phone || '',
          phone_country: u.phone_country || '',
          country: u.country || '',
          city: u.city || '',
          address: u.address || '',
        };

        if (u.role === 'candidat' && u.candidatProfile) {
          Object.assign(initial, {
            nom: u.candidatProfile.nom || '',
            prenom: u.candidatProfile.prenom || '',
            profession: u.candidatProfile.profession || '',
            niveau_etude: u.candidatProfile.niveau_etude || '',
            date_naissance: u.candidatProfile.date_naissance || '',
            genre: u.candidatProfile.genre || '',
          });
        } else if (u.role === 'recruteur' && u.recruteurProfile) {
          Object.assign(initial, {
            nom_societe: u.recruteurProfile.nom_societe || '',
            domaine: u.recruteurProfile.domaine || '',
            poste_rh: u.recruteurProfile.poste_rh || '',
            date_creation_societe: u.recruteurProfile.date_creation_societe || '',
          });
        }
        setForm(initial);
      })
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleChange = (e) => {
    // ✅ S'assurer que la valeur n'est jamais undefined
    setForm({ ...form, [e.target.name]: e.target.value || '' });
  };

  
  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); 
    setMessage({ type: '', text: '' });
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/auth/change-password`, passwordForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage({ type: 'success', text: '✅ Mot de passe mis à jour avec succès !' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      setShowPasswordSection(false);
    } catch (err) {
      setMessage({ type: 'error', text: '❌ ' + (err.response?.data?.message || 'Erreur changement mot de passe') });
    } finally {
      setSaving(false);
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setSaving(true); 
  setMessage({ type: '', text: '' });
  
  try {
    const token = localStorage.getItem('token');
    
    // ✅ Payload MINIMAL pour tester
    const payload = {};
    
    // Ajouter seulement les champs modifiés (non vides)
    if (form.city && form.city.trim()) payload.city = form.city.trim();
    if (form.address && form.address.trim()) payload.address = form.address.trim();
    if (form.phone && form.phone.trim()) payload.phone = form.phone.trim();
    if (form.country && form.country.trim()) payload.country = form.country.trim();
    
    console.log('📤 Payload minimal envoyé:', payload);
    
    const res = await axios.put(`${API}/auth/profile`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    localStorage.setItem('user', JSON.stringify(res.data));
    setUser(res.data);
    
    setMessage({ type: 'success', text: '✅ Profil mis à jour avec succès !' });
  } catch (err) {  // ← ✅ PAS de ": any" ici !
    // ✅ Afficher l'erreur EXACTE du backend
    console.error('❌ Erreur backend:', err.response?.data);
    
    setMessage({ 
      type: 'error', 
      text: '❌ ' + (err.response?.data?.message || 'Erreur mise à jour') 
    });
  } finally {
    setSaving(false);
  }
};
  if (loading) return <div style={{padding:40, textAlign:'center'}}>Chargement...</div>;
  if (!user) return null;

  const isRecruteur = user.role === 'recruteur';

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <h2>👤 Mon Profil</h2>
        {message.text && <div className={message.type === 'success' ? 'success-msg' : 'error-msg'}>{message.text}</div>}
        
        <form onSubmit={handleSubmit}>
          <h3>📞 Informations de contact</h3>
          <div className="form-grid">
            <div className="field"><label>Pays</label><input name="country" value={form.country} onChange={handleChange} /></div>
            <div className="field"><label>Ville</label><input name="city" value={form.city} onChange={handleChange} /></div>
            <div className="field"><label>Téléphone</label><input name="phone" value={form.phone} onChange={handleChange} /></div>
            <div className="field"><label>Indicatif</label><input name="phone_country" value={form.phone_country} onChange={handleChange} placeholder="+216" /></div>
          </div>

          {isRecruteur ? (
            <>
              <h3>🏢 Informations Entreprise</h3>
              <div className="form-grid">
                <div className="field"><label>Nom de la société</label><input name="nom_societe" value={form.nom_societe} onChange={handleChange} /></div>
                <div className="field"><label>Domaine d'activité</label><input name="domaine" value={form.domaine} onChange={handleChange} /></div>
                <div className="field"><label>Poste RH</label><input name="poste_rh" value={form.poste_rh} onChange={handleChange} /></div>
                <div className="field"><label>Année de création</label><input name="date_creation_societe" type="date" value={form.date_creation_societe} onChange={handleChange} /></div>
              </div>
            </>
          ) : (
            <>
              <h3>🎓 Informations Candidat</h3>
              <div className="form-grid">
                <div className="field"><label>Prénom</label><input name="prenom" value={form.prenom} onChange={handleChange} /></div>
                <div className="field"><label>Nom</label><input name="nom" value={form.nom} onChange={handleChange} /></div>
                <div className="field"><label>Profession</label><input name="profession" value={form.profession} onChange={handleChange} /></div>
                <div className="field"><label>Niveau d'étude</label><input name="niveau_etude" value={form.niveau_etude} onChange={handleChange} /></div>
                <div className="field"><label>Date de naissance</label><input name="date_naissance" type="date" value={form.date_naissance} onChange={handleChange} /></div>
                <div className="field">
                  <label>Genre</label>
                  <select name="genre" value={form.genre} onChange={handleChange}>
                    <option value="">Sélectionner</option>
                    <option value="homme">Homme</option>
                    <option value="femme">Femme</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* ═══════════════════════════════════════════════════
              🔐 SECTION CHANGER MOT DE PASSE
             ═══════════════════════════════════════════════════ */}
          <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3>🔐 Sécurité</h3>
              <button 
                type="button"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                style={{
                  background: 'none', border: 'none', color: '#6366f1', 
                  cursor: 'pointer', fontSize: 14, fontWeight: 500
                }}
              >
                {showPasswordSection ? 'Masquer ▼' : 'Changer mot de passe ▶'}
              </button>
            </div>
            
            {showPasswordSection && (
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8 }}>
                {user?.social_provider && (
                  <div style={{ 
                    background: '#fef3c7', color: '#92400e', 
                    padding: 12, borderRadius: 6, marginBottom: 12, fontSize: 13 
                  }}>
                    ⚠️ Vous êtes connecté via {user.social_provider === 'google' ? 'Google' : 'LinkedIn'}. 
                    La gestion du mot de passe se fait depuis votre compte {user.social_provider}.
                  </div>
                )}
                
                {!user?.social_provider && (
                  <form onSubmit={handlePasswordSubmit}>
                    <div className="field" style={{ marginBottom: 12 }}>
                      <label>Mot de passe actuel *</label>
                      <input 
                        type="password" 
                        name="currentPassword" 
                        value={passwordForm.currentPassword} 
                        onChange={handlePasswordChange} 
                        required 
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8 }}
                      />
                    </div>
                    <div className="field" style={{ marginBottom: 12 }}>
                      <label>Nouveau mot de passe * (min. 6 caractères)</label>
                      <input 
                        type="password" 
                        name="newPassword" 
                        value={passwordForm.newPassword} 
                        onChange={handlePasswordChange} 
                        required 
                        minLength={6}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8 }}
                      />
                    </div>
                    <div className="field" style={{ marginBottom: 16 }}>
                      <label>Confirmer le nouveau mot de passe *</label>
                      <input 
                        type="password" 
                        name="confirmNewPassword" 
                        value={passwordForm.confirmNewPassword} 
                        onChange={handlePasswordChange} 
                        required 
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8 }}
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="btn-primary" 
                      disabled={saving}
                      style={{ background: '#dc2626' }}
                    >
                      {saving ? 'Mise à jour...' : '🔐 Changer mon mot de passe'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Sauvegarde...' : '💾 Enregistrer les modifications'}
          </button>
        </form>
        <button className="btn-back" onClick={() => navigate('/dashboard')}>← Retour au dashboard</button>
      </div>
    </div>
  );
}