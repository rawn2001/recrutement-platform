import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
export default function Home() {
  const navigate = useNavigate();
  
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f0ff 0%, #fff5f7 100%)' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 10 }}>
<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
  <img src={logo} alt="TalentSphere" style={{ width: 36, height: 36, objectFit: 'contain' }} />
  <span style={{ fontSize: '20px', fontWeight: '700' }}>Talent<span style={{ color: '#6C63FF' }}>Sphere</span></span>
</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/login')} style={{ padding: '8px 18px', borderRadius: 8, border: '1.5px solid #e5e7eb', background: 'transparent', cursor: 'pointer' }}>Connexion</button>
          <button onClick={() => navigate('/signup')} style={{ padding: '8px 18px', borderRadius: 8, background: '#6C63FF', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>S'inscrire</button>
        </div>
      </nav>
      
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: '#EEEDFE', color: '#534AB7', fontSize: 13, fontWeight: 500, padding: '6px 16px', borderRadius: 20, marginBottom: 20 }}>
          Plateforme de recrutement intelligente
        </div>
        <h1 style={{ fontSize: 42, fontWeight: 600, lineHeight: 1.2, marginBottom: 16 }}>
          Trouvez <span style={{ color: '#6C63FF' }}>votre talent</span><br/>ou votre <span style={{ color: '#6C63FF' }}>opportunité</span>
        </h1>
        <p style={{ fontSize: 17, color: '#6B7280', marginBottom: 36 }}>
          TalentSphere connecte les meilleurs candidats aux entreprises qui les cherchent.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/signup')} style={{ padding: '14px 32px', background: '#6C63FF', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            Commencer gratuitement
          </button>
          <button onClick={() => navigate('/login')} style={{ padding: '14px 32px', background: 'transparent', color: '#1A1A2E', border: '1.5px solid #e5e7eb', borderRadius: 12, fontSize: 15, cursor: 'pointer' }}>
            Se connecter
          </button>
        </div>
      </div>
    </div>
  );
}