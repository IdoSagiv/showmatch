'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { TitleCard } from '@/types/game';
import { useSound } from '@/hooks/useSound';

interface WildcardPickerProps {
  candidates: TitleCard[];
  isCreator: boolean;
  wildcardSpinning: boolean; // true when host has started the spin (guests use this)
  onSpinStart: () => void;   // emits wildcardSpinStart socket event
  onPick: (tmdbId: number) => void;
}

export default function WildcardPicker({
  candidates, isCreator, wildcardSpinning, onSpinStart, onPick,
}: WildcardPickerProps) {
  const [spinning, setSpinning] = useState(false);
  const [picked, setPicked] = useState(false);
  const [displayIndex, setDisplayIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();
  const { playTick, playWildcard } = useSound();

  // Host spin: accelerating slowdown, then picks winner
  const handleSpin = useCallback(() => {
    if (spinning || picked || candidates.length === 0) return;
    onSpinStart();
    setSpinning(true);

    let speed = 80;
    let idx = 0;

    const tick = () => {
      idx = (idx + 1) % candidates.length;
      setDisplayIndex(idx);
      playTick();
      speed += 15;

      if (speed > 400) {
        setSpinning(false);
        setPicked(true);
        const selected = candidates[Math.floor(Math.random() * candidates.length)];
        setTimeout(() => playWildcard(), 150);
        onPick(selected.tmdbId);
        return;
      }

      intervalRef.current = setTimeout(tick, speed);
    };

    tick();
  }, [candidates, spinning, picked, playTick, playWildcard, onSpinStart, onPick]);

  // Guest spin: starts when host triggers, runs at constant speed until
  // wildcardResult arrives and this component unmounts
  useEffect(() => {
    if (isCreator || !wildcardSpinning) return;

    let idx = 0;
    let alive = true;

    const tick = () => {
      if (!alive) return;
      idx = (idx + 1) % candidates.length;
      setDisplayIndex(idx);
      playTick();
      intervalRef.current = setTimeout(tick, 100);
    };

    tick();
    return () => { alive = false; clearTimeout(intervalRef.current); };
  }, [wildcardSpinning, isCreator, candidates, playTick]);

  if (candidates.length === 0) {
    return <p className="text-gray-400 text-center">No close matches found.</p>;
  }

  const isSpinning = spinning || (!isCreator && wildcardSpinning);

  return (
    <div className="text-center space-y-4">
      <h2 className="text-xl font-bold">No one could agree! 🤷</h2>
      <p className="text-gray-400">But here&apos;s what came closest...</p>

      {/* Candidates — spinning highlight tracks displayIndex */}
      <div className="flex justify-center gap-2 mb-4">
        {candidates.slice(0, 3).map((c, i) => (
          <motion.div
            key={c.tmdbId}
            className={`w-20 rounded-lg overflow-hidden border-2 transition-colors ${
              isSpinning && displayIndex % candidates.slice(0, 3).length === i
                ? 'border-primary'
                : 'border-dark-border'
            }`}
          >
            {c.posterPath && <img src={c.posterPath} alt={c.title} className="w-full aspect-[2/3] object-cover" />}
            <p className="text-xs p-1 truncate" title={c.title}>{c.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Host: spin button */}
      {isCreator && !picked && (
        <motion.button
          onClick={handleSpin}
          disabled={spinning}
          className="px-6 py-3 bg-gradient-to-r from-accent-gold to-[#ff9500] text-black rounded-xl font-bold text-lg disabled:opacity-50 shadow-lg shadow-accent-gold/30"
          whileTap={{ scale: 0.95 }}
        >
          {spinning ? 'Spinning...' : 'Wildcard Pick!'}
        </motion.button>
      )}

      {/* Host: revealing */}
      {isCreator && picked && (
        <p className="text-accent-gold font-semibold animate-pulse">Revealing…</p>
      )}

      {/* Guest: spinning in progress */}
      {!isCreator && wildcardSpinning && (
        <p className="text-accent-gold text-sm animate-pulse">Picking the wildcard…</p>
      )}

      {/* Guest: waiting for host to start */}
      {!isCreator && !wildcardSpinning && (
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="w-6 h-6 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Waiting for host to pick…</p>
        </div>
      )}
    </div>
  );
}
