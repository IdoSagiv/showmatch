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
        if ('error' in response) {
          setError(response.error);
        } else {
          router.push(`/join/${trimmed}?v=1`);
        }
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
          className="flex-1 min-w-0 bg-dark-surface/80 border border-dark-border rounded-xl px-4 py-4 text-center font-mono text-xl tracking-[0.35em] text-white placeholder:text-gray-700 placeholder:tracking-normal placeholder:text-sm focus:outline-none focus:border-primary/60 focus:bg-dark-surface transition-all"
        />

        {/* Join button */}
        <motion.button
          onClick={handleJoin}
          disabled={!ready || checking}
          className="px-6 py-4 rounded-xl font-bold text-sm text-white shrink-0 transition-all"
          style={{
            background: ready
              ? 'linear-gradient(135deg, #1a1939, #2d2b6e)'
              : undefined,
            backgroundColor: ready ? undefined : '#13122a',
            border: ready ? '1px solid rgba(229,9,20,0.4)' : '1px solid rgba(45,43,78,0.6)',
            opacity: ready ? 1 : 0.45,
          }}
          whileTap={ready ? { scale: 0.95 } : {}}
        >
          {checking ? '…' : 'Join'}
        </motion.button>
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
