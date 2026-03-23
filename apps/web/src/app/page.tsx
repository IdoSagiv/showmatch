'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
    <main className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        <HeroSection />
        <CreateGameButton />
        <JoinGameForm />
        <GameHistoryButton />
      </div>

      {/* Toast */}
      {toast && (
        <motion.div
          className="fixed top-4 left-1/2 -translate-x-1/2 bg-dark-card border border-dark-border px-6 py-3 rounded-xl text-sm z-50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {toast}
        </motion.div>
      )}
    </main>
  );
}
