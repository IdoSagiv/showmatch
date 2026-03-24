'use client';

import { useEffect, useRef } from 'react';
import { connectSocket, getSocket } from '@/lib/socket';
import { useGameStore } from '@/stores/gameStore';
import { playSound } from '@/lib/sounds';
import type { Socket } from 'socket.io-client';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const store = useGameStore();
  // Track whether this socket has connected at least once so we can
  // distinguish a reconnect (true) from the initial connection (false).
  const everConnectedRef = useRef(false);

  useEffect(() => {
    const socket = connectSocket();
    socketRef.current = socket;

    // On every (re)connect: if we were already connected before, try to
    // re-attach to the room.  Handles both brief disconnects and full
    // server restarts (server responds with roomClosed if room is gone).
    socket.on('connect', () => {
      if (!everConnectedRef.current) {
        everConnectedRef.current = true;
        return; // initial connect — nothing to rejoin
      }
      const { room, playerId } = useGameStore.getState();
      if (!room) return;
      const me = room.players.find(p => p.id === playerId);
      if (!me) return;
      socket.emit('rejoinGame', { code: room.code, displayName: me.displayName });
    });

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
      if (matchedTitles.length > 0) playSound('match');
    });

    socket.on('firstMatch', (title) => {
      store.setIsFirstMatch(true);
      store.setWinner(title);
      store.setMatchedTitles([title]);
      store.setGameOver(true);
      playSound('victory');
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

    socket.on('wildcardResult', (winner) => {
      store.setWinner(winner);
    });

    (socket as any).on('roomReset', (room: any) => {
      // Reset game-specific flags so the new game starts clean.
      // Don't call store.reset() — that would wipe playerId.
      store.setGameOver(false);
      store.setRoom(room);
    });

    (socket as any).on('gameRejoined', (room: any) => {
      // Successfully re-attached to existing room after reconnect.
      // Update room state; keep client-side progress (currentCardIndex) intact.
      store.setRoom(room);
    });

    socket.on('roomClosed', (reason) => {
      // Don't call store.reset() here — it nullifies `room` which triggers the
      // game page's guard effect to do a SPA navigation that races with our
      // window.location.href below and can eat the toast from sessionStorage.
      // A full-page reload (window.location.href) already wipes all in-memory
      // state, so the reset is redundant anyway.
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('showmatch-toast', reason);
        window.location.href = '/';
      }
    });

    return () => {
      socket.off('connect');
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
      socket.off('wildcardResult');
      (socket as any).off('roomReset');
      (socket as any).off('loadingProgress');
      (socket as any).off('gameRejoined');
    };
  }, []);

  return getSocket();
}
