import { GameSettings, TitleCard, Player, Room, GameStatAward } from './game';

export interface ServerToClientEvents {
  playerJoined: (player: Player) => void;
  playerLeft: (playerId: string) => void;
  playerRejoined: (player: Player) => void;
  settingsUpdated: (settings: GameSettings) => void;
  titleCountPreview: (count: number) => void;
  loadingProgress: (data: { stage: string; progress: number; total?: number }) => void;
  gameStarted: (titlePool: TitleCard[]) => void;
  gameRejoined: (room: Room, titlePool: TitleCard[]) => void;
  playerProgress: (playerId: string, progress: number) => void;
  allPlayersFinished: (matchedTitles: TitleCard[]) => void;
  wildcardCandidates: (candidates: TitleCard[]) => void;
  wildcardSpinStart: () => void;
  wildcardResult: (winner: TitleCard) => void;
  firstMatch: (title: TitleCard) => void;
  rankingsReady: (winner: TitleCard, rankings: Array<{ title: TitleCard; avgRank: number }>) => void;
  swipeReveal: (reveals: Array<{ title: TitleCard; playerDecisions: Array<{ playerName: string; decision: string }> }>) => void;
  gameStats: (stats: GameStatAward[]) => void;
  roomClosed: (reason: string) => void;
  roomReset: (room: Room) => void;
  playerVetoed: (playerId: string, tmdbId: number) => void;
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
  vetoTitle: (tmdbId: number) => void;
  undoSwipe: () => void;
  wildcardSpinStart: () => void;
  wildcardPick: (tmdbId: number) => void;
  submitRanking: (rankings: Array<{ tmdbId: number; rank: number }>) => void;
  playAgain: (payload?: { playerId?: string }) => void;
  endGame: (payload?: { playerId?: string }) => void;
  leaveRoom: (payload?: { playerId?: string }) => void;
}
