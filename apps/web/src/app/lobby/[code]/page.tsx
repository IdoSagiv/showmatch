'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSocket } from '@/hooks/useSocket';
import { useGameStore } from '@/stores/gameStore';
import FilterPanel from '@/components/lobby/FilterPanel';
import FilterPreview from '@/components/lobby/FilterPreview';
import PlayerList from '@/components/lobby/PlayerList';
import ShareButton from '@/components/lobby/ShareButton';
import WaitingAnimation from '@/components/lobby/WaitingAnimation';
import Button from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';

export default function LobbyPage() {
  const router = useRouter();
  const params = useParams();
  const code = (params.code as string).toUpperCase();
  const socket = useSocket();
  const { room, playerId, updateSettings } = useGameStore();

  useEffect(() => {
    if (!room) {
      router.push(`/join/${code}`);
    }
  }, [room, code, router]);

  useEffect(() => {
    if (room?.status === 'swiping') {
      router.push(`/game/${room.code}`);
    }
  }, [room?.status, room?.code, router]);

  if (!room) return null;

  const isCreator = room.players.find(p => p.id === playerId)?.isCreator ?? false;
  const creatorName = room.players.find(p => p.isCreator)?.displayName ?? 'Host';
  const connectedCount = room.players.filter(p => p.connected).length;

  const handleSettingsChange = (settings: any) => {
    updateSettings(settings);
    socket.emit('updateSettings', settings);
  };

  const handleStartGame = () => {
    socket.emit('startGame');
  };

  return (
    <main className="min-h-screen bg-dark">
      <header className="flex items-center justify-between p-4 border-b border-dark-border">
        <Logo size="sm" />
      </header>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Room Code */}
        <motion.div
          className="text-center bg-dark-card rounded-2xl p-4 border border-dark-border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-sm text-gray-400 mb-1">Room Code</p>
          <p className="text-3xl font-mono font-bold tracking-[0.3em]">{room.code}</p>
          <div className="mt-2 flex justify-center">
            <ShareButton code={room.code} />
          </div>
        </motion.div>

        {/* Players */}
        <PlayerList players={room.players} />

        {/* Filter Preview */}
        <FilterPreview settings={room.settings} />

        {/* Filters */}
        <FilterPanel
          settings={room.settings}
          onSettingsChange={handleSettingsChange}
          isCreator={isCreator}
        />

        {/* Start / Waiting */}
        {isCreator ? (
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
        ) : (
          <WaitingAnimation creatorName={creatorName} />
        )}
      </div>
    </main>
  );
}
