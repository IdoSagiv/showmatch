'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CreateGameButton from '@/components/landing/CreateGameButton';
import JoinGameForm from '@/components/landing/JoinGameForm';
import GameHistoryButton from '@/components/landing/GameHistoryButton';

export default function Home() {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const msg = sessionStorage.getItem('showmatch-toast');
    if (msg) {
      setToast(msg);
      sessionStorage.removeItem('showmatch-toast');
      setTimeout(() => setToast(null), 4000);
    }
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5 py-10 relative overflow-hidden bg-dark">

      {/* ── Atmospheric background ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(229,9,20,0.18) 0%, transparent 65%)' }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 -right-32 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(109,40,217,0.1) 0%, transparent 65%)' }}
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute top-1/3 -left-24 w-[300px] h-[300px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(255,107,53,0.07) 0%, transparent 65%)' }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">

        {/* Logo */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        >
          <h1 className="font-black tracking-tight leading-none" style={{ fontSize: 'clamp(3rem, 16vw, 4.5rem)' }}>
            <span className="text-white">Show</span>
            <span className="gradient-text">Match</span>
          </h1>
          <p className="mt-2 text-sm text-gray-500 tracking-[0.25em] uppercase font-medium">
            Swipe · Match · Watch
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="w-full flex flex-col gap-3"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, type: 'spring', stiffness: 240, damping: 24 }}
        >
          <CreateGameButton />

          <div className="flex items-center gap-3 text-gray-700 text-xs my-1">
            <div className="flex-1 h-px bg-dark-border" />
            <span className="tracking-widest uppercase">or</span>
            <div className="flex-1 h-px bg-dark-border" />
          </div>

          <JoinGameForm />
        </motion.div>

        <motion.div
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <GameHistoryButton />
        </motion.div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="fixed left-1/2 -translate-x-1/2 glass-card px-5 py-3 rounded-2xl text-sm z-50 whitespace-nowrap"
            style={{ top: 'max(1rem, env(safe-area-inset-top))' }}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
