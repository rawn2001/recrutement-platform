// src/components/VideoCall/GlobalVideoCall.jsx
import { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import VideoContainer from './VideoContainer';
import InterviewAIAnalyzer from './InterviewAIAnalyzer';
import './GlobalVideoCall.css';

const FLASK_API = process.env.REACT_APP_FLASK_API || 'http://127.0.0.1:5003';
const NESTJS_API = process.env.REACT_APP_NESTJS_API || 'http://localhost:3000';

const GlobalVideoCall = () => {
  const { localStream, peer, isCallEnded, ongoingCall, handleHangup } = useSocket();
  const { user } = useAuth();
  
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVidOn, setIsVidOn] = useState(true);
  const [minimized, setMinimized] = useState(false);
  const [isCandidate, setIsCandidate] = useState(false);
  const [reportSent, setReportSent] = useState(false); // ✅ Nouveau state

  // ✅ Calculer si c'est le candidat
  useEffect(() => {
    const candidate = user?.role === 'candidat' || 
                     ongoingCall?.participants?.candidate?.id === user?.id;
    setIsCandidate(candidate);
  }, [user, ongoingCall]);

  // ✅ Fonction endCall DÉFINIE AVANT le return
  // ✅ CORRECTION : Capturer sessionId AVANT handleHangup
const endCall = async () => {
  // 1️⃣ Capturer les données CRITIALES avant que l'appel ne soit coupé
  const currentSessionId = ongoingCall?.sessionId;
  const isCandidateFlag = isCandidate;
  
  console.log('🔴 endCall() déclenché | sessionId capturé:', currentSessionId);
  
  // 2️⃣ Couper l'appel WebRTC
  handleHangup({ ongoingCall: ongoingCall || undefined });
  
  // 3️⃣ Générer le rapport UNIQUEMENT si c'est un candidat et qu'on a un sessionId
  if (isCandidateFlag && currentSessionId && !reportSent) {
    try {
      console.log('🔄 Génération rapport pour:', currentSessionId);
      
      // Appel Flask
      const response = await fetch(`${FLASK_API}/api/session/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: currentSessionId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Rapport généré avec succès | Score:', data.report?.global?.score);
        setReportSent(true);
        
        // Sauvegarde NestJS
        try {
          await fetch(`${NESTJS_API}/api/interview/report/save`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              sessionId: currentSessionId,
              candidateId: user?.id,
              report: data.report
            })
          });
          console.log('💾 Rapport sauvegardé dans NestJS');
        } catch (nestErr) {
          console.warn('⚠️ Sauvegarde NestJS échouée:', nestErr);
        }
      }
    } catch (err) {
      console.error('❌ Erreur génération rapport:', err);
    }
  }
};

  // Rien à afficher si pas d'appel actif
  if (!localStream && !peer) return null;

  if (isCallEnded) {
    return (
      <div className="gvc-ended">
        <span>📵</span> Appel terminé
        {isCandidate && reportSent && <span style={{marginLeft: 8, color: '#4CAF50'}}>✅ Rapport envoyé</span>}
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

  return (
    <div className={`gvc-window ${minimized ? 'gvc-minimized' : ''}`}>
      {/* ── Barre de titre ── */}
      <div className="gvc-titlebar">
        <span className="gvc-title">
          <span className="gvc-live-dot" /> Entretien en cours
          {isCandidate && <span className="gvc-role-badge">👤 Candidat</span>}
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
            {peer?.stream && (
              <VideoContainer stream={peer.stream} isLocalStream={false} isOnCall={isOnCall} className="gvc-remote" />
            )}
            {localStream && (
              <div className="gvc-local-wrap">
                <VideoContainer stream={localStream} isLocalStream={true} isOnCall={isOnCall} className="gvc-local" />
              </div>
            )}
            {!peer?.stream && (
              <div className="gvc-waiting">
                <div className="gvc-pulse" />
                <span>En attente de connexion…</span>
              </div>
            )}
          </div>

         {/* ✅ AJOUTER key={ongoingCall?.sessionId} pour forcer le démontage/remontage */}
{isCandidate && ongoingCall?.sessionId && (
  <InterviewAIAnalyzer
    key={ongoingCall.sessionId}  // 👈 CRUCIAL : React détruit et recrée le composant
    localStream={localStream}
    isCandidate={true}
    sessionId={ongoingCall.sessionId}
  />
)}

          {/* Contrôles */}
          <div className="gvc-controls">
            <button className={`gvc-btn ${!isMicOn ? 'gvc-btn-off' : ''}`} onClick={toggleMic} title={isMicOn ? 'Couper le micro' : 'Activer le micro'}>
              {isMicOn ? '🎙️' : '🔇'}
            </button>
            <button className="gvc-btn gvc-btn-end" onClick={endCall} title="Terminer l'appel">
              📵 Terminer
            </button>
            <button className={`gvc-btn ${!isVidOn ? 'gvc-btn-off' : ''}`} onClick={toggleCam} title={isVidOn ? 'Éteindre la caméra' : 'Allumer la caméra'}>
              {isVidOn ? '📹' : '🚫'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default GlobalVideoCall;