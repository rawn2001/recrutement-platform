// src/components/VideoCall/VideoCall.jsx
import { useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import VideoContainer from './VideoContainer';
import './VideoCall.css';

const VideoCall = () => {
  const { localStream, peer, isCallEnded, ongoingCall, handleHangup } = useSocket();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVidOn, setIsVidOn] = useState(true);

  if (isCallEnded) {
    return (
      <div className="vc-ended">
        <span>📵</span> Appel terminé
      </div>
    );
  }

  if (!localStream && !peer) return null;

  const toggleCamera = () => {
    if (localStream) {
      const track = localStream.getVideoTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setIsVidOn(track.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const track = localStream.getAudioTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setIsMicOn(track.enabled);
      }
    }
  };

  const isOnCall = !!(localStream && peer && ongoingCall);

  return (
    <div className="vc-wrapper">
      <div className="vc-streams">
        {localStream && (
          <VideoContainer stream={localStream} isLocalStream={true} isOnCall={isOnCall} />
        )}
        {peer?.stream && (
          <VideoContainer stream={peer.stream} isLocalStream={false} isOnCall={isOnCall} />
        )}
      </div>

      <div className="vc-controls">
        <button
          className={`vc-ctrl-btn ${isMicOn ? '' : 'vc-ctrl-off'}`}
          onClick={toggleAudio}
          title={isMicOn ? 'Couper le micro' : 'Activer le micro'}
        >
          {isMicOn ? '🎙️' : '🔇'}
        </button>

        <button
          className="vc-ctrl-btn vc-ctrl-hangup"
          onClick={() => handleHangup({ ongoingCall: ongoingCall || undefined })}
          title="Terminer l'appel"
        >
          📵 Terminer
        </button>

        <button
          className={`vc-ctrl-btn ${isVidOn ? '' : 'vc-ctrl-off'}`}
          onClick={toggleCamera}
          title={isVidOn ? 'Éteindre la caméra' : 'Allumer la caméra'}
        >
          {isVidOn ? '📹' : '🚫'}
        </button>
      </div>
    </div>
  );
};

export default VideoCall;
