// src/components/VideoCall/VideoCallButton.jsx
// Bouton "Lancer l'entretien vidéo" à placer dans ManageJobs.jsx
// Usage : <VideoCallButton candidate={app.candidate} />
//   - candidate doit avoir : id (ou userId), prenom, nom, email, photo (optionnel)

import { useSocket } from '../../context/SocketContext';
import './VideoCall.css';

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
    handleCall(targetUser);
  };

  return (
    <button
      className="vc-start-btn"
      onClick={handleClick}
      title={isOnline ? 'Lancer l\'entretien vidéo' : 'Candidat hors ligne'}
      style={{ opacity: isOnline ? 1 : 0.5 }}
    >
      🎥 {isOnline ? 'Entretien vidéo' : 'Hors ligne'}
    </button>
  );
};

export default VideoCallButton;
