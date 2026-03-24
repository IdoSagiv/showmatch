'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSocket } from '@/hooks/useSocket';
import { useGameStore } from '@/stores/gameStore';
import { getSocket } from '@/lib/socket';
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

  // When the player navigates away (SPA or tab close) while still in the
  // lobby, tell the server so other players see an updated list immediately.
  // Guard: don't emit when the game starts — room.status will be 'swiping'
  // by the time this cleanup runs (game navigation triggers before unmount).
  useEffect(() => {
    return () => {
      const { room: currentRoom } = useGameStore.getState();
      if (currentRoom?.status === 'lobby') {
        getSocket().emit('leaveRoom');
      }
    };
  }, []);

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
    <main className="min-h-screen">
      {/* Frosted glass header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-dark-border bg-dark/90 backdrop-blur-md sticky top-0 z-20">
        <Logo size="sm" />
      </header>

      <div className="max-w-lg mx-auto p-4 pb-32 space-y-4">
        {/* Room Code — hero section */}
        <motion.div
          className="text-center rounded-2xl p-6 relative overflow-hidden glass-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        >
          {/* Subtle red bloom behind code */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(229,9,20,0.08) 0%, transparent 70%)' }}
          />

          <p className="text-xs text-gray-500 uppercase tracking-[0.2em] mb-2">Room Code</p>
          <p
            className="relative text-5xl font-mono font-black tracking-[0.4em] code-glow text-white"
          >
            {room.code}
          </p>
          <div className="mt-3 flex justify-center">
            <ShareButton code={room.code} />
          </div>
          {connectedCount < 2 && (
            <p className="mt-3 text-xs text-gray-600 tracking-wide">Share this code with friends to join</p>
          )}
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
                ? `Waiting for players… (${connectedCount}/2)`
                : `Start Game — ${connectedCount} players`
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
