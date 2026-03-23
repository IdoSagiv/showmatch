'use client';

import { motion } from 'framer-motion';

interface SwipeButtonsProps {
  onPass: () => void;
  onLike: () => void;
  onSuperLike: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
  superLikeUsed: boolean;
  disabled: boolean;
}

export default function SwipeButtons({ onPass, onLike, onSuperLike, onUndo, canUndo, superLikeUsed, disabled }: SwipeButtonsProps) {
  return (
    <div className="flex flex-col items-center gap-3 mt-4">
      {/* Super Like — above the main row, centred */}
      <div className="relative">
        {!superLikeUsed && !disabled && (
          <span className="absolute inset-0 rounded-full border-2 border-accent-gold animate-ping opacity-60" />
        )}
        <motion.button
          onClick={onSuperLike}
          disabled={disabled || superLikeUsed}
          title="Super Like (once per game)"
          className={`relative w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl transition-all ${
            superLikeUsed
              ? 'bg-dark-surface border-gray-600 text-gray-600 opacity-40'
              : 'bg-dark-surface border-accent-gold text-accent-gold'
          }`}
          whileTap={{ scale: 0.85 }}
        >
          ★
        </motion.button>
      </div>

      {/* Pass + Like — main action row */}
      <div className="flex items-center gap-6">
        {/* Pass */}
        <motion.button
          onClick={onPass}
          disabled={disabled}
          className="w-16 h-16 rounded-full bg-dark-surface border-2 border-accent-red flex items-center justify-center text-accent-red text-2xl disabled:opacity-30 transition-opacity"
          whileTap={{ scale: 0.85 }}
        >
          ✕
        </motion.button>

        {/* Like */}
        <motion.button
          onClick={onLike}
          disabled={disabled}
          className="w-16 h-16 rounded-full bg-dark-surface border-2 border-accent-green flex items-center justify-center text-accent-green text-2xl disabled:opacity-30 transition-opacity"
          whileTap={{ scale: 0.85 }}
        >
          ♥
        </motion.button>

        {/* Undo — small, to the right */}
        {onUndo !== undefined && (
          <motion.button
            onClick={onUndo}
            disabled={!canUndo}
            className="w-10 h-10 rounded-full bg-dark-surface border border-dark-border flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
            whileTap={{ scale: 0.9 }}
            title="Undo last swipe"
          >
            ↩
          </motion.button>
        )}
      </div>
    </div>
  );
}
