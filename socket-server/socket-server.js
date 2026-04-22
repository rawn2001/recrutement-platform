// server/socket-server.js  — v2
// Serveur Socket.io pour la signalisation WebRTC
// node socket-server.js  (port 3333 par défaut)

import { createServer } from 'http';
import { Server } from 'socket.io';

const PORT          = process.env.SOCKET_PORT  || 3333;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3001';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: CLIENT_ORIGIN, methods: ['GET', 'POST'], credentials: true },
});

// Map  userId → { socketId, userId, profile }
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log(`[+] connected  ${socket.id}`);

  // ── Enregistrer un utilisateur ──────────────────────────────────────────
  socket.on('addNewUser', (user) => {
    const userId = user?.id || user?.userId;
    if (!userId) return;
    onlineUsers.set(userId, { socketId: socket.id, userId, profile: user.profile || user });
    io.emit('getUsers', [...onlineUsers.values()]);
    console.log(`[u] online: ${userId}  total: ${onlineUsers.size}`);
  });

  // ── Appel sortant ───────────────────────────────────────────────────────
  // participants = { caller: SocketUser, receiver: SocketUser }
  socket.on('call', (participants) => {
    const receiver = onlineUsers.get(participants.receiver.userId);
    if (!receiver) { console.log('[!] receiver offline'); return; }
    io.to(receiver.socketId).emit('incomingCall', participants);
    console.log(`[c] call  ${participants.caller.userId} → ${participants.receiver.userId}`);
  });

  // ── Signal WebRTC (offre / réponse / ICE) ───────────────────────────────
  //
  // Règle de routage :
  //   isCaller = false  → ce signal va AU caller   (recruteur)
  //   isCaller = true   → ce signal va AU receiver (candidat)
  //
  socket.on('webrtcSignal', (data) => {
    const { ongoingCall, isCaller } = data;
    if (!ongoingCall?.participants) return;

    const { caller, receiver } = ongoingCall.participants;

    // isCaller:false = le candidat a envoyé l'offre → on la route vers le recruteur (caller)
    // isCaller:true  = le recruteur a répondu       → on route vers le candidat (receiver)
    const targetId   = isCaller ? receiver.userId : caller.userId;
    const targetUser = onlineUsers.get(targetId);

    if (!targetUser) {
      console.log(`[!] webrtcSignal: target ${targetId} not found`);
      return;
    }

    io.to(targetUser.socketId).emit('webrtcSignal', data);
    console.log(`[s] signal  isCaller=${isCaller}  → ${targetId}`);
  });

  // ── Raccrocher ──────────────────────────────────────────────────────────
  socket.on('hangup', (data) => {
    const { ongoingCall, userHangingupId } = data || {};
    if (!ongoingCall?.participants) return;

    const { caller, receiver } = ongoingCall.participants;
    const otherId = caller.userId === userHangingupId ? receiver.userId : caller.userId;
    const other   = onlineUsers.get(otherId);
    if (other) io.to(other.socketId).emit('hangup');
    console.log(`[h] hangup  by ${userHangingupId}`);
  });

  // ── Déconnexion ─────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    for (const [uid, data] of onlineUsers) {
      if (data.socketId === socket.id) {
        onlineUsers.delete(uid);
        console.log(`[-] offline: ${uid}  total: ${onlineUsers.size}`);
        break;
      }
    }
    io.emit('getUsers', [...onlineUsers.values()]);
  });
});

httpServer.listen(PORT, () =>
  console.log(`✅  Socket server  →  http://localhost:${PORT}`)
);
