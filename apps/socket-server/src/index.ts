import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { registerRoomHandlers, handleDisconnect } from './handlers/roomHandler';
import { registerGameHandlers } from './handlers/gameHandler';
import { registerRankingHandlers } from './handlers/rankingHandler';

dotenv.config();

const app = express();
// Allow any origin — LAN / cloud deployment
app.use(cors({ origin: true }));

// Health check for Render / load balancers
app.get('/health', (_req, res) => res.json({ ok: true }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
  },
  // Default pingTimeout (20s) is too aggressive for mobile / cloud proxy.
  // 60s gives enough headroom for brief network blips without holding dead
  // connections too long.
  pingTimeout: 60_000,
  pingInterval: 25_000,
  connectTimeout: 45_000,
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  registerRoomHandlers(io, socket);
  registerGameHandlers(io, socket);
  registerRankingHandlers(io, socket);

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    handleDisconnect(io, socket);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});

export { io };
