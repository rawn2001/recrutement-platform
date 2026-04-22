// src/components/VideoCall/GlobalVideoCall.jsx
// Fenêtre vidéo FLOTTANTE — s'affiche sur toutes les pages dès qu'un appel est actif
// Fonctionne côté recruteur ET candidat sans modification des pages individuelles

import { useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import VideoContainer from './VideoContainer';
import './GlobalVideoCall.css';

const GlobalVideoCall = () => {
  const { localStream, peer, isCallEnded, ongoingCall, handleHangup } = useSocket();
  const [isMicOn,  setIsMicOn]  = useState(true);
  const [isVidOn,  setIsVidOn]  = useState(true);
  const [minimized, setMinimized] = useState(false);

  // Rien à afficher si pas d'appel actif
  if (!localStream && !peer) return null;

  if (isCallEnded) {
    return (
      <div className="gvc-ended">
        <span>📵</span> Appel terminé
      </div>
    );
  }

  const isOnCall = !!(localStream && peer && ongoingCall);

  const toggleMic = () => {
    if (localStream) {
      const track = localStream.getAudioTracks()[0];
      if (track) { track.enabled = !track.enabled; setIsMicOn(track.enabled); }
    }
  };

  const toggleCam = () => {
    if (localStream) {
      const track = localStream.getVideoTracks()[0];
      if (track) { track.enabled = !track.enabled; setIsVidOn(track.enabled); }
    }
  };

  const endCall = () => handleHangup({ ongoingCall: ongoingCall || undefined });

  return (
    <div className={`gvc-window ${minimized ? 'gvc-minimized' : ''}`}>
      {/* ── Barre de titre ── */}
      <div className="gvc-titlebar">
        <span className="gvc-title">
          <span className="gvc-live-dot" /> Entretien en cours
        </span>
        <button
          className="gvc-minimize-btn"
          onClick={() => setMinimized((v) => !v)}
          title={minimized ? 'Agrandir' : 'Réduire'}
        >
          {minimized ? '▲' : '▼'}
        </button>
      </div>

      {/* ── Vidéos ── */}
      {!minimized && (
        <>
          <div className="gvc-streams">
            {/* Vidéo distante (plein écran dans la fenêtre) */}
            {peer?.stream && (
              <VideoContainer
                stream={peer.stream}
                isLocalStream={false}
                isOnCall={isOnCall}
                className="gvc-remote"
              />
            )}

            {/* Vidéo locale (petite vignette en bas à droite) */}
            {localStream && (
              <div className="gvc-local-wrap">
                <VideoContainer
                  stream={localStream}
                  isLocalStream={true}
                  isOnCall={isOnCall}
                  className="gvc-local"
                />
              </div>
            )}

            {/* En attente de connexion de l'autre côté */}
            {!peer?.stream && (
              <div className="gvc-waiting">
                <div className="gvc-pulse" />
                <span>En attente de connexion…</span>
              </div>
            )}
          </div>

          {/* ── Contrôles ── */}
          <div className="gvc-controls">
            <button
              className={`gvc-btn ${!isMicOn ? 'gvc-btn-off' : ''}`}
              onClick={toggleMic}
              title={isMicOn ? 'Couper le micro' : 'Activer le micro'}
            >
              {isMicOn ? '🎙️' : '🔇'}
            </button>

            <button
              className="gvc-btn gvc-btn-end"
              onClick={endCall}
              title="Terminer l'appel"
            >
              📵 Terminer
            </button>

            <button
              className={`gvc-btn ${!isVidOn ? 'gvc-btn-off' : ''}`}
              onClick={toggleCam}
              title={isVidOn ? 'Éteindre la caméra' : 'Allumer la caméra'}
            >
              {isVidOn ? '📹' : '🚫'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default GlobalVideoCall;
