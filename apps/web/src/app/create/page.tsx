'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSocket } from '@/hooks/useSocket';
import { useGameStore } from '@/stores/gameStore';
import { getSocket } from '@/lib/socket';
import CopyableCode from '@/components/ui/CopyableCode';
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
  const leavingRef = useRef(false);

  // If room already in store (e.g. back-navigation), skip to room step
  useEffect(() => {
    if (room) setStep('room');
  }, []);

  useEffect(() => {
    if (step === 'name') setTimeout(() => inputRef.current?.select(), 50);
  }, [step]);

  // When host navigates away from the live lobby, notify the server so
  // waiting players receive `roomClosed` immediately instead of waiting
  // for the disconnect grace period.
  // StrictMode guard: ref + setTimeout(0) — same pattern as lobby page.
  useEffect(() => {
    if (step !== 'room') return;
    leavingRef.current = false;
    return () => {
      leavingRef.current = true;
      setTimeout(() => {
        if (!leavingRef.current) return;
        // If Logo's handleLeave already ran, reset() clears the room → skip.
        const { room: currentRoom } = useGameStore.getState();
        if (currentRoom?.status === 'lobby') {
          getSocket().emit('leaveRoom');
        }
      }, 0);
    };
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
      <main className="min-h-screen relative overflow-hidden flex flex-col">
        {/* Atmospheric blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(229,9,20,0.15) 0%, transparent 65%)' }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 -left-32 w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(109,40,217,0.1) 0%, transparent 65%)' }}
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
        </div>

        {/* Header */}
        <header className="relative z-10 flex items-center px-5 pt-5 pb-3">
          <Logo size="sm" />
        </header>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 py-8">
          <motion.div
            className="w-full max-w-sm flex flex-col items-center gap-8"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 24 }}
          >
            {/* Title */}
            <div className="text-center">
              <h2 className="font-black tracking-tight" style={{ fontSize: 'clamp(1.8rem, 8vw, 2.4rem)' }}>
                Create a Room
              </h2>
              <p className="text-gray-400 text-sm mt-2">Friends will join with a code you share</p>
            </div>

            {/* Name card */}
            <div
              className="w-full rounded-3xl p-5 space-y-4"
              style={{ background: 'rgba(12,11,24,0.75)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}
            >
              <p className="text-xs text-gray-400 tracking-widest uppercase font-semibold">Your Name</p>

              <div className="flex gap-2 items-stretch">
                <input
                  ref={inputRef}
                  value={name}
                  onChange={e => setName(e.target.value.slice(0, 50))}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  placeholder="Your name"
                  maxLength={50}
                  className="flex-1 min-w-0 bg-dark-surface/70 border border-dark-border rounded-2xl px-4 py-3.5 text-center text-base font-semibold text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/60 transition-all"
                />
                <motion.button
                  type="button"
                  onClick={() => setName(randomName())}
                  title="Random name"
                  className="shrink-0 w-[52px] rounded-2xl border border-dark-border bg-dark-surface/70 text-xl flex items-center justify-center"
                  whileTap={{ scale: 0.88 }}
                  whileHover={{ borderColor: 'rgba(229,9,20,0.4)' }}
                >
                  🎲
                </motion.button>
              </div>

              {error && (
                <p className="text-accent-red text-sm text-center">{error}</p>
              )}

              <motion.button
                onClick={handleCreate}
                disabled={!name.trim() || creating}
                className="relative w-full rounded-2xl overflow-hidden font-black text-base text-white py-4 tracking-wide disabled:opacity-40"
                style={{
                  background: 'linear-gradient(135deg, #e50914 0%, #ff4b2b 50%, #ff6b35 100%)',
                  boxShadow: name.trim() && !creating ? '0 4px 28px rgba(229,9,20,0.45), 0 1px 0 rgba(255,255,255,0.1) inset' : 'none',
                }}
                whileTap={{ scale: 0.97 }}
                whileHover={name.trim() && !creating ? { scale: 1.01 } : {}}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              >
                {creating ? (
                  <span className="flex items-center justify-center gap-2">
                    {[0, 1, 2].map(i => (
                      <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-white block"
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
                    ))}
                  </span>
                ) : 'Create Room →'}
              </motion.button>
            </div>

            <motion.button
              onClick={() => router.push('/')}
              className="text-xs text-gray-400 hover:text-white transition-colors tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              ← Back
            </motion.button>
          </motion.div>
        </div>
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
    <main className="min-h-screen">
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
          <CopyableCode code={room.code} textSize="text-4xl" tracking="tracking-[0.3em]" />
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
        <div className="sticky bottom-4 pb-safe flex flex-col gap-2 z-10">
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
