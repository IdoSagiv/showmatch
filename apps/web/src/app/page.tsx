'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HeroSection from '@/components/landing/HeroSection';
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
    <main className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden bg-dark">
      {/* Background atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary red bloom — top */}
        <motion.div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[350px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(229,9,20,0.14) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Orange accent — right */}
        <motion.div
          className="absolute top-1/4 -right-24 w-[320px] h-[320px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(255,107,53,0.08) 0%, transparent 70%)' }}
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        {/* Violet depth — bottom left */}
        <motion.div
          className="absolute -bottom-24 -left-24 w-[380px] h-[380px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(109,40,217,0.08) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        {/* Subtle center glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(229,9,20,0.03) 0%, transparent 65%)' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-3">
        <HeroSection />

        {/* Main action card */}
        <motion.div
          className="gradient-border w-full rounded-2xl p-5 flex flex-col gap-4"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 24 }}
        >
          <CreateGameButton />

          <div className="flex items-center gap-3 text-gray-600 text-xs">
            <div className="flex-1 h-px bg-dark-border" />
            <span className="tracking-wider uppercase">or join with a code</span>
            <div className="flex-1 h-px bg-dark-border" />
          </div>

          <JoinGameForm />
        </motion.div>

        <GameHistoryButton />
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="fixed left-1/2 -translate-x-1/2 glass-card px-6 py-3 rounded-2xl text-sm z-50 whitespace-nowrap shadow-card"
            style={{ top: 'max(1rem, env(safe-area-inset-top))' }}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
