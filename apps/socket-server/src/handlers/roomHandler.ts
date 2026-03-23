import { Server, Socket } from 'socket.io';
import { roomManager } from '../state/RoomManager';

export function registerRoomHandlers(io: Server, socket: Socket) {
  socket.on('createRoom', (playerName: string, callback: Function) => {
    if (!playerName || playerName.length < 1 || playerName.length > 50) {
      callback({ error: 'Name must be 1-50 characters' });
      return;
    }

    const room = roomManager.createRoom(playerName, socket.id);
    socket.join(room.code);
    callback({ room: roomManager.serializeRoom(room) });
    console.log(`Room ${room.code} created by ${playerName}`);
  });

  socket.on('joinRoom', (code: string, playerName: string, callback: Function) => {
    console.log(`[joinRoom] code=${code} name=${playerName} socket=${socket.id} activeRooms=${roomManager.getRoomCodes().join(',')}`);
    if (!playerName || playerName.length < 1 || playerName.length > 50) {
      callback({ error: 'Name must be 1-50 characters' });
      return;
    }

    const result = roomManager.joinRoom(code.toUpperCase(), playerName, socket.id);
    if ('error' in result) {
      callback(result);
      return;
    }

    socket.join(result.room.code);
    const player = result.room.players.find(p => p.id === socket.id)!;
    socket.to(result.room.code).emit('playerJoined', player);
    callback({ room: roomManager.serializeRoom(result.room) });
    console.log(`${playerName} joined room ${code}`);
  });

  socket.on('checkRoom', (code: string, callback: Function) => {
    const room = roomManager.getRoom(code?.toUpperCase());
    if (!room) {
      callback({ error: 'Room not found' });
      return;
    }
    if (room.status !== 'lobby') {
      callback({ error: 'Game already in progress' });
      return;
    }
    callback({ status: room.status, playerCount: room.players.length });
  });

  socket.on('leaveRoom', (payload?: { playerId?: string }) => {
    // Support playerId fallback so this works even after a socket reconnect
    const room = roomManager.getRoomBySocket(socket.id)
      ?? (payload?.playerId ? roomManager.getRoomByPlayerId(payload.playerId) : null);
    if (!room) return;

    const player = room.players.find(
      p => p.id === socket.id || p.id === payload?.playerId
    );
    if (!player) return;

    if (player.isCreator) {
      // socket.to() excludes the sender — host navigates themselves on the client
      socket.to(room.code).emit('roomClosed', 'Host left the game');
      roomManager.destroyRoom(room.code);
    } else {
      roomManager.removePlayer(room.code, player.id);
      socket.to(room.code).emit('playerLeft', player.id);
    }
    socket.leave(room.code);
  });

  socket.on('endGame', (payload?: { playerId?: string }) => {
    // Find room by current socket or by stored playerId (survives reconnects)
    const room = roomManager.getRoomBySocket(socket.id)
      ?? (payload?.playerId ? roomManager.getRoomByPlayerId(payload.playerId) : null);
    if (!room) return;

    const isCreator = room.players.find(
      p => p.id === socket.id || p.id === payload?.playerId
    )?.isCreator ?? false;
    if (!isCreator) return;

    // socket.to() excludes the sender — host navigates themselves on the client
    socket.to(room.code).emit('roomClosed', 'Game ended by host');
    roomManager.destroyRoom(room.code);
  });

  socket.on('playAgain', (payload?: { playerId?: string }) => {
    const room = roomManager.getRoomBySocket(socket.id)
      ?? (payload?.playerId ? roomManager.getRoomByPlayerId(payload.playerId) : null);
    if (!room) return;

    const isCreator = room.players.find(
      p => p.id === socket.id || p.id === payload?.playerId
    )?.isCreator ?? false;
    if (!isCreator) return;

    room.status = 'lobby';
    room.titlePool = [];
    room.matchedTitles = [];
    room.winner = null;
    room.swipes.clear();
    room.rankings.clear();
    for (const player of room.players) {
      player.progress = 0;
      player.finished = false;
      player.superLikeUsed = false;
    }

    io.to(room.code).emit('roomReset', roomManager.serializeRoom(room));
  });
}

export function handleDisconnect(io: Server, socket: Socket) {
  roomManager.handleDisconnect(socket.id, (room, player) => {
    if (player.isCreator) {
      io.to(room.code).emit('roomClosed', 'Host disconnected');
      roomManager.destroyRoom(room.code);
    } else {
      roomManager.removePlayer(room.code, player.id);
      io.to(room.code).emit('playerLeft', player.id);
    }
  });
}
