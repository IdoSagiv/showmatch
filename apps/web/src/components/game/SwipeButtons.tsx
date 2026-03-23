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
    <div className="flex justify-center mt-3">
      <div className="flex items-center gap-7 glass-card rounded-[2rem] px-8 py-4 shadow-card">

        {/* Pass */}
        <motion.button
          onClick={onPass}
          disabled={disabled}
          className="w-[62px] h-[62px] rounded-full bg-dark-surface border-2 border-accent-red flex items-center justify-center text-accent-red text-[1.6rem] font-black disabled:opacity-30 transition-shadow hover:shadow-[0_0_32px_rgba(255,23,68,0.55)]"
          whileTap={{ scale: 0.80 }}
          whileHover={{ scale: 1.06 }}
          title="Nope"
        >
          ✕
        </motion.button>

        {/* Super Like — centre, slightly smaller */}
        <div className="relative">
          {!superLikeUsed && !disabled && (
            <span className="absolute inset-0 rounded-full border-2 border-accent-gold animate-ping opacity-40" />
          )}
          <motion.button
            onClick={onSuperLike}
            disabled={disabled || superLikeUsed}
            title="Super Like (once per game)"
            className={`relative w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl transition-shadow ${
              superLikeUsed
                ? 'bg-dark-surface border-gray-700 text-gray-700 opacity-25'
                : 'bg-dark-surface border-accent-gold text-accent-gold hover:shadow-[0_0_28px_rgba(255,215,0,0.55)]'
            }`}
            whileTap={{ scale: 0.80 }}
            whileHover={superLikeUsed ? {} : { scale: 1.06 }}
          >
            ★
          </motion.button>
        </div>

        {/* Like */}
        <motion.button
          onClick={onLike}
          disabled={disabled}
          className="w-[62px] h-[62px] rounded-full bg-dark-surface border-2 border-accent-green flex items-center justify-center text-accent-green text-[1.6rem] font-black disabled:opacity-30 transition-shadow hover:shadow-[0_0_32px_rgba(0,200,83,0.55)]"
          whileTap={{ scale: 0.80 }}
          whileHover={{ scale: 1.06 }}
          title="Like"
        >
          ♥
        </motion.button>

      </div>
    </div>
  );
}
