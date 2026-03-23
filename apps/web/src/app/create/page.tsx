'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSocket } from '@/hooks/useSocket';
import { useGameStore } from '@/stores/gameStore';
import { DEFAULT_SETTINGS } from '@/lib/constants';
import { NAME_ADJECTIVES, NAME_NOUNS } from '@/lib/constants';
import FilterPanel from '@/components/lobby/FilterPanel';
import FilterPreview from '@/components/lobby/FilterPreview';
import PlayerList from '@/components/lobby/PlayerList';
import ShareButton from '@/components/lobby/ShareButton';
import Button from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';
import type { GameSettings } from '@/types/game';

function randomName(): string {
  const adj = NAME_ADJECTIVES[Math.floor(Math.random() * NAME_ADJECTIVES.length)];
  const noun = NAME_NOUNS[Math.floor(Math.random() * NAME_NOUNS.length)];
  return `${adj} ${noun}`;
}

export default function CreatePage() {
  const router = useRouter();
  const socket = useSocket();
  const { room, setRoom, setPlayerId, updateSettings } = useGameStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (room) {
      setLoading(false);
      return;
    }

    const name = randomName();
    socket.emit('createRoom', name, (response: any) => {
      if ('error' in response) {
        setError(response.error);
        setLoading(false);
        return;
      }
      setRoom(response.room);
      setPlayerId(socket.id || '');
      setLoading(false);
    });
  }, []);

  const handleSettingsChange = useCallback((settings: GameSettings) => {
    updateSettings(settings);
    socket.emit('updateSettings', settings);
  }, [socket, updateSettings]);

  const handleStartGame = useCallback(() => {
    if (!room) return;
    socket.emit('startGame');
  }, [socket, room]);

  useEffect(() => {
    if (room?.status === 'swiping') {
      router.push(`/game/${room.code}`);
    }
  }, [room?.status, room?.code, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <p className="text-accent-red mb-4">{error}</p>
        <Button onClick={() => router.push('/')}>Go Back</Button>
      </div>
    );
  }

  if (!room) return null;

  const connectedCount = room.players.filter(p => p.connected).length;

  return (
    <main className="min-h-screen bg-dark">
      <header className="flex items-center justify-between p-4 border-b border-dark-border">
        <a href="/"><Logo size="sm" /></a>
      </header>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Room Code */}
        <motion.div
          className="text-center bg-dark-card rounded-2xl p-6 border border-dark-border"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm text-gray-400 mb-2">Room Code</p>
          <p className="text-4xl font-mono font-bold tracking-[0.3em] text-white">{room.code}</p>
          <div className="mt-3 flex justify-center">
            <ShareButton code={room.code} />
          </div>
        </motion.div>

        {/* Filter Preview */}
        <FilterPreview settings={room.settings} />

        {/* Filter Panel */}
        <FilterPanel
          settings={room.settings}
          onSettingsChange={handleSettingsChange}
          isCreator={true}
        />

        {/* Players */}
        <PlayerList players={room.players} />

        {/* Start Button */}
        <div className="sticky bottom-4">
          <Button
            size="lg"
            onClick={handleStartGame}
            disabled={connectedCount < 2}
            className="w-full"
          >
            {connectedCount < 2
              ? `Waiting for players... (${connectedCount}/2)`
              : `Start Game (${connectedCount} players)`
            }
          </Button>
        </div>
      </div>
    </main>
  );
}
