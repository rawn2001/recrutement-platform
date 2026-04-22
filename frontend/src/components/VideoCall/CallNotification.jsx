// src/components/VideoCall/CallNotification.jsx
// Notification d'appel entrant — s'affiche en overlay sur toute l'application
import { useSocket } from '../../context/SocketContext';
import './VideoCall.css';

const CallNotification = () => {
  const { ongoingCall, handleJoinCall, handleHangup } = useSocket();

  if (!ongoingCall?.isRinging) return null;

  const caller = ongoingCall.participants.caller;
  const name = caller?.profile?.fullName || caller?.fullName || 'Recruteur';
  const initial = name[0]?.toUpperCase() || 'R';
  const avatar = caller?.profile?.imageUrl || caller?.imageUrl;

  return (
    <div className="vc-notification-overlay">
      <div className="vc-notification-card">
        <div className="vc-notification-avatar">
          {avatar ? (
            <img src={avatar} alt={name} />
          ) : (
            initial
          )}
        </div>
        <div className="vc-notification-name">{name.split(' ')[0]}</div>
        <div className="vc-notification-label">Appel vidéo entrant…</div>
        <div className="vc-notification-actions">
          <button
            className="vc-btn-accept"
            onClick={() => handleJoinCall(ongoingCall)}
            title="Accepter"
          >
            📞
          </button>
          <button
            className="vc-btn-reject"
            onClick={() => handleHangup({ ongoingCall })}
            title="Refuser"
          >
            📵
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallNotification;
