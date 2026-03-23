'use client';

import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import { useGameStore } from '@/stores/gameStore';

export function useBeforeUnload() {
  const room = useGameStore(s => s.room);
  const playerId = useGameStore(s => s.playerId);

  useEffect(() => {
    const handler = () => {
      if (room) {
        try {
          const socket = getSocket();
          socket.emit('leaveRoom', { playerId: playerId ?? undefined });
        } catch {}
      }
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [room, playerId]);
}
