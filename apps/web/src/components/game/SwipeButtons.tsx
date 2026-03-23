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
        className="w-14 h-14 rounded-full bg-dark-surface border-2 border-accent-red flex items-center justify-center text-accent-red text-2xl disabled:opacity-30"
        whileTap={{ scale: 0.9 }}
      >
        &#10005;
      </motion.button>

      {/* Super Like */}
      <motion.button
        onClick={onSuperLike}
        disabled={disabled || superLikeUsed}
        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl ${
          superLikeUsed
            ? 'bg-dark-surface border-gray-600 text-gray-600'
            : 'bg-dark-surface border-accent-gold text-accent-gold'
        } disabled:opacity-30`}
        whileTap={{ scale: 0.9 }}
        animate={superLikeUsed ? {} : { boxShadow: ['0 0 0px #ffd700', '0 0 15px #ffd700', '0 0 0px #ffd700'] }}
        transition={superLikeUsed ? {} : { repeat: Infinity, duration: 2 }}
      >
        &#9733;
      </motion.button>

      {/* Like */}
      <motion.button
        onClick={onLike}
        disabled={disabled}
        className="w-14 h-14 rounded-full bg-dark-surface border-2 border-accent-green flex items-center justify-center text-accent-green text-2xl disabled:opacity-30"
        whileTap={{ scale: 0.9 }}
      >
        &#9829;
      </motion.button>
    </div>
  );
}
