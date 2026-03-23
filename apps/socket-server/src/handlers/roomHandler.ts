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

  socket.on('leaveRoom', () => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    if (player.isCreator) {
      io.to(room.code).emit('roomClosed', 'Host left the game');
      roomManager.destroyRoom(room.code);
    } else {
      roomManager.removePlayer(room.code, socket.id);
      socket.to(room.code).emit('playerLeft', socket.id);
    }
    socket.leave(room.code);
  });

  socket.on('endGame', () => {
    if (!roomManager.isCreator(socket.id)) return;

    const room = roomManager.getRoomBySocket(socket.id);
    if (!room) return;

    io.to(room.code).emit('roomClosed', 'Game ended by host');
    roomManager.destroyRoom(room.code);
  });

  socket.on('playAgain', () => {
    if (!roomManager.isCreator(socket.id)) return;

    const room = roomManager.getRoomBySocket(socket.id);
    if (!room) return;

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
  const result = roomManager.handleDisconnect(socket.id, (room, player) => {
    if (player.isCreator) {
      io.to(room.code).emit('roomClosed', 'Host left the game');
      roomManager.destroyRoom(room.code);
    } else {
      roomManager.removePlayer(room.code, player.id);
      io.to(room.code).emit('playerLeft', player.id);
    }
  });

  if (result) {
    socket.to(result.room.code).emit('playerLeft', result.player.id);
  }
}
