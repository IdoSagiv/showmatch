'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function JoinGameForm() {
  const [code, setCode] = useState('');
  const router = useRouter();

  const handleJoin = () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length === 5) {
      router.push(`/join/${trimmed}`);
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
          onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
          onKeyDown={handleKeyDown}
          placeholder="ENTER CODE"
          maxLength={5}
          spellCheck={false}
          autoComplete="off"
          className="
            flex-1 min-w-0
            bg-dark-surface border border-dark-border
            rounded-xl px-4 py-3
            text-center font-mono text-xl tracking-[0.25em] text-white placeholder:text-gray-600
            focus:outline-none focus:border-primary transition-colors
          "
        />
        <button
          onClick={handleJoin}
          disabled={!ready}
          className="
            px-6 py-3 rounded-xl font-semibold text-sm
            transition-all duration-150
            bg-primary text-white
            hover:bg-primary/90 active:scale-95
            disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-primary
            shrink-0
          "
        >
          Join
        </button>
      </div>
    </motion.div>
  );
}
