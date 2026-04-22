// src/components/VideoCall/VideoCallPanel.jsx
// Panneau qui affiche les candidats en ligne et le flux vidéo actif
// À placer dans n'importe quelle page après authentification

import { useSocket } from '../../context/SocketContext';
import VideoCall from './VideoCall';
import './VideoCall.css';

const VideoCallPanel = () => {
  const { onlineUsers, handleCall, currentUser } = useSocket();

  // Ne pas s'afficher si on n'est pas connecté
  if (!currentUser) return null;

  const currentId = currentUser.id || currentUser.userId;

  // Filtre les autres utilisateurs en ligne
  const others = onlineUsers.filter((u) => u.userId !== currentId);

  return (
    <div>
      {others.length > 0 && (
        <div className="vc-online-panel">
          <div className="vc-online-title">🟢 Utilisateurs disponibles</div>
          <div className="vc-online-list">
            {others.map((u) => {
              const name = u.profile?.fullName || u.fullName || 'Utilisateur';
              const initial = name[0]?.toUpperCase() || 'U';
              const avatar = u.profile?.imageUrl || u.imageUrl;

              return (
                <div
                  key={u.userId}
                  className="vc-online-user"
                  onClick={() => handleCall(u)}
                  title={`Appeler ${name}`}
                >
                  <div className="vc-online-avatar">
                    {avatar ? (
                      <img src={avatar} alt={name} />
                    ) : (
                      initial
                    )}
                    <div className="vc-online-dot" />
                  </div>
                  <div className="vc-online-name">{name.split(' ')[0]}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Zone de l'appel vidéo actif */}
      <VideoCall />
    </div>
  );
};

export default VideoCallPanel;
