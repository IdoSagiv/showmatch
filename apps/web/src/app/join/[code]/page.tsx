'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '@/hooks/useSocket';
import { useGameStore } from '@/stores/gameStore';
import { NAME_ADJECTIVES, NAME_NOUNS } from '@/lib/constants';
import Logo from '@/components/ui/Logo';

function randomName(): string {
  const adj = NAME_ADJECTIVES[Math.floor(Math.random() * NAME_ADJECTIVES.length)];
  const noun = NAME_NOUNS[Math.floor(Math.random() * NAME_NOUNS.length)];
  return `${adj} ${noun}`;
}

export default function JoinPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const code = (params.code as string).toUpperCase();
  const socket = useSocket();
  const { setRoom, setPlayerId } = useGameStore();
  const [name, setName] = useState(randomName());
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [shuffling, setShuffling] = useState(false);
  const checking = !searchParams.get('v');

  useEffect(() => {
    if (!checking) return;

    const doCheck = () => {
      socket.emit('checkRoom', code, (response: any) => {
        if ('error' in response) {
          sessionStorage.setItem('showmatch-toast', response.error);
          router.replace('/');
        }
      });
    };

    if (socket.connected) doCheck();
    else { socket.once('connect', doCheck); socket.connect(); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleJoin = () => {
    if (!name.trim() || joining) return;
    setJoining(true);
    setError(null);

    const doJoin = () => {
      socket.emit('joinRoom', code, name.trim(), (response: any) => {
        if ('error' in response) {
          setError(response.error);
          setJoining(false);
          return;
        }
        setRoom(response.room);
        setPlayerId(socket.id || '');
        router.push(`/lobby/${code}`);
      });
    };

    if (socket.connected) doJoin();
    else { socket.once('connect', doJoin); socket.connect(); }
  };

  const handleShuffle = () => {
    setShuffling(true);
    setName(randomName());
    setTimeout(() => setShuffling(false), 350);
  };

  return (
    <main className="min-h-screen relative overflow-hidden bg-dark flex flex-col">

      {/* ── Atmospheric blobs ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(229,9,20,0.15) 0%, transparent 65%)' }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 -right-32 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(109,40,217,0.1) 0%, transparent 65%)' }}
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      {/* ── Header ── */}
      <header className="relative z-10 flex items-center px-5 pt-5 pb-3">
        <Logo size="sm" />
      </header>

      {/* ── Content ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 py-8">
        <motion.div
          className="w-full max-w-sm flex flex-col items-center gap-8"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 24 }}
        >

          {/* Room code block */}
          <div className="text-center">
            <p className="text-xs text-gray-600 tracking-[0.25em] uppercase font-semibold mb-3">
              Joining Room
            </p>
            <motion.div
              className="code-glow font-mono font-black tracking-[0.45em] text-white"
              style={{ fontSize: 'clamp(2.4rem, 13vw, 3.5rem)' }}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 220, damping: 20 }}
            >
              {code}
            </motion.div>
          </div>

          {/* Name card */}
          <motion.div
            className="w-full rounded-3xl p-5 space-y-4"
            style={{
              background: 'rgba(12,11,24,0.75)',
              border: '1px solid rgba(255,255,255,0.07)',
              backdropFilter: 'blur(20px)',
            }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, type: 'spring', stiffness: 220, damping: 24 }}
          >
            <div>
              <p className="text-xs text-gray-500 tracking-widest uppercase font-semibold mb-3">
                Your Name
              </p>

              {/* Input + shuffle row */}
              <div className="flex gap-2 items-stretch">
                <div className="relative flex-1 min-w-0">
                  <AnimatePresence mode="wait">
                    <motion.input
                      key={shuffling ? 'shuffling' : 'idle'}
                      value={name}
                      onChange={e => { setName(e.target.value.slice(0, 50)); setError(null); }}
                      onKeyDown={e => e.key === 'Enter' && handleJoin()}
                      placeholder="Your name"
                      maxLength={50}
                      autoFocus
                      className="w-full bg-dark-surface/70 border border-dark-border rounded-2xl px-4 py-3.5 text-center text-base font-semibold text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/60 transition-all"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.18 }}
                    />
                  </AnimatePresence>
                </div>

                {/* Shuffle button */}
                <motion.button
                  type="button"
                  onClick={handleShuffle}
                  title="Random name"
                  className="shrink-0 w-[52px] rounded-2xl border border-dark-border bg-dark-surface/70 text-xl flex items-center justify-center"
                  whileTap={{ scale: 0.88 }}
                  whileHover={{ borderColor: 'rgba(229,9,20,0.4)' }}
                  animate={{ rotate: shuffling ? 180 : 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                >
                  🎲
                </motion.button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  className="text-accent-red text-sm text-center"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Join button */}
            <motion.button
              onClick={handleJoin}
              disabled={!name.trim() || joining}
              className="relative w-full rounded-2xl overflow-hidden font-black text-base text-white py-4 tracking-wide disabled:opacity-40"
              style={{
                background: 'linear-gradient(135deg, #e50914 0%, #ff4b2b 50%, #ff6b35 100%)',
                boxShadow: name.trim() && !joining
                  ? '0 4px 28px rgba(229,9,20,0.45), 0 1px 0 rgba(255,255,255,0.1) inset'
                  : 'none',
              }}
              whileTap={{ scale: 0.97 }}
              whileHover={name.trim() && !joining ? { scale: 1.01 } : {}}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            >
              <AnimatePresence mode="wait">
                {joining ? (
                  <motion.span
                    key="joining"
                    className="flex items-center justify-center gap-2"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                  >
                    {[0, 1, 2].map(i => (
                      <motion.span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-white block"
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </motion.span>
                ) : (
                  <motion.span
                    key="label"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                  >
                    Join Game →
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>

          {/* Back link */}
          <motion.button
            onClick={() => router.back()}
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            ← Back
          </motion.button>

        </motion.div>
      </div>
    </main>
  );
}
