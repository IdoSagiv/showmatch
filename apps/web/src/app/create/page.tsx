'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSocket } from '@/hooks/useSocket';
import { useGameStore } from '@/stores/gameStore';
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
  const { room, setRoom, setPlayerId, updateSettings, loadingProgress } = useGameStore();

  // Step 1: pick a name. Step 2: room is live.
  const [name, setName] = useState(() => randomName());
  const [step, setStep] = useState<'name' | 'room'>('name');
  const [creating, setCreating] = useState(false);
  const [gameStarting, setGameStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // If room already in store (e.g. back-navigation), skip to room step
  useEffect(() => {
    if (room) setStep('room');
  }, []);

  useEffect(() => {
    if (step === 'name') setTimeout(() => inputRef.current?.select(), 50);
  }, [step]);

  const handleCreate = useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCreating(true);
    setError(null);
    socket.emit('createRoom', trimmed, (response: any) => {
      if ('error' in response) {
        setError(response.error);
        setCreating(false);
        return;
      }
      setRoom(response.room);
      setPlayerId(socket.id || '');
      setStep('room');
      setCreating(false);
    });
  }, [name, socket, setRoom, setPlayerId]);

  const handleSettingsChange = useCallback((settings: GameSettings) => {
    updateSettings(settings);
    socket.emit('updateSettings', settings);
  }, [socket, updateSettings]);

  const handleStartGame = useCallback(() => {
    if (!room) return;
    setGameStarting(true);
    setError(null);
    socket.emit('startGame');
    socket.once('error' as any, (msg: string) => {
      setGameStarting(false);
      setError(msg);
    });
  }, [socket, room]);

  useEffect(() => {
    if (room?.status === 'swiping') {
      router.push(`/game/${room.code}`);
    }
  }, [room?.status, room?.code, router]);

  /* ── Step 1: Name picker ── */
  if (step === 'name') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <motion.div
          className="w-full max-w-sm flex flex-col items-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Logo size="md" />

          <div className="w-full text-center">
            <h2 className="text-xl font-bold mb-1">What's your name?</h2>
            <p className="text-sm text-gray-500">Others will see this in the lobby</p>
          </div>

          <div className="w-full flex flex-col gap-3">
            <div className="relative">
              <input
                ref={inputRef}
                value={name}
                onChange={e => setName(e.target.value.slice(0, 50))}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder="Your name"
                maxLength={50}
                className="
                  w-full bg-dark-surface border border-dark-border rounded-xl
                  px-4 py-3 text-center text-lg font-medium text-white
                  focus:outline-none focus:border-primary transition-colors
                "
              />
              <button
                type="button"
                onClick={() => setName(randomName())}
                title="Random name"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition-colors text-lg"
              >
                🎲
              </button>
            </div>

            {error && <p className="text-sm text-accent-red text-center">{error}</p>}

            <Button
              size="lg"
              onClick={handleCreate}
              disabled={!name.trim() || creating}
              className="w-full"
            >
              {creating ? 'Creating…' : 'Create Room'}
            </Button>

            <button
              onClick={() => router.push('/')}
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors text-center"
            >
              ← Back
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  /* ── Loading: game is starting ── */
  if (gameStarting) {
    const stage = loadingProgress?.stage || 'fetching';
    const progress = loadingProgress?.progress || 0;
    const total = loadingProgress?.total;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
        <div className="text-center">
          <p className="text-lg font-semibold text-white mb-1">
            {stage === 'fetching' ? 'Finding titles…' : 'Loading titles…'}
          </p>
          {total ? (
            <p className="text-sm text-gray-400">{progress} / {total}</p>
          ) : (
            <p className="text-sm text-gray-400">This takes a few seconds ☕</p>
          )}
        </div>
      </div>
    );
  }

  /* ── Step 2: Room live ── */
  if (!room) return null;
  const connectedCount = room.players.filter(p => p.connected).length;

  return (
    <main className="min-h-screen bg-dark">
      <header className="flex items-center justify-between p-4 border-b border-dark-border">
        <Logo size="sm" />
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
        <div className="sticky bottom-4 pb-safe flex flex-col gap-2">
          {error && (
            <p className="text-sm text-accent-red text-center bg-dark-card rounded-xl px-4 py-2 border border-red-900">
              {error}
            </p>
          )}
          <Button
            size="lg"
            onClick={handleStartGame}
            disabled={connectedCount < 2}
            className="w-full"
          >
            {connectedCount < 2
              ? `Waiting for players… (${connectedCount}/2)`
              : `Start Game (${connectedCount} players)`
            }
          </Button>
        </div>
      </div>
    </main>
  );
}
