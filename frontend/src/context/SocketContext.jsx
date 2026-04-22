// src/context/SocketContext.jsx  — v3 corrigé
// Fix: logique initiator/receiver WebRTC + process polyfill + refs anti-stale

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

// Polyfill process.nextTick AVANT que simple-peer soit importé
if (typeof window !== 'undefined' && !window.process) {
  window.process = { nextTick: (fn, ...args) => setTimeout(() => fn(...args), 0) };
}

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3333';

export const SocketContext = createContext(null);

export const SocketContextProvider = ({ children }) => {

  // Chargement dynamique de simple-peer (après polyfill)
  const PeerClass = useRef(null);
  useEffect(() => {
    import('simple-peer').then((mod) => {
      PeerClass.current = mod.default || mod;
    });
  }, []);

  const [currentUser, setCurrentUser] = useState(() => {
    try { const u = localStorage.getItem('user'); return u ? JSON.parse(u) : null; }
    catch { return null; }
  });

  const [socket,       setSocket]       = useState(null);
  const [isConnected,  setIsConnected]  = useState(false);
  const [onlineUsers,  setOnlineUsers]  = useState([]);
  const [ongoingCall,  setOngoingCall]  = useState(null);
  const [localStream,  setLocalStream]  = useState(null);
  const [peer,         setPeer]         = useState(null);
  const [isCallEnded,  setIsCallEnded]  = useState(false);

  // Refs — toujours à jour, utilisées dans les callbacks socket
  const socketRef       = useRef(null);
  const currentUserRef  = useRef(null);
  const localStreamRef  = useRef(null);
  const peerRef         = useRef(null);
  const ongoingCallRef  = useRef(null);

  useEffect(() => { socketRef.current      = socket;      }, [socket]);
  useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);
  useEffect(() => { localStreamRef.current = localStream; }, [localStream]);
  useEffect(() => { peerRef.current        = peer;        }, [peer]);
  useEffect(() => { ongoingCallRef.current = ongoingCall; }, [ongoingCall]);

  // Sync localStorage → state
  useEffect(() => {
    const h = () => {
      try { const u = localStorage.getItem('user'); setCurrentUser(u ? JSON.parse(u) : null); }
      catch { setCurrentUser(null); }
    };
    window.addEventListener('storage', h);
    return () => window.removeEventListener('storage', h);
  }, []);

  const currentSocketUser = onlineUsers.find(
    (u) => u.userId === (currentUser?.id || currentUser?.userId)
  );

  // ─── Média ──────────────────────────────────────────────────────────────
  const getMediaStream = useCallback(async () => {
    if (localStreamRef.current) return localStreamRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      setLocalStream(stream);
      localStreamRef.current = stream;
      return stream;
    } catch (err) {
      console.error('getUserMedia:', err);
      alert('Impossible d\'accéder à la caméra/micro. Vérifiez les permissions.');
      return null;
    }
  }, []);

  // ─── Raccrocher ─────────────────────────────────────────────────────────
  const handleHangup = useCallback((data = {}) => {
    const sock = socketRef.current;
    const user = currentUserRef.current;
    const call = data.ongoingCall || ongoingCallRef.current;

    if (sock && user && call && !data.callEnded) {
      sock.emit('hangup', {
        ongoingCall: call,
        userHangingupId: user.id || user.userId,
      });
    }

    const p = peerRef.current;
    if (p?.peerConnection && !p.peerConnection.destroyed) {
      try { p.peerConnection.destroy(); } catch (_) {}
    }

    const s = localStreamRef.current;
    if (s) { s.getTracks().forEach((t) => t.stop()); }

    setLocalStream(null);
    setOngoingCall(null);
    setPeer(null);
    localStreamRef.current = null;
    peerRef.current = null;
    ongoingCallRef.current = null;
    setIsCallEnded(true);
  }, []);

  // ─── Créer un peer ──────────────────────────────────────────────────────
  // initiator=true  → celui qui ENVOIE l'offre (le candidat qui accepte)
  // initiator=false → celui qui REÇOIT l'offre et répond (le recruteur)
  const makePeer = useCallback((stream, initiator) => {
    const PC = PeerClass.current;
    if (!PC) { console.error('Peer class not loaded'); return null; }

    const p = new PC({
      stream,
      initiator,
      trickle: true,
      config: {
        iceServers: [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }],
      },
    });

    p.on('stream', (remote) => {
      setPeer((prev) => prev ? { ...prev, stream: remote } : prev);
    });
    p.on('error', (e) => console.error('Peer error:', e.message));
    p.on('close', () => handleHangup({ callEnded: true }));
    return p;
  }, [handleHangup]);

  // ─────────────────────────────────────────────────────────────────────────
  //  FLUX SIGNALISATION (important — c'est ici que tout se joue)
  //
  //  Scénario :
  //  1. Recruteur clique "Appeler"  → émet socket `call`
  //  2. Candidat reçoit `incomingCall`, accepte → handleJoinCall()
  //     → candidat crée peer initiator=TRUE → génère offre SDP
  //     → émet webrtcSignal { isCaller: false }
  //  3. Recruteur reçoit webrtcSignal (isCaller:false)
  //     → completePeerConnection : crée peer initiator=FALSE → génère réponse SDP
  //     → émet webrtcSignal { isCaller: true }
  //  4. Candidat reçoit webrtcSignal (isCaller:true)
  //     → completePeerConnection : peer existe déjà → .signal(sdp)
  //  5. WebRTC P2P établi ✅
  // ─────────────────────────────────────────────────────────────────────────

  // Appelé quand on reçoit un signal webrtcSignal du serveur
  const completePeerConnection = useCallback((connectionData) => {
    const stream = localStreamRef.current;
    const existing = peerRef.current;

    // Cas A : notre peer existe déjà → on lui passe juste le signal (ICE ou réponse)
    if (existing?.peerConnection && !existing.peerConnection.destroyed) {
      try {
        existing.peerConnection.signal(connectionData.sdp);
      } catch (err) {
        console.warn('signal() ignoré (peer détruit):', err.message);
      }
      return;
    }

    // Cas B : on n'a pas encore de peer → on est le RECRUTEUR qui reçoit l'offre du candidat
    // On crée un peer NON-initiateur pour répondre
    if (!stream) {
      console.warn('completePeerConnection: pas de stream local');
      return;
    }

    const p = makePeer(stream, false); // false = répondeur
    if (!p) return;

    const sock = socketRef.current;
    p.on('signal', (sdpData) => {
      if (sock) {
        sock.emit('webrtcSignal', {
          sdp: sdpData,
          ongoingCall: connectionData.ongoingCall,
          isCaller: true, // on répond au caller (candidat), donc isCaller=true pour la cible
        });
      }
    });

    // Déterminer qui est l'autre participant
    const participantUser = connectionData.isCaller
      ? connectionData.ongoingCall.participants.receiver
      : connectionData.ongoingCall.participants.caller;

    const newPeerData = { peerConnection: p, participantUser, stream: undefined };
    setPeer(newPeerData);
    peerRef.current = newPeerData;

    // Appliquer l'offre reçue
    try { p.signal(connectionData.sdp); }
    catch (err) { console.warn('signal initial:', err.message); }

  }, [makePeer]);

  // ─── Candidat accepte l'appel ────────────────────────────────────────────
  const handleJoinCall = useCallback(async (call) => {
    setIsCallEnded(false);
    setOngoingCall((prev) => prev ? { ...prev, isRinging: false } : prev);

    const stream = await getMediaStream();
    if (!stream) return;

    // Candidat = INITIATEUR (envoie l'offre au recruteur)
    const p = makePeer(stream, true);
    if (!p) return;

    const sock = socketRef.current;
    p.on('signal', (sdpData) => {
      if (sock) {
        sock.emit('webrtcSignal', {
          sdp: sdpData,
          ongoingCall: call,
          isCaller: false, // ce signal est destiné au recruteur (caller)
        });
      }
    });

    const newPeerData = {
      peerConnection: p,
      participantUser: call.participants.caller,
      stream: undefined,
    };
    setPeer(newPeerData);
    peerRef.current = newPeerData;
  }, [getMediaStream, makePeer]);

  // ─── Recruteur lance l'appel ─────────────────────────────────────────────
  const handleCall = useCallback(async (targetUser) => {
    if (!PeerClass.current) { alert('Chargement en cours, réessayez.'); return; }
    setIsCallEnded(false);
    if (!currentSocketUser) return;
    if (ongoingCallRef.current) { alert('Déjà en communication.'); return; }

    const stream = await getMediaStream();
    if (!stream) return;

    const participants = { caller: currentSocketUser, receiver: targetUser };
    setOngoingCall({ participants, isRinging: false });
    ongoingCallRef.current = { participants, isRinging: false };
    socketRef.current?.emit('call', participants);

    // Le recruteur attend que le candidat envoie l'offre via webrtcSignal
    // Il ne crée PAS de peer ici — il le crée dans completePeerConnection
  }, [currentSocketUser, getMediaStream]);

  // ─── Appel entrant (candidat reçoit la sonnerie) ─────────────────────────
  const onIncomingCall = useCallback((participants) => {
    if (ongoingCallRef.current) {
      // Déjà en appel → refus automatique
      socketRef.current?.emit('hangup', {
        ongoingCall: { participants, isRinging: false },
        userHangingupId: currentUserRef.current?.id || currentUserRef.current?.userId,
      });
      return;
    }
    setOngoingCall({ participants, isRinging: true });
  }, []);

  // ─── Init socket ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    const s = io(SOCKET_URL, { transports: ['websocket'] });
    setSocket(s);
    socketRef.current = s;
    return () => s.disconnect();
  }, [currentUser]);

  useEffect(() => {
    if (!socket) return;
    const onC = () => setIsConnected(true);
    const onD = () => setIsConnected(false);
    if (socket.connected) onC();
    socket.on('connect', onC);
    socket.on('disconnect', onD);
    return () => { socket.off('connect', onC); socket.off('disconnect', onD); };
  }, [socket]);

  // ─── Enregistrer l'utilisateur en ligne ──────────────────────────────────
  useEffect(() => {
    if (!socket || !isConnected || !currentUser) return;
    const profile = {
      id:       currentUser.id || currentUser.userId,
      userId:   currentUser.id || currentUser.userId,
      fullName: `${currentUser.prenom || currentUser.firstName || ''} ${currentUser.nom || currentUser.lastName || ''}`.trim(),
      imageUrl: currentUser.photo || currentUser.imageUrl || null,
    };
    socket.emit('addNewUser', { id: profile.id, profile });
    socket.on('getUsers', (res) => setOnlineUsers(res));
    return () => socket.off('getUsers');
  }, [socket, isConnected, currentUser]);

  // ─── Écouter les événements d'appel ──────────────────────────────────────
  useEffect(() => {
    if (!socket || !isConnected) return;
    socket.on('incomingCall',  onIncomingCall);
    socket.on('webrtcSignal',  completePeerConnection);
    socket.on('hangup',        () => handleHangup({ callEnded: true }));
    return () => {
      socket.off('incomingCall',  onIncomingCall);
      socket.off('webrtcSignal',  completePeerConnection);
      socket.off('hangup');
    };
  }, [socket, isConnected, onIncomingCall, completePeerConnection, handleHangup]);

  useEffect(() => {
    if (!isCallEnded) return;
    const t = setTimeout(() => setIsCallEnded(false), 2000);
    return () => clearTimeout(t);
  }, [isCallEnded]);

  return (
    <SocketContext.Provider value={{
      socket, onlineUsers, ongoingCall, localStream,
      peer, isCallEnded, currentUser,
      handleCall, handleJoinCall, handleHangup,
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket doit être utilisé dans SocketContextProvider');
  return ctx;
};
