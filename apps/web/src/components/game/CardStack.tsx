'use client';

import { motion } from 'framer-motion';
import type { TitleCard } from '@/types/game';
import SwipeCard from './SwipeCard';

interface CardStackProps {
  cards: TitleCard[];
  currentIndex: number;
  onSwipe: (decision: 'like' | 'pass' | 'superlike') => void;
  superLikeUsed?: boolean;
  pendingDecision?: 'like' | 'pass' | 'superlike' | null;
  onPendingConsumed?: () => void;
}

export default function CardStack({
  cards, currentIndex, onSwipe,
  superLikeUsed = false,
  pendingDecision, onPendingConsumed,
}: CardStackProps) {
  if (currentIndex >= cards.length) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p className="text-2xl font-bold mb-2">✅ All done!</p>
          <p className="text-gray-400">Waiting for others to finish…</p>
        </motion.div>
      </div>
    );
  }

  const visibleCards = cards.slice(currentIndex, currentIndex + 3);

  return (
    <div className="relative w-full h-full max-w-[min(90vw,400px)] mx-auto">
      {/* Render back-to-front so top card is on top */}
      {[...visibleCards].reverse().map((card, reversedI) => {
        const stackIndex = visibleCards.length - 1 - reversedI;
        const isTop = stackIndex === 0;
        return (
          <SwipeCard
            key={card.tmdbId}
            card={card}
            onSwipe={onSwipe}
            isTop={isTop}
            stackIndex={stackIndex}
            superLikeUsed={isTop ? superLikeUsed : false}
            pendingDecision={isTop ? pendingDecision : null}
            onPendingConsumed={isTop ? onPendingConsumed : undefined}
          />
        );
      })}
    </div>
  );
}
