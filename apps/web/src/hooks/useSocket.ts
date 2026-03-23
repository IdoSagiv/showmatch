'use client';

import { useEffect, useRef } from 'react';
import { connectSocket, getSocket } from '@/lib/socket';
import { useGameStore } from '@/stores/gameStore';
import type { Socket } from 'socket.io-client';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const store = useGameStore();

  useEffect(() => {
    const socket = connectSocket();
    socketRef.current = socket;

    socket.on('playerJoined', (player) => {
      store.addPlayer(player);
    });

    socket.on('playerLeft', (playerId) => {
      store.removePlayer(playerId);
    });

    socket.on('settingsUpdated', (settings) => {
      store.updateSettings(settings);
    });

    socket.on('gameStarted', (titlePool) => {
      store.startGame(titlePool);
    });

    (socket as any).on('loadingProgress', (data: { stage: string; progress: number; total?: number }) => {
      store.setLoadingProgress(data);
    });

    socket.on('playerProgress', (playerId, progress) => {
      store.updatePlayerProgress(playerId, progress);
    });

    socket.on('allPlayersFinished', (matchedTitles) => {
      store.setMatchedTitles(matchedTitles);
      store.setGameOver(true);
    });

    socket.on('firstMatch', (title) => {
      store.setIsFirstMatch(true);
      store.setWinner(title);
      store.setMatchedTitles([title]);
      store.setGameOver(true);
    });

    socket.on('rankingsReady', (winner, rankings) => {
      store.setWinner(winner);
      store.setFullRankings(rankings);
    });

    socket.on('swipeReveal', (reveals) => {
      store.setSwipeReveal(reveals);
    });

    socket.on('gameStats', (stats) => {
      store.setGameStats(stats);
    });

    (socket as any).on('wildcardCandidates', (candidates: any) => {
      store.setWildcardCandidates(candidates);
    });

    (socket as any).on('roomReset', (room: any) => {
      // Reset game-specific flags so the new game starts clean.
      // Don't call store.reset() — that would wipe playerId.
      store.setGameOver(false);
      store.setRoom(room);
    });

    socket.on('roomClosed', (reason) => {
      store.reset();
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('showmatch-toast', reason);
        window.location.href = '/';
      }
    });

    return () => {
      socket.off('playerJoined');
      socket.off('playerLeft');
      socket.off('settingsUpdated');
      socket.off('gameStarted');
      socket.off('playerProgress');
      socket.off('allPlayersFinished');
      socket.off('firstMatch');
      socket.off('rankingsReady');
      socket.off('swipeReveal');
      socket.off('gameStats');
      socket.off('roomClosed');
      (socket as any).off('wildcardCandidates');
      (socket as any).off('roomReset');
      (socket as any).off('loadingProgress');
    };
  }, []);

  return getSocket();
}
