// src/components/VideoCall/VideoCallButton.jsx
// Bouton "Lancer l'entretien vidéo" à placer dans ManageJobs.jsx
// Usage : <VideoCallButton candidate={app.candidate} />
//   - candidate doit avoir : id (ou userId), prenom, nom, email, photo (optionnel)

import { useSocket } from '../../context/SocketContext';
import './VideoCall.css';

// ✅ Fonction utilitaire : génère un sessionId UNIQUE à chaque entretien
const generateSessionId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  return `session_${timestamp}_${random}`;
};

const VideoCallButton = ({ candidate }) => {
  const { onlineUsers, handleCall, ongoingCall } = useSocket();

  if (!candidate) return null;

  // Cherche le candidat dans la liste des utilisateurs connectés
  const targetUser = onlineUsers.find(
    (u) =>
      u.userId === (candidate.id || candidate.userId) ||
      u.profile?.email === candidate.email
  );

  const isOnline = !!targetUser;
  const isAlreadyCalling = !!ongoingCall;

  const handleClick = () => {
    if (!isOnline) {
      alert(`${candidate.prenom || 'Le candidat'} n'est pas connecté en ce moment.`);
      return;
    }
    if (isAlreadyCalling) {
      alert('Vous êtes déjà en communication.');
      return;
    }
    
    // ✅ Générer un NOUVEAU sessionId pour CET entretien
    const newSessionId = generateSessionId();
    console.log('🆕 Nouvel entretien démarré | sessionId:', newSessionId);
    
    // ✅ Passer le sessionId au contexte Socket via options
    handleCall(targetUser, { sessionId: newSessionId });
  };

  return (
    <button
      className="vc-start-btn"
      onClick={handleClick}
      title={isOnline ? 'Lancer l\'entretien vidéo' : 'Candidat hors ligne'}
      style={{ 
        opacity: isOnline ? 1 : 0.5,
        padding: '6px 14px',
        borderRadius: 8,
        fontSize: 11.5,
        fontWeight: 500,
        background: isOnline ? 'var(--purple)' : 'var(--bg-2)',
        color: isOnline ? '#fff' : 'var(--tx-muted)',
        border: 'none',
        cursor: isOnline ? 'pointer' : 'not-allowed',
        transition: 'all 0.15s ease',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}
      onMouseEnter={(e) => {
        if (isOnline) {
          e.currentTarget.style.background = 'var(--purple-dark)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={(e) => {
        if (isOnline) {
          e.currentTarget.style.background = 'var(--purple)';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      🎥 {isOnline ? 'Entretien' : 'Hors ligne'}
    </button>
  );
};

export default VideoCallButton;