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
  onUndo?: () => void;
  canUndo?: boolean;
}

export default function CardStack({
  cards, currentIndex, onSwipe,
  superLikeUsed = false,
  pendingDecision, onPendingConsumed,
  otherPlayers = [], totalCards,
  onUndo, canUndo = false,
}: CardStackProps) {
  if (currentIndex >= cards.length) {
    const total = totalCards ?? cards.length;
    const connectedOthers = otherPlayers.filter(p => p.connected);
    return (
      <div className="flex items-center justify-center h-full text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="w-full max-w-xs"
        >
          <div className="text-5xl mb-3">🎉</div>
          <p
            className="text-2xl font-black mb-1"
            style={{
              background: 'linear-gradient(135deg, #e50914, #ff6b35)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            All Done!
          </p>
          <p className="text-sm text-gray-500 mb-5">Waiting for your friends…</p>

          {connectedOthers.length > 0 ? (
            <div className="bg-dark-card/80 backdrop-blur-sm border border-dark-border rounded-2xl p-4 space-y-3 text-left">
              {connectedOthers.map(p => {
                const pct = total > 0 ? Math.min(100, Math.round((p.progress / total) * 100)) : 0;
                const done = p.progress >= total;
                return (
                  <div key={p.id}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-200 font-medium">
                        {done ? '✓ ' : ''}{p.displayName}
                      </span>
                      <span className={`text-xs font-semibold ${done ? 'text-accent-green' : 'text-gray-500'}`}>
                        {done ? 'Done!' : `${pct}%`}
                      </span>
                    </div>
                    <div className="h-1.5 bg-dark-surface rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${done ? 'bg-accent-green' : 'bg-gradient-to-r from-primary to-[#ff6b35]'}`}
                        animate={{ width: `${pct}%` }}
                        transition={{ type: 'spring', stiffness: 80 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Calculating results…</p>
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
            onUndo={isTop ? onUndo : undefined}
            canUndo={isTop ? canUndo : false}
          />
        );
      })}
    </div>
  );
}
