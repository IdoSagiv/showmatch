import { Server, Socket } from 'socket.io';
import { roomManager } from '../state/RoomManager';
import { GameSession } from '../state/GameSession';

export function registerRankingHandlers(io: Server, socket: Socket) {
  socket.on('submitRanking', (rankings: Array<{ tmdbId: number; rank: number }>) => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (!room || room.status !== 'ranking') return;

    GameSession.recordRanking(room, socket.id, rankings);

    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      io.to(room.code).emit('rankingSubmitted', socket.id);
    }

    if (GameSession.checkAllRankingsSubmitted(room)) {
      room.status = 'finished';
      const { winner, fullRankings } = GameSession.computeWinner(room);
      const stats = GameSession.computeStats(room);
      const reveal = GameSession.computeSwipeReveal(room);

      io.to(room.code).emit('rankingsReady', winner, fullRankings);
      io.to(room.code).emit('swipeReveal', reveal);
      io.to(room.code).emit('gameStats', stats);
    }
  });
}
