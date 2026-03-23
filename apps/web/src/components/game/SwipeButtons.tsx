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
    <div className="flex justify-center mt-4">
      <div className="flex items-center gap-6 bg-dark-card/80 backdrop-blur-md rounded-3xl px-8 py-4 border border-dark-border shadow-xl">

        {/* Pass */}
        <div className="flex flex-col items-center gap-1.5">
          <motion.button
            onClick={onPass}
            disabled={disabled}
            className="w-16 h-16 rounded-full bg-dark-surface border-2 border-accent-red flex items-center justify-center text-accent-red text-2xl font-black disabled:opacity-30 transition-shadow hover:shadow-[0_0_28px_rgba(255,23,68,0.5)]"
            whileTap={{ scale: 0.82 }}
            title="Nope"
          >
            ✕
          </motion.button>
          <span className="text-[10px] text-gray-600 tracking-widest uppercase">Skip</span>
        </div>

        {/* Super Like — centre, slightly smaller */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="relative">
            {!superLikeUsed && !disabled && (
              <span className="absolute inset-0 rounded-full border-2 border-accent-gold animate-ping opacity-50" />
            )}
            <motion.button
              onClick={onSuperLike}
              disabled={disabled || superLikeUsed}
              title="Super Like (once per game)"
              className={`relative w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl transition-shadow ${
                superLikeUsed
                  ? 'bg-dark-surface border-gray-600 text-gray-600 opacity-30'
                  : 'bg-dark-surface border-accent-gold text-accent-gold hover:shadow-[0_0_24px_rgba(255,215,0,0.5)]'
              }`}
              whileTap={{ scale: 0.82 }}
            >
              ★
            </motion.button>
          </div>
          <span className="text-[10px] text-gray-600 tracking-widest uppercase">Super</span>
        </div>

        {/* Like */}
        <div className="flex flex-col items-center gap-1.5">
          <motion.button
            onClick={onLike}
            disabled={disabled}
            className="w-16 h-16 rounded-full bg-dark-surface border-2 border-accent-green flex items-center justify-center text-accent-green text-2xl font-black disabled:opacity-30 transition-shadow hover:shadow-[0_0_28px_rgba(0,200,83,0.5)]"
            whileTap={{ scale: 0.82 }}
            title="Like"
          >
            ♥
          </motion.button>
          <span className="text-[10px] text-gray-600 tracking-widest uppercase">Like</span>
        </div>

      </div>
    </div>
  );
}
