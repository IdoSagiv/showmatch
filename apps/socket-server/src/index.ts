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
// Allow any origin — this app runs on a private LAN / Tailscale VPN
app.use(cors({ origin: true }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
  },
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
