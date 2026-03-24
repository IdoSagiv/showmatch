import { Room, GameSettings, Player } from '../types';
import { generateRoomCode } from '../lib/codeGenerator';

const DEFAULT_SETTINGS: GameSettings = {
  providers: [],
  mediaTypes: ['movie', 'tv'],
  genres: [],
  poolSize: 30,
  minRating: 5.0,
  region: 'US',
  language: 'en',
  yearRange: [2000, new Date().getFullYear()],
  contentRatings: ['G', 'PG', 'PG-13', 'R'],
  sortBy: 'popularity.desc',
  firstMatchMode: false,
  timerSeconds: null,
};

class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private socketToRoom: Map<string, string> = new Map();
  private socketToPlayer: Map<string, string> = new Map();
  private disconnectTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    setInterval(() => this.cleanupOldRooms(), 5 * 60 * 1000);
  }

  createRoom(creatorName: string, socketId: string): Room {
    const existingCodes = new Set(this.rooms.keys());
    const code = generateRoomCode(existingCodes);

    const creator: Player = {
      id: socketId,
      displayName: creatorName,
      isCreator: true,
      connected: true,
      progress: 0,
      finished: false,
      superLikeUsed: false,
    };

    const room: Room = {
      code,
      status: 'lobby',
      settings: { ...DEFAULT_SETTINGS },
      players: [creator],
      titlePool: [],
      matchedTitles: [],
      winner: null,
      createdAt: Date.now(),
      swipes: new Map(),
      rankings: new Map(),
    };

    this.rooms.set(code, room);
    this.socketToRoom.set(socketId, code);
    this.socketToPlayer.set(socketId, socketId);

    return room;
  }

  joinRoom(code: string, playerName: string, socketId: string): { room: Room } | { error: string } {
    const room = this.rooms.get(code);
    if (!room) return { error: 'Room not found' };
    if (room.status !== 'lobby') return { error: 'Game already started' };
    if (room.players.some(p => p.displayName === playerName)) {
      return { error: 'Name already taken, please choose another' };
    }

    const player: Player = {
      id: socketId,
      displayName: playerName,
      isCreator: false,
      connected: true,
      progress: 0,
      finished: false,
      superLikeUsed: false,
    };

    room.players.push(player);
    this.socketToRoom.set(socketId, code);
    this.socketToPlayer.set(socketId, socketId);

    return { room };
  }

  /**
   * Re-attach a socket to an existing in-game player.
   * Works regardless of current connected state — handles both brief
   * disconnects and server-restart re-joins.
   */
  rejoinPlayer(code: string, displayName: string, newSocketId: string): { room: Room; player: Player } | null {
    const room = this.rooms.get(code);
    if (!room) return null;

    const player = room.players.find(p => p.displayName === displayName);
    if (!player) return null;

    const oldSocketId = player.id;

    // Cancel any pending disconnect timer
    const timerKey = `${code}:${oldSocketId}`;
    const timer = this.disconnectTimers.get(timerKey);
    if (timer) {
      clearTimeout(timer);
      this.disconnectTimers.delete(timerKey);
    }

    // Migrate swipes / rankings keyed by old socket ID
    const oldSwipes = room.swipes.get(oldSocketId);
    if (oldSwipes) {
      room.swipes.set(newSocketId, oldSwipes);
      room.swipes.delete(oldSocketId);
    }
    const oldRankings = room.rankings.get(oldSocketId);
    if (oldRankings) {
      room.rankings.set(newSocketId, oldRankings);
      room.rankings.delete(oldSocketId);
    }

    // Remap socket lookups
    this.socketToRoom.delete(oldSocketId);
    this.socketToPlayer.delete(oldSocketId);
    player.id = newSocketId;
    player.connected = true;
    this.socketToRoom.set(newSocketId, code);
    this.socketToPlayer.set(newSocketId, newSocketId);

    return { room, player };
  }

  reconnectPlayer(code: string, playerName: string, newSocketId: string): { room: Room; player: Player } | null {
    const room = this.rooms.get(code);
    if (!room) return null;

    const player = room.players.find(p => p.displayName === playerName && !p.connected);
    if (!player) return null;

    const oldSocketId = player.id;
    const timerKey = `${code}:${oldSocketId}`;
    const timer = this.disconnectTimers.get(timerKey);
    if (timer) {
      clearTimeout(timer);
      this.disconnectTimers.delete(timerKey);
    }

    // Transfer swipes/rankings from old socket ID
    const oldSwipes = room.swipes.get(oldSocketId);
    if (oldSwipes) {
      room.swipes.set(newSocketId, oldSwipes);
      room.swipes.delete(oldSocketId);
    }
    const oldRankings = room.rankings.get(oldSocketId);
    if (oldRankings) {
      room.rankings.set(newSocketId, oldRankings);
      room.rankings.delete(oldSocketId);
    }

    player.id = newSocketId;
    player.connected = true;
    this.socketToRoom.set(newSocketId, code);
    this.socketToPlayer.set(newSocketId, newSocketId);

    return { room, player };
  }

  getRoom(code: string): Room | null {
    return this.rooms.get(code) || null;
  }

  getRoomBySocket(socketId: string): Room | null {
    const code = this.socketToRoom.get(socketId);
    if (!code) return null;
    return this.rooms.get(code) || null;
  }

  /** Find the room that has a player with this ID (survives socket reconnects). */
  getRoomByPlayerId(playerId: string): Room | null {
    for (const room of this.rooms.values()) {
      if (room.players.some(p => p.id === playerId)) return room;
    }
    return null;
  }

  getPlayerBySocket(socketId: string): Player | null {
    const room = this.getRoomBySocket(socketId);
    if (!room) return null;
    return room.players.find(p => p.id === socketId) || null;
  }

  handleDisconnect(socketId: string, onExpire: (room: Room, player: Player) => void): { room: Room; player: Player } | null {
    const room = this.getRoomBySocket(socketId);
    if (!room) return null;

    const player = room.players.find(p => p.id === socketId);
    if (!player) return null;

    player.connected = false;

    const timerKey = `${room.code}:${socketId}`;
    // Lobby: 5s grace — no in-progress state to preserve; fast feedback for others.
    // Finished rooms: 5s grace (feels responsive, survives brief reconnects).
    // Host in active game: 15s grace — long enough to survive a brief network blip,
    //   short enough that guests don't wait forever if the host leaves for real.
    // Other players in active game: 60s grace (allows full reconnect mid-game).
    const graceMs = (room.status === 'lobby' || room.status === 'finished')
      ? 5_000
      : (player.isCreator ? 15_000 : 60_000);
    const timer = setTimeout(() => {
      this.disconnectTimers.delete(timerKey);
      onExpire(room, player);
    }, graceMs);

    this.disconnectTimers.set(timerKey, timer);

    return { room, player };
  }

  removePlayer(code: string, playerId: string): void {
    const room = this.rooms.get(code);
    if (!room) return;

    room.players = room.players.filter(p => p.id !== playerId);
    room.swipes.delete(playerId);
    room.rankings.delete(playerId);
    this.socketToRoom.delete(playerId);
    this.socketToPlayer.delete(playerId);

    if (room.players.length === 0) {
      this.destroyRoom(code);
    }
  }

  destroyRoom(code: string): void {
    const room = this.rooms.get(code);
    if (room) {
      for (const player of room.players) {
        this.socketToRoom.delete(player.id);
        this.socketToPlayer.delete(player.id);
        const timerKey = `${code}:${player.id}`;
        const timer = this.disconnectTimers.get(timerKey);
        if (timer) {
          clearTimeout(timer);
          this.disconnectTimers.delete(timerKey);
        }
      }
    }
    this.rooms.delete(code);
  }

  updateSettings(code: string, settings: GameSettings): void {
    const room = this.rooms.get(code);
    if (room) {
      room.settings = settings;
    }
  }

  getRoomCodes(): string[] {
    return [...this.rooms.keys()];
  }

  isCreator(socketId: string): boolean {
    const room = this.getRoomBySocket(socketId);
    if (!room) return false;
    const player = room.players.find(p => p.id === socketId);
    return player?.isCreator ?? false;
  }

  private cleanupOldRooms(): void {
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    for (const [code, room] of this.rooms.entries()) {
      if (room.createdAt < twoHoursAgo) {
        console.log(`Cleaning up old room: ${code}`);
        this.destroyRoom(code);
      }
    }
  }

  serializeRoom(room: Room): object {
    return {
      code: room.code,
      status: room.status,
      settings: room.settings,
      players: room.players,
      titlePool: room.titlePool,
      matchedTitles: room.matchedTitles,
      winner: room.winner,
    };
  }
}

export const roomManager = new RoomManager();
