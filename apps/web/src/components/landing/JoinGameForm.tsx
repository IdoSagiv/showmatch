'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { connectSocket } from '@/lib/socket';

export default function JoinGameForm() {
  const [code, setCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleJoin = () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length !== 5 || checking) return;
    setError(null);
    setChecking(true);
    const socket = connectSocket();
    const doCheck = () => {
      socket.emit('checkRoom', trimmed, (response: any) => {
        setChecking(false);
        if ('error' in response) setError(response.error);
        else router.push(`/join/${trimmed}?v=1`);
      });
    };
    if (socket.connected) doCheck();
    else socket.once('connect', doCheck);
  };

  const ready = code.trim().length === 5;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        {/* Code input */}
        <input
          value={code}
          onChange={e => { setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')); setError(null); }}
          onKeyDown={e => e.key === 'Enter' && handleJoin()}
          placeholder="ENTER CODE"
          maxLength={5}
          spellCheck={false}
          autoComplete="off"
          className="flex-1 min-w-0 bg-dark-surface/80 border border-dark-border rounded-xl px-4 py-4 text-center font-mono text-xl tracking-[0.35em] text-white placeholder:text-gray-500 placeholder:tracking-normal placeholder:text-sm focus:outline-none focus:border-primary/60 focus:bg-dark-surface transition-all"
        />

        {/* Join button — springs to life when 5 chars entered */}
        <div className="relative shrink-0 self-stretch">
          {/* Pulsing glow ring — only when ready */}
          <AnimatePresence>
            {ready && !checking && (
              <motion.span
                key="ring"
                className="absolute inset-0 rounded-xl pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ boxShadow: '0 0 0 0 rgba(229,9,20,0.7)' }}
              >
                <span className="absolute inset-0 rounded-xl border-2 border-primary/60 animate-ping" />
              </motion.span>
            )}
          </AnimatePresence>

          <motion.button
            onClick={handleJoin}
            disabled={!ready || checking}
            className="relative h-full px-6 rounded-xl font-black text-sm text-white overflow-hidden flex items-center justify-center"
            animate={{ opacity: ready ? 1 : 0.35 }}
            initial={false}
            transition={{ type: 'spring', stiffness: 500, damping: 18 }}
            whileTap={ready ? { scale: 0.88 } : {}}
            whileHover={ready ? { scale: 1.04 } : {}}
            style={{
              background: ready
                ? 'linear-gradient(135deg, #e50914 0%, #ff4b2b 60%, #ff6b35 100%)'
                : '#0f0e1f',
              border: ready ? 'none' : '1px solid rgba(45,43,78,0.6)',
              boxShadow: ready ? '0 4px 24px rgba(229,9,20,0.5), 0 1px 0 rgba(255,255,255,0.1) inset' : 'none',
            }}
          >
            {/* Shimmer — fires once when button becomes ready */}
            <AnimatePresence>
              {ready && !checking && (
                <motion.span
                  key="shimmer"
                  className="absolute inset-y-0 w-1/2 pointer-events-none"
                  style={{ background: 'linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.22) 50%, transparent 100%)' }}
                  initial={{ x: '-100%' }}
                  animate={{ x: '300%' }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                />
              )}
            </AnimatePresence>

            {/* Label */}
            <AnimatePresence mode="wait">
              {checking ? (
                <motion.span
                  key="checking"
                  className="flex items-center gap-1.5"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                >
                  {/* Three-dot spinner */}
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
                  className="flex items-center gap-1"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                >
                  Join
                  <AnimatePresence>
                    {ready && (
                      <motion.span
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -4 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                      >
                        →
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            className="text-center text-sm text-accent-red font-medium"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
