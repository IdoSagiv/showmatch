'use client';

import { useEffect, useRef } from 'react';
import { connectSocket, getSocket } from '@/lib/socket';
import { useGameStore } from '@/stores/gameStore';
import { playSound } from '@/lib/sounds';
import { loadSession, clearSession } from '@/lib/session';
import type { Socket } from 'socket.io-client';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const store = useGameStore();
  const everConnectedRef = useRef(false);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const socket = connectSocket();
    socketRef.current = socket;

    // On every (re)connect: try to re-attach to an active room.
    // • First connect + session in sessionStorage → page refresh case
    // • Re-connect (socket dropped) + room in Zustand → brief disconnect case
    const handleConnect = () => {
      if (!everConnectedRef.current) {
        everConnectedRef.current = true;
        // Page-refresh case: Zustand is empty but sessionStorage may have a session
        const session = loadSession();
        if (session) {
          useGameStore.getState().setReconnecting(true);
          socket.emit('rejoinGame', { code: session.code, displayName: session.displayName });
          // Safety net: if server never responds, stop blocking after 5s
          reconnectTimerRef.current = setTimeout(() => {
            if (useGameStore.getState().reconnecting) {
              clearSession();
              useGameStore.getState().setReconnecting(false);
            }
          }, 5000);
        }
        return;
      }
      // Brief-disconnect case: Zustand still has the room
      const { room, playerId } = useGameStore.getState();
      if (!room) return;
      const me = room.players.find(p => p.id === playerId);
      if (!me) return;
      socket.emit('rejoinGame', { code: room.code, displayName: me.displayName });
    };

    socket.on('connect', handleConnect);
    // Socket may already be connected (pre-warmed from home page).
    // The 'connect' event won't fire again — run the handler immediately.
    if (socket.connected) handleConnect();

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

    socket.on('wildcardSpinStart', () => {
      store.setWildcardSpinning(true);
    });

    socket.on('wildcardResult', (winner) => {
      store.setWildcardSpinning(false);
      store.setWinner(winner);
    });

    (socket as any).on('roomReset', (room: any) => {
      // Reset game-specific flags so the new game starts clean.
      // Don't call store.reset() — that would wipe playerId.
      store.setGameOver(false);
      store.setRoom(room);
    });

    (socket as any).on('gameRejoined', (room: any, titlePool: any[]) => {
      if (reconnectTimerRef.current) { clearTimeout(reconnectTimerRef.current); reconnectTimerRef.current = null; }
      // Successfully re-attached. Restore as much state as possible.
      const session = loadSession();
      const me = room.players.find((p: any) =>
        p.id === socket.id ||
        (session && p.displayName === session.displayName)
      );

      store.setRoom(room);
      if (me) store.setPlayerId(me.id);

      if (room.status === 'swiping' && titlePool?.length) {
        // Active game: restore the title pool and resume from where this player left off
        store.setTitlePool(titlePool);
        store.setCurrentCardIndex(me?.progress ?? 0);
      } else if ((room.status === 'ranking' || room.status === 'finished') && titlePool?.length) {
        // Results screen: restore pool + end-state flags
        store.setTitlePool(titlePool);
        store.setGameOver(true);
        if (room.matchedTitles?.length) store.setMatchedTitles(room.matchedTitles);
        if (room.winner) store.setWinner(room.winner);
      }

      store.setReconnecting(false);

      // Navigate to the correct page based on room status
      if (typeof window === 'undefined') return;
      const path = window.location.pathname;
      if (room.status === 'swiping' && !path.includes('/game/')) {
        window.location.href = `/game/${room.code}`;
      } else if ((room.status === 'ranking' || room.status === 'finished') && !path.includes('/results/')) {
        window.location.href = `/results/${room.code}`;
      } else if (room.status === 'lobby' && me?.isCreator && !path.includes('/create')) {
        window.location.href = '/create';
      } else if (room.status === 'lobby' && !me?.isCreator && !path.includes(`/lobby/${room.code}`)) {
        window.location.href = `/lobby/${room.code}`;
      }
      // If already on the right page, do nothing — store update is enough
    });

    socket.on('roomClosed', (reason) => {
      if (reconnectTimerRef.current) { clearTimeout(reconnectTimerRef.current); reconnectTimerRef.current = null; }
      clearSession(); // room is gone — don't attempt rejoin on next refresh
      store.setReconnecting(false);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('showmatch-toast', reason);
        window.location.href = '/';
      }
    });

    return () => {
      socket.off('connect', handleConnect);
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
      socket.off('wildcardSpinStart');
      socket.off('wildcardResult');
      (socket as any).off('roomReset');
      (socket as any).off('loadingProgress');
      (socket as any).off('gameRejoined');
    };
  }, []);

  return getSocket();
}
