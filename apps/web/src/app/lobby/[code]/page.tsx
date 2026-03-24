'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSocket } from '@/hooks/useSocket';
import { useGameStore } from '@/stores/gameStore';
import { getSocket } from '@/lib/socket';
import { clearSession } from '@/lib/session';
import CopyableCode from '@/components/ui/CopyableCode';
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
  const { room, playerId, updateSettings, reconnecting } = useGameStore();

  useEffect(() => {
    if (!reconnecting && !room) {
      router.push(`/join/${code}`);
    }
  }, [reconnecting, room, code, router]);

  useEffect(() => {
    if (room?.status === 'swiping') {
      router.push(`/game/${room.code}`);
    }
  }, [room?.status, room?.code, router]);

  // When the player navigates away (SPA) while still in the lobby, tell the
  // server so other players see an updated list immediately.
  //
  // StrictMode guard: React App Router runs effects twice in development
  // (mount → cleanup → remount). We use a ref + setTimeout(0) trick:
  //   - On StrictMode remount, the ref is reset to false before the macrotask fires.
  //   - On real unmount there is no remount, so the ref stays true → emit fires.
  // Guard: game start sets room.status → 'swiping' before this cleanup runs.
  const leavingRef = useRef(false);
  useEffect(() => {
    leavingRef.current = false; // reset on every mount (real or StrictMode re-mount)
    return () => {
      leavingRef.current = true;
      setTimeout(() => {
        if (!leavingRef.current) return; // StrictMode remount already reset this
        const { room: currentRoom } = useGameStore.getState();
        if (currentRoom?.status === 'lobby') {
          clearSession();
          getSocket().emit('leaveRoom');
        }
      }, 0);
    };
  }, []);

  if (reconnecting) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="text-3xl animate-pulse">🎬</div>
        <p className="text-gray-400 text-sm tracking-wide">Reconnecting...</p>
      </div>
    </div>
  );
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
      <header className="flex items-center justify-between px-4 py-3 bg-transparent backdrop-blur-md sticky top-0 z-20">
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
          <CopyableCode code={room.code} />
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
          <div className="sticky bottom-4 z-10">
            <Button
              size="lg"
              onClick={handleStartGame}
              disabled={connectedCount < 2}
              className="w-full"
            >
              {connectedCount < 2
                ? `Waiting for players… (${connectedCount}/2)`
                : `Start Game · ${connectedCount} players`
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
