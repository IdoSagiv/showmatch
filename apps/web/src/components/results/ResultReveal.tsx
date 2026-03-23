'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TitleCard } from '@/types/game';
import Confetti from './Confetti';

interface ResultRevealProps {
  winner: TitleCard;
  skipCountdown?: boolean;
}

export default function ResultReveal({ winner, skipCountdown = false }: ResultRevealProps) {
  const [countdown, setCountdown] = useState(skipCountdown ? 0 : 3);
  const [revealed, setRevealed] = useState(skipCountdown);

  useEffect(() => {
    if (skipCountdown) return;
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    } else {
      setRevealed(true);
    }
  }, [countdown, skipCountdown]);

  return (
    <div className="text-center">
      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div
            key={countdown}
            className="text-8xl font-bold text-primary"
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {countdown}
          </motion.div>
        ) : (
          <motion.div
            key="winner"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <Confetti />
            <h2 className="text-2xl font-bold mb-4 text-accent-gold">Tonight&apos;s Pick!</h2>
            <div className="bg-dark-card rounded-2xl overflow-hidden border border-dark-border max-w-xs mx-auto shadow-2xl">
              {winner.posterPath && (
                <img
                  src={winner.posterPath}
                  alt={winner.title}
                  className="w-full aspect-[2/3] object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="text-xl font-bold">{winner.title}</h3>
                <p className="text-gray-400">({winner.year})</p>
                <div className="flex justify-center gap-3 mt-2 text-sm">
                  <span>&#9733; {winner.voteAverage.toFixed(1)}</span>
                  {winner.rottenTomatoesScore !== null && (
                    <span>&#127813; {winner.rottenTomatoesScore}%</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
