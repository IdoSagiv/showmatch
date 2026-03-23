'use client';

import { motion } from 'framer-motion';
import type { TitleCard } from '@/types/game';
import type { Player } from '@/types/game';
import SwipeCard from './SwipeCard';

interface CardStackProps {
  cards: TitleCard[];
  currentIndex: number;
  onSwipe: (decision: 'like' | 'pass' | 'superlike') => void;
  superLikeUsed?: boolean;
  pendingDecision?: 'like' | 'pass' | 'superlike' | null;
  onPendingConsumed?: () => void;
  /** Other players — shown in the "All done" waiting state */
  otherPlayers?: Player[];
  totalCards?: number;
}

export default function CardStack({
  cards, currentIndex, onSwipe,
  superLikeUsed = false,
  pendingDecision, onPendingConsumed,
  otherPlayers = [], totalCards,
}: CardStackProps) {
  if (currentIndex >= cards.length) {
    const total = totalCards ?? cards.length;
    return (
      <div className="flex items-center justify-center h-full text-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <p className="text-2xl font-bold">✅ All done!</p>
          {otherPlayers.length > 0 ? (
            <div className="space-y-3">
              {otherPlayers.filter(p => p.connected).map(p => {
                const pct = total > 0 ? Math.min(100, Math.round((p.progress / total) * 100)) : 0;
                const done = p.progress >= total;
                return (
                  <div key={p.id} className="text-left">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{p.displayName}</span>
                      <span className={done ? 'text-accent-green font-medium' : 'text-gray-500'}>
                        {done ? '✓ Done' : `${pct}%`}
                      </span>
                    </div>
                    <div className="h-1.5 bg-dark-border rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${done ? 'bg-accent-green' : 'bg-primary'}`}
                        animate={{ width: `${pct}%` }}
                        transition={{ type: 'spring', stiffness: 80 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400">Waiting for others to finish…</p>
          )}
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
