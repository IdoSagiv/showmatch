'use client';

import { motion } from 'framer-motion';

interface SwipeButtonsProps {
  onPass: () => void;
  onLike: () => void;
  onSuperLike: () => void;
  superLikeUsed: boolean;
  disabled: boolean;
  /** Which direction the card is currently being dragged toward */
  dragDirection?: 'like' | 'pass' | 'superlike' | null;
}

export default function SwipeButtons({
  onPass, onLike, onSuperLike,
  superLikeUsed, disabled,
  dragDirection = null,
}: SwipeButtonsProps) {
  const passActive   = dragDirection === 'pass';
  const likeActive   = dragDirection === 'like';
  const superActive  = dragDirection === 'superlike';

  return (
    <div className="flex justify-center mt-3">
      <div className="flex items-center gap-7 glass-card rounded-[2rem] px-8 py-4 shadow-card">

        {/* Pass ✕ */}
        <div className="flex flex-col items-center gap-1">
        <motion.button
          onClick={onPass}
          disabled={disabled}
          animate={{
            backgroundColor: passActive ? 'rgba(255,23,68,1)' : 'rgba(15,14,31,0)',
            borderColor: passActive ? 'rgba(255,23,68,1)' : 'rgba(255,23,68,0.8)',
            scale: passActive ? 1.15 : 1,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          className="w-[62px] h-[62px] rounded-full border-2 flex items-center justify-center text-[1.6rem] font-black disabled:opacity-30"
          style={{ color: passActive ? '#fff' : '#ff1744', boxShadow: passActive ? '0 0 32px rgba(255,23,68,0.7)' : undefined }}
          whileTap={{ scale: 0.80 }}
          title="Nope"
        >
          ✕
        </motion.button>
        <kbd className="hidden md:block text-[10px] text-gray-600 bg-dark-border/40 px-1.5 py-0.5 rounded font-mono">←</kbd>
        </div>

        {/* Super Like ★ */}
        <div className="flex flex-col items-center gap-1">
        <div className="relative">
          {!superLikeUsed && !disabled && !superActive && (
            <span className="absolute inset-0 rounded-full border-2 border-accent-gold animate-ping opacity-40" />
          )}
          <motion.button
            onClick={onSuperLike}
            disabled={disabled || superLikeUsed}
            animate={{
              backgroundColor: superActive ? 'rgba(255,215,0,1)' : 'rgba(15,14,31,0)',
              borderColor: superLikeUsed ? 'rgba(107,107,107,0.4)' : superActive ? 'rgba(255,215,0,1)' : 'rgba(255,215,0,0.9)',
              scale: superActive ? 1.18 : 1,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            className="relative w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl"
            style={{
              color: superLikeUsed ? 'rgba(107,107,107,0.4)' : superActive ? '#000' : '#ffd700',
              opacity: superLikeUsed ? 0.25 : 1,
              boxShadow: superActive ? '0 0 28px rgba(255,215,0,0.8)' : undefined,
            }}
            whileTap={{ scale: 0.80 }}
            title="Super Like (once per game)"
          >
            ★
          </motion.button>
        </div>
        <kbd className="hidden md:block text-[10px] text-gray-600 bg-dark-border/40 px-1.5 py-0.5 rounded font-mono">↑</kbd>
        </div>

        {/* Like ♥ */}
        <div className="flex flex-col items-center gap-1">
        <motion.button
          onClick={onLike}
          disabled={disabled}
          animate={{
            backgroundColor: likeActive ? 'rgba(0,200,83,1)' : 'rgba(15,14,31,0)',
            borderColor: likeActive ? 'rgba(0,200,83,1)' : 'rgba(0,200,83,0.8)',
            scale: likeActive ? 1.15 : 1,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          className="w-[62px] h-[62px] rounded-full border-2 flex items-center justify-center text-[1.6rem] font-black disabled:opacity-30"
          style={{ color: likeActive ? '#fff' : '#00c853', boxShadow: likeActive ? '0 0 32px rgba(0,200,83,0.7)' : undefined }}
          whileTap={{ scale: 0.80 }}
          title="Like"
        >
          ♥
        </motion.button>
        <kbd className="hidden md:block text-[10px] text-gray-600 bg-dark-border/40 px-1.5 py-0.5 rounded font-mono">→</kbd>
        </div>

      </div>
    </div>
  );
}
