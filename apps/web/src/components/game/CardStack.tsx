'use client';

import { AnimatePresence } from 'framer-motion';
import type { TitleCard } from '@/types/game';
import SwipeCard from './SwipeCard';

interface CardStackProps {
  cards: TitleCard[];
  currentIndex: number;
  onSwipe: (decision: 'like' | 'pass' | 'superlike') => void;
}

export default function CardStack({ cards, currentIndex, onSwipe }: CardStackProps) {
  if (currentIndex >= cards.length) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-center">
        <div>
          <p className="text-xl font-bold mb-2">All done!</p>
          <p className="text-gray-400">Waiting for others to finish...</p>
        </div>
      </div>
    );
  }

  const visibleCards = cards.slice(currentIndex, currentIndex + 3);

  return (
    <div className="relative w-full max-w-[min(90vw,400px)] mx-auto" style={{ height: 'min(75vh, 600px)' }}>
      <AnimatePresence>
        {visibleCards.map((card, i) => (
          <SwipeCard
            key={card.tmdbId}
            card={card}
            onSwipe={onSwipe}
            isTop={i === 0}
            stackIndex={i}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
