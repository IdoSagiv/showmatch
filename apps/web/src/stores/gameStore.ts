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
  winner: TitleCard | null;
  fullRankings: Array<{ title: TitleCard; avgRank: number }>;
  swipeReveal: Array<{ title: TitleCard; playerDecisions: Array<{ playerName: string; decision: string }> }>;
  gameStats: GameStatAward[];
  mySwipes: SwipeDecision[];
  isFirstMatch: boolean;

  setRoom: (room: Room | null) => void;
  setPlayerId: (id: string) => void;
  updatePlayers: (players: Player[]) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  updateSettings: (settings: GameSettings) => void;
  startGame: (titlePool: TitleCard[]) => void;
  recordSwipe: (decision: SwipeDecision) => void;
  undoLastSwipe: () => SwipeDecision | null;
  updatePlayerProgress: (playerId: string, progress: number) => void;
  setMatchedTitles: (titles: TitleCard[]) => void;
  setWildcardCandidates: (titles: TitleCard[]) => void;
  setWinner: (winner: TitleCard) => void;
  setFullRankings: (rankings: Array<{ title: TitleCard; avgRank: number }>) => void;
  setSwipeReveal: (reveal: Array<{ title: TitleCard; playerDecisions: Array<{ playerName: string; decision: string }> }>) => void;
  setGameStats: (stats: GameStatAward[]) => void;
  setIsFirstMatch: (val: boolean) => void;
  reset: () => void;
}

const initialState = {
  room: null as Room | null,
  playerId: null as string | null,
  titlePool: [] as TitleCard[],
  currentCardIndex: 0,
  matchedTitles: [] as TitleCard[],
  wildcardCandidates: [] as TitleCard[],
  winner: null as TitleCard | null,
  fullRankings: [] as Array<{ title: TitleCard; avgRank: number }>,
  swipeReveal: [] as Array<{ title: TitleCard; playerDecisions: Array<{ playerName: string; decision: string }> }>,
  gameStats: [] as GameStatAward[],
  mySwipes: [] as SwipeDecision[],
  isFirstMatch: false,
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

  updateSettings: (settings) => set((state) => ({
    room: state.room ? { ...state.room, settings } : null,
  })),

  startGame: (titlePool) => set((state) => ({
    titlePool,
    currentCardIndex: 0,
    mySwipes: [],
    matchedTitles: [],
    winner: null,
    fullRankings: [],
    swipeReveal: [],
    gameStats: [],
    wildcardCandidates: [],
    isFirstMatch: false,
    room: state.room ? { ...state.room, status: 'swiping', titlePool } : null,
  })),

  recordSwipe: (decision) => set((state) => ({
    mySwipes: [...state.mySwipes, decision],
    currentCardIndex: state.currentCardIndex + 1,
  })),

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
  setWinner: (winner) => set({ winner }),
  setFullRankings: (rankings) => set({ fullRankings: rankings }),
  setSwipeReveal: (reveal) => set({ swipeReveal: reveal }),
  setGameStats: (stats) => set({ gameStats: stats }),
  setIsFirstMatch: (val) => set({ isFirstMatch: val }),

  reset: () => set(initialState),
}));
