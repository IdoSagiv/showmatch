import { GameSettings, TitleCard, Player, GameStatAward } from './game';

export interface ServerToClientEvents {
  playerJoined: (player: Player) => void;
  playerLeft: (playerId: string) => void;
  settingsUpdated: (settings: GameSettings) => void;
  titleCountPreview: (count: number) => void;
  gameStarted: (titlePool: TitleCard[]) => void;
  playerProgress: (playerId: string, progress: number) => void;
  allPlayersFinished: (matchedTitles: TitleCard[]) => void;
  firstMatch: (title: TitleCard) => void;
  rankingsReady: (winner: TitleCard, rankings: Array<{ title: TitleCard; avgRank: number }>) => void;
  swipeReveal: (reveals: Array<{ title: TitleCard; playerDecisions: Array<{ playerName: string; decision: string }> }>) => void;
  gameStats: (stats: GameStatAward[]) => void;
  roomClosed: (reason: string) => void;
  error: (message: string) => void;
}

export interface ClientToServerEvents {
  createRoom: (playerName: string, callback: (response: { room: import('./game').Room } | { error: string }) => void) => void;
  joinRoom: (code: string, playerName: string, callback: (response: { room: import('./game').Room } | { error: string }) => void) => void;
  checkRoom: (code: string, callback: (response: { exists: boolean; error?: string }) => void) => void;
  rejoinGame: (payload: { code: string; displayName: string }) => void;
  updateSettings: (settings: GameSettings) => void;
  requestTitleCount: (settings: GameSettings) => void;
  startGame: () => void;
  submitSwipe: (tmdbId: number, decision: 'like' | 'pass' | 'superlike') => void;
  undoSwipe: () => void;
  submitRanking: (rankings: Array<{ tmdbId: number; rank: number }>) => void;
  playAgain: (payload?: { playerId?: string }) => void;
  endGame: (payload?: { playerId?: string }) => void;
  leaveRoom: (payload?: { playerId?: string }) => void;
}
