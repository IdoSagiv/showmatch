'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
          // Room verified — navigate with flag so join page skips its own check
          router.push(`/join/${trimmed}?v=1`);
        }
      });
    };

    if (socket.connected) {
      doCheck();
    } else {
      socket.once('connect', doCheck);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleJoin();
  };

  const ready = code.trim().length === 5;

  return (
    <motion.div
      className="mt-4 w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex gap-3">
        <input
          value={code}
          onChange={e => {
            setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder="ENTER CODE"
          maxLength={5}
          spellCheck={false}
          autoComplete="off"
          className="
            flex-1 min-w-0
            bg-dark-surface border border-dark-border
            rounded-xl px-4 py-3
            text-center font-mono text-xl tracking-[0.25em] text-white placeholder:text-gray-600 placeholder:tracking-normal placeholder:text-base
            focus:outline-none focus:border-primary transition-colors
          "
        />
        <button
          onClick={handleJoin}
          disabled={!ready || checking}
          className="
            px-6 py-3 rounded-xl font-semibold text-sm
            transition-all duration-150
            bg-primary text-white
            hover:bg-primary/90 active:scale-95
            disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-primary
            shrink-0
          "
        >
          {checking ? '…' : 'Join'}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-center text-sm text-accent-red">{error}</p>
      )}
    </motion.div>
  );
}
