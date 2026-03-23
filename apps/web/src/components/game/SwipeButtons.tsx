'use client';

import { motion } from 'framer-motion';

interface SwipeButtonsProps {
  onPass: () => void;
  onLike: () => void;
  onSuperLike: () => void;
  superLikeUsed: boolean;
  disabled: boolean;
}

export default function SwipeButtons({ onPass, onLike, onSuperLike, superLikeUsed, disabled }: SwipeButtonsProps) {
  return (
    <div className="flex items-center justify-center gap-6 mt-4">
      {/* Pass */}
      <motion.button
        onClick={onPass}
        disabled={disabled}
        className="w-16 h-16 rounded-full bg-dark-surface border-2 border-accent-red flex items-center justify-center text-accent-red text-2xl disabled:opacity-30 transition-opacity"
        whileTap={{ scale: 0.85 }}
        title="Nope"
      >
        ✕
      </motion.button>

      {/* Super Like — centre, slightly smaller */}
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

      {/* Like */}
      <motion.button
        onClick={onLike}
        disabled={disabled}
        className="w-16 h-16 rounded-full bg-dark-surface border-2 border-accent-green flex items-center justify-center text-accent-green text-2xl disabled:opacity-30 transition-opacity"
        whileTap={{ scale: 0.85 }}
        title="Like"
      >
        ♥
      </motion.button>
    </div>
  );
}
