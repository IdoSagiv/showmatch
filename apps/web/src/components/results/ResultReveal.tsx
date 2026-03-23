'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TitleCard } from '@/types/game';
import Confetti from './Confetti';
import SwipeCard from '@/components/game/SwipeCard';
import { playSound } from '@/lib/sounds';

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

  useEffect(() => {
    if (revealed && !skipCountdown) {
      playSound('victory');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed]);

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
            <h2 className="text-2xl font-bold mb-4">Tonight&apos;s Pick! 🎉</h2>

            {/* Same card as in the game — preview mode: tappable to flip, not swipeable */}
            <div className="relative mx-auto" style={{ width: 280, height: 420 }}>
              <SwipeCard
                card={winner}
                onSwipe={() => {}}
                isTop={false}
                stackIndex={0}
                preview
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
