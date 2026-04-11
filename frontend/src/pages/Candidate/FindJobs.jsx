// src/pages/Candidate/FindJobs.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../pages/Dashboard/Dashboard.css';

const API = 'http://localhost:3000';

function DashSidebar({ navigate }) {
  return (
    <aside className="dash-sidebar">
      <div className="dash-sidebar-top">
        <div className="dash-logo">
          <div className="dash-logo-mark">TS</div>
          <span className="dash-logo-name">TalentSphere</span>
        </div>
      </div>
      <nav className="dash-nav">
        <div className="dash-nav-section">Navigation</div>
        <button className="dash-nav-item" onClick={() => navigate('/dashboard')}>
          <span className="dash-nav-icon">⬡</span> Tableau de bord
        </button>
        <button className="dash-nav-item active">
          <span className="dash-nav-icon">◎</span> Offres d'emploi
        </button>
        <button className="dash-nav-item" onClick={() => navigate('/candidate/my-applications')}>
          <span className="dash-nav-icon">◷</span> Mes candidatures
        </button>
      </nav>
      <div className="dash-sidebar-btm">
        <button className="dash-logout-btn" onClick={() => { localStorage.clear(); navigate('/login'); }}>
          <span>↩</span> Déconnexion
        </button>
      </div>
    </aside>
  );
}

export default function FindJobs() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  useEffect(() => {
    axios.get(`${API}/job-offers`)
      .then(res => { setOffers(res.data); setFiltered(res.data); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = offers;
    if (search) result = result.filter(o =>
      o.title?.toLowerCase().includes(search.toLowerCase()) ||
      o.location?.toLowerCase().includes(search.toLowerCase()) ||
      o.required_skills?.some(s => s.toLowerCase().includes(search.toLowerCase()))
    );
    if (typeFilter) result = result.filter(o => o.employment_type === typeFilter);
    if (levelFilter) result = result.filter(o => o.experience_level === levelFilter);
    setFiltered(result);
  }, [search, typeFilter, levelFilter, offers]);

  if (loading) return (
    <div className="dash-loading">
      <div className="dash-spinner" />
      <span>Chargement des offres</span>
    </div>
  );

  return (
    <div className="dash-layout">
      <DashSidebar navigate={navigate} />
      <div className="dash-main">
        <header className="dash-topbar">
          <div className="dash-page-title">Offres d'emploi</div>
          <div className="dash-topbar-right">
            <span style={{ fontSize: 13, color: 'var(--tx-muted)' }}>{filtered.length} offre{filtered.length !== 1 ? 's' : ''}</span>
          </div>
        </header>
        <main className="dash-content">
          <div className="page-layout">
            <div className="page-header">
              <div>
                <h1>Trouvez votre prochain emploi</h1>
                <p>Parcourez {offers.length} offres disponibles</p>
              </div>
            </div>

            {/* Search & Filters */}
            <div className="search-bar">
              <input
                className="search-input"
                placeholder="🔍  Rechercher un poste, compétence, lieu..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <select className="search-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                <option value="">Tous les types</option>
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="Stage">Stage</option>
                <option value="Freelance">Freelance</option>
              </select>
              <select className="search-select" value={levelFilter} onChange={e => setLevelFilter(e.target.value)}>
                <option value="">Tous niveaux</option>
                <option value="Junior">Junior</option>
                <option value="Mid">Confirmé</option>
                <option value="Senior">Senior</option>
              </select>
            </div>

            {/* Offers Grid */}
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="icon">◎</div>
                <p>Aucune offre ne correspond à votre recherche.</p>
              </div>
            ) : (
              <div className="job-grid">
                {filtered.map(offer => (
                  <div
                    key={offer.id}
                    className="job-offer-card"
                    onClick={() => navigate(`/candidate/jobs/${offer.id}`)}
                  >
                    <div className="job-offer-title">{offer.title}</div>
                    {offer.company_name && (
                      <div className="job-offer-company">🏢 {offer.company_name}</div>
                    )}

                    <div className="job-badges">
                      {offer.employment_type && <span className="job-badge type">{offer.employment_type}</span>}
                      {offer.experience_level && <span className="job-badge level">{offer.experience_level}</span>}
                      {offer.location && <span className="job-badge location">📍 {offer.location}</span>}
                    </div>

                    {offer.required_skills?.length > 0 && (
                      <div className="job-skills">
                        {offer.required_skills.slice(0, 4).map((s, i) => (
                          <span key={i} className="skill-chip">{s}</span>
                        ))}
                        {offer.required_skills.length > 4 && (
                          <span className="skill-chip">+{offer.required_skills.length - 4}</span>
                        )}
                      </div>
                    )}

                    <div className="job-card-footer">
                      <div>
                        {offer.salary_range && (
                          <div className="job-card-salary">💰 {offer.salary_range}</div>
                        )}
                        {offer.application_deadline && (
                          <div className="job-card-date">
                            Deadline: {new Date(offer.application_deadline).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                      </div>
                      <button
                        className="btn-apply"
                        onClick={e => { e.stopPropagation(); navigate(`/candidate/jobs/${offer.id}`); }}
                      >
                        Postuler →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}