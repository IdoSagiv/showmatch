import { Server, Socket } from 'socket.io';
import { roomManager } from '../state/RoomManager';
import { GameSession } from '../state/GameSession';
import { fetchDiscoverResults, fetchTitleCount } from '../lib/tmdb';

export function registerGameHandlers(io: Server, socket: Socket) {
  socket.on('updateSettings', (settings) => {
    if (!roomManager.isCreator(socket.id)) return;
    const room = roomManager.getRoomBySocket(socket.id);
    if (!room || room.status !== 'lobby') return;

    roomManager.updateSettings(room.code, settings);
    socket.to(room.code).emit('settingsUpdated', settings);
  });

  socket.on('requestTitleCount', async (settings) => {
    try {
      const count = await fetchTitleCount(settings);
      socket.emit('titleCountPreview', count);
    } catch (err) {
      console.error('Error fetching title count:', err);
      socket.emit('titleCountPreview', 0);
    }
  });

  socket.on('startGame', async () => {
    console.log(`[startGame] socket=${socket.id} isCreator=${roomManager.isCreator(socket.id)}`);
    if (!roomManager.isCreator(socket.id)) {
      socket.emit('error', 'Only the room creator can start the game');
      return;
    }
    const room = roomManager.getRoomBySocket(socket.id);
    if (!room || room.status !== 'lobby') {
      socket.emit('error', `Cannot start: room status is ${room?.status ?? 'not found'}`);
      return;
    }

    const connectedPlayers = room.players.filter(p => p.connected);
    if (connectedPlayers.length < 2) {
      socket.emit('error', 'Need at least 2 players to start');
      return;
    }

    try {
      io.to(room.code).emit('loadingProgress', { stage: 'fetching', progress: 0 });

      const titlePool = await fetchDiscoverResults(room.settings, (done, total) => {
        io.to(room.code).emit('loadingProgress', { stage: 'enriching', progress: done, total });
      });
      if (titlePool.length === 0) {
        socket.emit('error', 'No titles found matching your filters. Try broadening your search.');
        return;
      }

      GameSession.startGame(room, titlePool);
      io.to(room.code).emit('gameStarted', room.titlePool);
      console.log(`Game started in room ${room.code} with ${room.titlePool.length} titles`);
    } catch (err) {
      console.error('Error starting game:', err);
      socket.emit('error', 'Failed to load titles. Please try again.');
    }
  });

  socket.on('submitSwipe', (tmdbId: number, decision: 'like' | 'pass' | 'superlike') => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (!room || room.status !== 'swiping') return;

    // Enforce once-per-game superlike
    if (decision === 'superlike') {
      const player = room.players.find(p => p.id === socket.id);
      if (player?.superLikeUsed) return;
    }

    GameSession.recordSwipe(room, socket.id, tmdbId, decision);

    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      io.to(room.code).emit('playerProgress', socket.id, player.progress);
    }

    // First match mode
    if (room.settings.firstMatchMode && (decision === 'like' || decision === 'superlike')) {
      const match = GameSession.checkFirstMatch(room, tmdbId);
      if (match) {
        room.status = 'finished';
        room.matchedTitles = [match];
        room.winner = match;
        const stats = GameSession.computeStats(room);
        const reveal = GameSession.computeSwipeReveal(room);
        io.to(room.code).emit('firstMatch', match);
        io.to(room.code).emit('swipeReveal', reveal);
        io.to(room.code).emit('gameStats', stats);
        return;
      }
    }

    // Check if all done
    if (GameSession.checkAllFinished(room)) {
      const matches = GameSession.computeMatches(room);
      room.matchedTitles = matches;

      if (matches.length === 0) {
        const wildcards = GameSession.computeWildcardCandidates(room);
        const stats = GameSession.computeStats(room);
        const reveal = GameSession.computeSwipeReveal(room);
        room.status = 'finished';
        io.to(room.code).emit('allPlayersFinished', []);
        io.to(room.code).emit('wildcardCandidates', wildcards);
        io.to(room.code).emit('swipeReveal', reveal);
        io.to(room.code).emit('gameStats', stats);
      } else if (matches.length === 1) {
        room.status = 'finished';
        room.winner = matches[0];
        const stats = GameSession.computeStats(room);
        const reveal = GameSession.computeSwipeReveal(room);
        io.to(room.code).emit('allPlayersFinished', matches);
        io.to(room.code).emit('swipeReveal', reveal);
        io.to(room.code).emit('gameStats', stats);
      } else {
        room.status = 'ranking';
        io.to(room.code).emit('allPlayersFinished', matches);
      }
    }
  });

  socket.on('undoSwipe', () => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (!room || room.status !== 'swiping') return;

    const undone = GameSession.undoSwipe(room, socket.id);
    if (undone) {
      const player = room.players.find(p => p.id === socket.id);
      if (player) {
        io.to(room.code).emit('playerProgress', socket.id, player.progress);
      }
      socket.emit('swipeUndone', undone);
    }
  });
}
