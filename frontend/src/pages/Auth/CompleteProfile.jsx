import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:3000/auth';

export default function CompleteProfile() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tempToken = searchParams.get('token');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    tempToken: tempToken || '',
    role: 'candidat',
    phone: '', phone_country: '+216', country: 'Tunisie', city: '',
    profession: '', niveau_etude: '', date_naissance: '', genre: 'homme',
    nom_societe: '', domaine: '', poste_rh: '', date_creation_societe: '',
  });

  useEffect(() => {
    if (!tempToken) navigate('/signup');
  }, [tempToken, navigate]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  
  try {
    const res = await axios.post(`${API}/signup/social/complete`, form);
    
    // ✅ SAUVEGARDER LE TOKEN
    console.log('✅ Token reçu:', res.data.token);
    localStorage.setItem('token', res.data.token);
    
    // ✅ REDIRECTION VERS DASHBOARD
    console.log('🎯 Redirection vers dashboard...');
    navigate('/dashboard');
    
  } catch (err) {
    console.error('❌ Erreur:', err);
    setError(err.response?.data?.message || 'Erreur lors de la finalisation');
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <h2>🔹 Complétez votre profil</h2>
        <p style={{ color: '#6b7280', marginBottom: 20 }}>
          Vos données ont été importées. Ajoutez les infos manquantes pour accéder au dashboard.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Vous êtes ?</label>
            <div className="radio-row">
              <label>
                <input type="radio" name="role" value="candidat" 
                  checked={form.role === 'candidat'} onChange={() => set('role', 'candidat')} /> 
                👤 Candidat
              </label>
              <label>
                <input type="radio" name="role" value="recruteur" 
                  checked={form.role === 'recruteur'} onChange={() => set('role', 'recruteur')} /> 
                🏢 Recruteur
              </label>
            </div>
          </div>

          <div className="form-grid">
            <div className="field"><label>Téléphone *</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} required />
            </div>
            <div className="field"><label>Pays *</label>
              <input value={form.country} onChange={e => set('country', e.target.value)} required />
            </div>
          </div>

          {form.role === 'candidat' ? (
            <>
              <div className="form-grid">
                <div className="field"><label>Profession *</label>
                  <input value={form.profession} onChange={e => set('profession', e.target.value)} required />
                </div>
                <div className="field"><label>Niveau d'études *</label>
                  <input value={form.niveau_etude} onChange={e => set('niveau_etude', e.target.value)} required />
                </div>
              </div>
              <div className="form-grid">
                <div className="field"><label>Date de naissance *</label>
                  <input type="date" value={form.date_naissance} onChange={e => set('date_naissance', e.target.value)} required />
                </div>
                <div className="field"><label>Genre</label>
                  <select value={form.genre} onChange={e => set('genre', e.target.value)}>
                    <option value="homme">Homme</option>
                    <option value="femme">Femme</option>
                  </select>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="field"><label>Nom de la société *</label>
                <input value={form.nom_societe} onChange={e => set('nom_societe', e.target.value)} required />
              </div>
              <div className="form-grid">
                <div className="field"><label>Domaine *</label>
                  <input value={form.domaine} onChange={e => set('domaine', e.target.value)} required />
                </div>
                <div className="field"><label>Votre poste *</label>
                  <input value={form.poste_rh} onChange={e => set('poste_rh', e.target.value)} required />
                </div>
              </div>
              <div className="field"><label>Date de création</label>
                <input type="date" value={form.date_creation_societe} onChange={e => set('date_creation_societe', e.target.value)} required />
              </div>
            </>
          )}

          {error && <div className="error-msg">{error}</div>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Finalisation...' : '✅ Accéder au Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}