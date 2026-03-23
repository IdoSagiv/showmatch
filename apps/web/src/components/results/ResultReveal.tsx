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
            initial={{ opacity: 0, scale: 1.4 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.35 }}
            className="flex justify-center"
          >
            <motion.div
              className="w-44 h-44 rounded-full border-4 border-primary/40 flex items-center justify-center"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(229,9,20,0.2)',
                  '0 0 50px rgba(229,9,20,0.55)',
                  '0 0 20px rgba(229,9,20,0.2)',
                ],
              }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <span
                className="text-8xl font-black"
                style={{
                  background: 'linear-gradient(135deg, #e50914, #ff6b35)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {countdown}
              </span>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="winner"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <Confetti />

            <h2 className="text-3xl font-black mb-1">
              🎬{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #e50914, #ff6b35)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Tonight&apos;s Pick!
              </span>
            </h2>
            <p className="text-sm text-gray-500 mb-5">Everyone agreed on this one</p>

            {/* Winner card */}
            <div className="relative mx-auto" style={{ width: 280, height: 420 }}>
              {/* Glow ring behind card */}
              <div
                className="absolute inset-0 rounded-2xl"
                style={{ boxShadow: '0 0 60px rgba(229,9,20,0.35)', borderRadius: '1rem' }}
              />
              <SwipeCard
                card={winner}
                onSwipe={() => {}}
                isTop={false}
                stackIndex={0}
                preview
              />
            </div>

            {/* Floor glow */}
            <div
              className="mx-auto mt-3 w-36 h-4 rounded-full"
              style={{ background: 'rgba(229,9,20,0.25)', filter: 'blur(12px)' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
