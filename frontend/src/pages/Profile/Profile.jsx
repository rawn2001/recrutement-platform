// src/pages/Profile/Profile.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:3000';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [form, setForm] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const u = res.data;
        setUser(u);
        
        // Initialiser le formulaire avec les données existantes
        const initial = {
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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setMessage({ type: '', text: '' });
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API}/auth/profile`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
      setMessage({ type: 'success', text: '✅ Profil mis à jour avec succès !' });
    } catch (err) {
      setMessage({ type: 'error', text: '❌ ' + (err.response?.data?.message || 'Erreur mise à jour') });
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
          
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Sauvegarde...' : '💾 Enregistrer les modifications'}
          </button>
        </form>
        <button className="btn-back" onClick={() => navigate('/dashboard')}>← Retour au dashboard</button>
      </div>
    </div>
  );
}