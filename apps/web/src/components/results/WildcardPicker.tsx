'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TitleCard } from '@/types/game';
import Confetti from './Confetti';

interface WildcardPickerProps {
  candidates: TitleCard[];
}

export default function WildcardPicker({ candidates }: WildcardPickerProps) {
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<TitleCard | null>(null);
  const [displayIndex, setDisplayIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  const handleSpin = useCallback(() => {
    if (spinning || candidates.length === 0) return;
    setSpinning(true);
    setWinner(null);

    let speed = 80;
    let idx = 0;

    const tick = () => {
      idx = (idx + 1) % candidates.length;
      setDisplayIndex(idx);
      speed += 15;

      if (speed > 400) {
        setSpinning(false);
        const selected = candidates[Math.floor(Math.random() * candidates.length)];
        setWinner(selected);
        return;
      }

      intervalRef.current = setTimeout(tick, speed);
    };

    tick();
  }, [candidates, spinning]);

  if (candidates.length === 0) {
    return <p className="text-gray-400 text-center">No close matches found.</p>;
  }

  return (
    <div className="text-center space-y-4">
      <h2 className="text-xl font-bold">No one could agree! 🤷</h2>
      <p className="text-gray-400">But here&apos;s what came closest...</p>

      {/* Candidates */}
      <div className="flex justify-center gap-2 mb-4">
        {candidates.slice(0, 3).map((c, i) => (
          <motion.div
            key={c.tmdbId}
            className={`w-20 rounded-lg overflow-hidden border-2 transition-colors ${
              spinning && displayIndex === i ? 'border-primary' : winner?.tmdbId === c.tmdbId ? 'border-accent-gold' : 'border-dark-border'
            }`}
          >
            {c.posterPath && <img src={c.posterPath} alt={c.title} className="w-full aspect-[2/3] object-cover" />}
            <p className="text-xs p-1 truncate" title={c.title}>{c.title}</p>
          </motion.div>
        ))}
      </div>

      {!winner && (
        <motion.button
          onClick={handleSpin}
          disabled={spinning}
          className="px-6 py-3 bg-accent-gold text-black rounded-xl font-bold text-lg disabled:opacity-50"
          whileTap={{ scale: 0.95 }}
        >
          {spinning ? 'Spinning...' : 'Wildcard Pick!'}
        </motion.button>
      )}

      <AnimatePresence>
        {winner && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-4"
          >
            <Confetti />
            <p className="text-accent-gold font-bold text-lg mb-2">The wildcard chose:</p>
            <div className="bg-dark-card rounded-xl overflow-hidden border border-accent-gold max-w-[200px] mx-auto">
              {winner.posterPath && <img src={winner.posterPath} alt={winner.title} className="w-full aspect-[2/3] object-cover" />}
              <p className="p-2 font-bold">{winner.title}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
