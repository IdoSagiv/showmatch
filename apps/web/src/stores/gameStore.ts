'use client';

import { create } from 'zustand';
import type { Room, Player, TitleCard, GameSettings, GameStatAward, SwipeDecision } from '@/types/game';

interface GameStore {
  room: Room | null;
  playerId: string | null;
  titlePool: TitleCard[];
  currentCardIndex: number;
  matchedTitles: TitleCard[];
  wildcardCandidates: TitleCard[];
  wildcardSpinning: boolean;
  winner: TitleCard | null;
  fullRankings: Array<{ title: TitleCard; avgRank: number }>;
  swipeReveal: Array<{ title: TitleCard; playerDecisions: Array<{ playerName: string; decision: string }> }>;
  gameStats: GameStatAward[];
  mySwipes: SwipeDecision[];
  vetoedTmdbIds: number[];
  isFirstMatch: boolean;
  loadingProgress: { stage: string; progress: number; total?: number } | null;
  gameOver: boolean;
  /** True while attempting socket rejoin after a page refresh. Prevents premature redirects. */
  reconnecting: boolean;

  setRoom: (room: Room | null) => void;
  setPlayerId: (id: string) => void;
  updatePlayers: (players: Player[]) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  updatePlayer: (player: Player) => void;
  updateSettings: (settings: GameSettings) => void;
  startGame: (titlePool: TitleCard[]) => void;
  recordSwipe: (decision: SwipeDecision) => void;
  undoLastSwipe: () => SwipeDecision | null;
  updatePlayerProgress: (playerId: string, progress: number) => void;
  setMatchedTitles: (titles: TitleCard[]) => void;
  setWildcardCandidates: (titles: TitleCard[]) => void;
  setWildcardSpinning: (spinning: boolean) => void;
  setWinner: (winner: TitleCard) => void;
  setFullRankings: (rankings: Array<{ title: TitleCard; avgRank: number }>) => void;
  setSwipeReveal: (reveal: Array<{ title: TitleCard; playerDecisions: Array<{ playerName: string; decision: string }> }>) => void;
  setGameStats: (stats: GameStatAward[]) => void;
  setIsFirstMatch: (val: boolean) => void;
  setLoadingProgress: (data: { stage: string; progress: number; total?: number } | null) => void;
  setGameOver: (val: boolean) => void;
  setReconnecting: (val: boolean) => void;
  setCurrentCardIndex: (idx: number) => void;
  setTitlePool: (pool: TitleCard[]) => void;
  addVeto: (tmdbId: number) => void;
  markPlayerVetoed: (playerId: string) => void;
  reset: () => void;
}

const initialState = {
  room: null as Room | null,
  playerId: null as string | null,
  titlePool: [] as TitleCard[],
  currentCardIndex: 0,
  matchedTitles: [] as TitleCard[],
  wildcardCandidates: [] as TitleCard[],
  wildcardSpinning: false,
  winner: null as TitleCard | null,
  fullRankings: [] as Array<{ title: TitleCard; avgRank: number }>,
  swipeReveal: [] as Array<{ title: TitleCard; playerDecisions: Array<{ playerName: string; decision: string }> }>,
  gameStats: [] as GameStatAward[],
  mySwipes: [] as SwipeDecision[],
  vetoedTmdbIds: [] as number[],
  isFirstMatch: false,
  loadingProgress: null as { stage: string; progress: number; total?: number } | null,
  gameOver: false,
  // Initialise as `true` on the client if a session exists in sessionStorage.
  // This prevents lobby/game pages from redirecting away before the socket
  // has had a chance to connect and fire rejoinGame. The value is synchronous
  // so it beats any useEffect timing race.
  reconnecting: typeof window !== 'undefined'
    ? !!sessionStorage.getItem('showmatch-session')
    : false,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  setRoom: (room) => set({ room }),
  setPlayerId: (id) => set({ playerId: id }),

  updatePlayers: (players) => set((state) => ({
    room: state.room ? { ...state.room, players } : null,
  })),

  addPlayer: (player) => set((state) => ({
    room: state.room ? { ...state.room, players: [...state.room.players, player] } : null,
  })),

  removePlayer: (playerId) => set((state) => ({
    room: state.room ? {
      ...state.room,
      players: state.room.players.filter(p => p.id !== playerId),
    } : null,
  })),

  updatePlayer: (player) => set((state) => ({
    room: state.room ? {
      ...state.room,
      players: state.room.players.map(p => p.id === player.id ? player : p),
    } : null,
  })),

  updateSettings: (settings) => set((state) => ({
    room: state.room ? { ...state.room, settings } : null,
  })),

  startGame: (titlePool) => set((state) => ({
    titlePool,
    currentCardIndex: 0,
    mySwipes: [],
    vetoedTmdbIds: [],
    matchedTitles: [],
    winner: null,
    fullRankings: [],
    swipeReveal: [],
    gameStats: [],
    wildcardCandidates: [],
    isFirstMatch: false,
    gameOver: false,
    loadingProgress: null,
    room: state.room ? { ...state.room, status: 'swiping', titlePool } : null,
  })),

  recordSwipe: (decision) => set((state) => {
    const isSuperLike = decision.decision === 'superlike';
    return {
      mySwipes: [...state.mySwipes, decision],
      currentCardIndex: state.currentCardIndex + 1,
      // Mark superLikeUsed on the local player so the button/gesture
      // disables immediately without waiting for a server round-trip.
      room: (isSuperLike && state.room && state.playerId)
        ? {
            ...state.room,
            players: state.room.players.map(p =>
              p.id === state.playerId ? { ...p, superLikeUsed: true } : p
            ),
          }
        : state.room,
    };
  }),

  undoLastSwipe: () => {
    const state = get();
    if (state.mySwipes.length === 0) return null;
    const undone = state.mySwipes[state.mySwipes.length - 1];
    set({
      mySwipes: state.mySwipes.slice(0, -1),
      currentCardIndex: Math.max(0, state.currentCardIndex - 1),
    });
    return undone;
  },

  updatePlayerProgress: (playerId, progress) => set((state) => ({
    room: state.room ? {
      ...state.room,
      players: state.room.players.map(p =>
        p.id === playerId ? { ...p, progress, finished: progress >= state.titlePool.length } : p
      ),
    } : null,
  })),

  setMatchedTitles: (titles) => set({ matchedTitles: titles }),
  setWildcardCandidates: (titles) => set({ wildcardCandidates: titles }),
  setWildcardSpinning: (spinning) => set({ wildcardSpinning: spinning }),
  setWinner: (winner) => set({ winner }),
  setFullRankings: (rankings) => set({ fullRankings: rankings }),
  setSwipeReveal: (reveal) => set({ swipeReveal: reveal }),
  setGameStats: (stats) => set({ gameStats: stats }),
  setIsFirstMatch: (val) => set({ isFirstMatch: val }),
  setLoadingProgress: (data) => set({ loadingProgress: data }),
  setGameOver: (val) => set({ gameOver: val }),
  setReconnecting: (val) => set({ reconnecting: val }),
  addVeto: (tmdbId) => set(state => ({ vetoedTmdbIds: [...state.vetoedTmdbIds, tmdbId] })),
  markPlayerVetoed: (playerId) => set(state => ({
    room: state.room ? {
      ...state.room,
      players: state.room.players.map(p => p.id === playerId ? { ...p, vetoUsed: true } : p),
    } : null,
  })),
  setCurrentCardIndex: (idx) => set({ currentCardIndex: idx }),
  setTitlePool: (pool) => set({ titlePool: pool }),

  reset: () => set(initialState),
}));
