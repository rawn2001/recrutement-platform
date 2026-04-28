// src/pages/Recruiter/InterviewReport.jsx
import React, { useState, useEffect } from 'react';
import './InterviewReport.css';

const API_BASE = process.env.REACT_APP_FLASK_API || 'http://127.0.0.1:5003';

const InterviewReport = ({ sessionId, candidateName, onClose }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Charger le rapport depuis Flask
  useEffect(() => {
    if (!sessionId) return;
    
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/api/session/report/${sessionId}`);
        if (!response.ok) throw new Error('Rapport non trouvé');
        const data = await response.json();
        if (data.success) setReport(data.report);
        else throw new Error(data.error || 'Erreur');
      } catch (err) {
        console.error('❌ Erreur:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [sessionId]);

  // ✅ Fermer avec la touche Échap (Esc)
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // ✅ Fermer en cliquant en dehors du contenu (sur l'overlay)
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getScoreColor = (score) => score >= 70 ? '#4CAF50' : score >= 50 ? '#FFC107' : '#F44336';

  const formatDistribution = (dist, totalFrames = 15) => {
    if (!dist || Object.keys(dist).length === 0) return [];
    const total = Object.values(dist).reduce((a, b) => a + b, 0) || totalFrames;
    return Object.entries(dist).sort((a, b) => b[1] - a[1]).map(([label, count]) => ({
      label, percent: Math.round((count / total) * 100), count
    }));
  };

  // ✅ Loading state
  if (loading) {
    return (
      <div className="report-modal" onClick={handleOverlayClick}>
        <div className="report-content">
          <button className="report-close" onClick={onClose} title="Fermer">✕</button>
          <div className="report-loading">
            <div className="spinner" />
            <p>📊 Chargement du rapport...</p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Error state
  if (error) {
    return (
      <div className="report-modal" onClick={handleOverlayClick}>
        <div className="report-content">
          <button className="report-close" onClick={onClose} title="Fermer">✕</button>
          <div className="report-error">
            <p>❌ {error}</p>
            <button className="btn-secondary" onClick={onClose}>Fermer</button>
          </div>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const { emotion, gesture, voice, global } = report;
  const emotionDist = formatDistribution(emotion?.distribution);
  const voiceDist = formatDistribution(voice?.distribution);

  return (
    <div className="report-modal" onClick={handleOverlayClick}>
      <div className="report-content">
        
        {/* ── En-tête avec croix de fermeture ───────────────────────────── */}
        <div className="report-header">
          {/* ✅ CROIX DE FERMETURE - Visible et accessible */}
          <button 
            className="report-close" 
            onClick={onClose} 
            title="Fermer le rapport (ou appuyez sur Échap)"
            aria-label="Fermer"
          >
            ✕
          </button>
          <h2>📋 Rapport d'Entretien</h2>
          <p className="candidate-name">{candidateName || 'Candidat'}</p>
          <p className="session-id">Session: {sessionId?.slice(0, 25)}...</p>
        </div>

        {/* ── Score Global ─────────────────────────────── */}
        <div className="report-section global-score">
          <h3>🎯 Score Global</h3>
          <div className="score-circle" style={{ borderColor: getScoreColor(global?.score || 0) }}>
            <span className="score-value">{global?.score || 0}</span>
            <span className="score-label">/ 100</span>
          </div>
          <p className="score-rating" style={{ color: getScoreColor(global?.score || 0) }}>
            {global?.rating || '—'}
          </p>
        </div>

        {/* ── 🤟 GESTES : Confiance + Stress UNIQUEMENT ── */}
        <div className="report-section">
          <h3>🤟 Posture & Engagement</h3>
          <div className="metrics-row">
            <div className="metric-card large">
              <span className="metric-label">Confiance</span>
              <span className="metric-value" style={{ color: getScoreColor(gesture?.avg_confidence || 0) }}>
                {gesture?.avg_confidence || 0}%
              </span>
              <div className="metric-bar">
                <div className="metric-bar-fill" style={{ width: `${gesture?.avg_confidence || 0}%` }} />
              </div>
            </div>
            <div className="metric-card large">
              <span className="metric-label">Stress</span>
              <span className="metric-value" style={{ color: getScoreColor(100 - (gesture?.avg_stress || 0)) }}>
                {gesture?.avg_stress || 0}%
              </span>
              <div className="metric-bar">
                <div className="metric-bar-fill stress" style={{ width: `${gesture?.avg_stress || 0}%` }} />
              </div>
            </div>
          </div>
          <p className="metric-sub">
            Engagement: <strong>{gesture?.engagement_label || '—'}</strong> ({gesture?.engagement_ratio ? Math.round(gesture.engagement_ratio * 100) : 0}%)
          </p>
        </div>

        {/* ── 🎭 ÉMOTIONS : Distribution des classes en % ── */}
        <div className="report-section">
          <h3>🎭 Émotions Faciales</h3>
          {emotionDist.length > 0 ? (
            <div className="distribution-bars">
              {emotionDist.map(({ label, percent }) => (
                <div key={label} className="distribution-row">
                  <span className="distribution-label">{getEmotionIcon(label)} {label}</span>
                  <div className="distribution-bar">
                    <div 
                      className="distribution-bar-fill"
                      style={{ 
                        width: `${percent}%`,
                        background: getEmotionColor(label)
                      }}
                    />
                  </div>
                  <span className="distribution-percent">{percent}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">Aucune donnée émotion disponible</p>
          )}
          <p className="metric-sub">
            Confiance moyenne: {(emotion?.avg_confidence * 100)?.toFixed(1) || 0}%
          </p>
        </div>

        {/* ── 🎤 VOIX : Distribution des tons en % ── */}
        <div className="report-section">
          <h3>🎤 Analyse Vocale</h3>
          {voiceDist.length > 0 ? (
            <div className="distribution-bars">
              {voiceDist.map(({ label, percent }) => (
                <div key={label} className="distribution-row">
                  <span className="distribution-label">{getVoiceIcon(label)} {label}</span>
                  <div className="distribution-bar">
                    <div 
                      className="distribution-bar-fill"
                      style={{ 
                        width: `${percent}%`,
                        background: getVoiceColor(label)
                      }}
                    />
                  </div>
                  <span className="distribution-percent">{percent}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">Aucune donnée vocale disponible</p>
          )}
          {voice?.avg_volume !== undefined && (
            <p className="metric-sub">
              Volume moyen: <strong>{voice.avg_volume}/100</strong> • 
              Confiance: <strong>{(voice.avg_confidence * 100)?.toFixed(1) || 0}%</strong>
            </p>
          )}
        </div>

        {/* ── 💡 Conseils AI ───────────────────────────── */}
        <div className="report-section conseils">
          <h3>💡 Conseils de l'IA</h3>
          <ul>
            {global?.conseils?.map((conseil, idx) => (
              <li key={idx}>✨ {conseil}</li>
            ))}
          </ul>
        </div>

        {/* ── Footer / Actions ──────────────────────── */}
        <div className="report-footer">
          <button className="btn-secondary" onClick={onClose}>Fermer</button>
          <button className="btn-primary" onClick={() => exportReport(report)}>
            📥 Exporter
          </button>
        </div>

      </div>
    </div>
  );
};

// 🎨 Helpers d'affichage
const getEmotionIcon = (emotion) => {
  const icons = {
    'Joie': '😊', 'Neutre': '😐', 'Colère': '😠',
    'Tristesse': '😢', 'Surprise': '😲', 'Dégoût': '🤢', 'Stress': '😰'
  };
  return icons[emotion] || '❓';
};

const getEmotionColor = (emotion) => {
  const colors = {
    'Joie': '#4CAF50', 'Neutre': '#9E9E9E', 'Colère': '#F44336',
    'Tristesse': '#2196F3', 'Surprise': '#FFC107', 'Dégoût': '#9C27B0', 'Stress': '#FF9800'
  };
  return colors[emotion] || '#9E9E9E';
};

const getVoiceIcon = (tone) => {
  const icons = {
    'neutre': '😐', 'joie': '😊', 'colère': '😠', 'tristesse': '😢', 'stress': '😰'
  };
  return icons[tone] || '❓';
};

const getVoiceColor = (tone) => {
  const colors = {
    'neutre': '#9E9E9E', 'joie': '#4CAF50', 'colère': '#F44336',
    'tristesse': '#2196F3', 'stress': '#FF9800'
  };
  return colors[tone] || '#9E9E9E';
};

// 📥 Export PDF (simple - texte)
const exportReport = (report) => {
  const text = `
RAPPORT D'ENTRETIEN - ${new Date().toLocaleDateString('fr-FR')}
================================================

Candidat: ${report.candidateName || '—'}
Session: ${report.session_id}
Durée: ${report.duration_minutes?.toFixed(1) || 0} min

🎯 SCORE GLOBAL: ${report.global?.score || 0}/100 - ${report.global?.rating || '—'}

🤟 POSTURE & ENGAGEMENT:
   • Confiance: ${report.gesture?.avg_confidence || 0}%
   • Stress: ${report.gesture?.avg_stress || 0}%
   • Engagement: ${report.gesture?.engagement_label || '—'}

🎭 ÉMOTIONS FACIALES:
${Object.entries(report.emotion?.distribution || {}).map(([e, c]) => `   • ${e}: ${c}`).join('\n')}

🎤 ANALYSE VOCALE:
${Object.entries(report.voice?.distribution || {}).map(([v, c]) => `   • ${v}: ${c}`).join('\n')}

💡 CONSEILS:
${report.global?.conseils?.map(c => `   • ${c}`).join('\n') || '   • Aucun conseil'}
  `;
  
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rapport-${report.session_id}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};

export default InterviewReport;