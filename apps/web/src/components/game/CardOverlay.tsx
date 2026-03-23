'use client';

import { motion, type MotionValue, useTransform } from 'framer-motion';

interface CardOverlayProps {
  likeOpacity: MotionValue<number>;
  nopeOpacity: MotionValue<number>;
  superLikeOpacity?: MotionValue<number>;
  x: MotionValue<number>;
  y: MotionValue<number>;
}

export default function CardOverlay({ likeOpacity, nopeOpacity, superLikeOpacity, x, y }: CardOverlayProps) {
  // Subtle color wash that grows as the card is dragged
  const greenWash  = useTransform(x, [0,   180], [0, 0.22]);
  const redWash    = useTransform(x, [-180, 0],  [0.22, 0]);
  const goldWash   = useTransform(y, [-180, 0],  [0.22, 0]);

  return (
    <>
      {/* Green background wash — like */}
      <motion.div
        className="absolute inset-0 z-10 rounded-2xl pointer-events-none"
        style={{ opacity: greenWash, background: 'rgba(0, 200, 83, 1)' }}
      />
      {/* Red background wash — nope */}
      <motion.div
        className="absolute inset-0 z-10 rounded-2xl pointer-events-none"
        style={{ opacity: redWash, background: 'rgba(255, 23, 68, 1)' }}
      />
      {/* Gold background wash — superlike */}
      {superLikeOpacity && (
        <motion.div
          className="absolute inset-0 z-10 rounded-2xl pointer-events-none"
          style={{ opacity: goldWash, background: 'rgba(255, 215, 0, 1)' }}
        />
      )}

      {/* ❤️ LIKE stamp — top right, tilted left */}
      <motion.div
        className="absolute top-5 right-4 z-20 pointer-events-none"
        style={{ opacity: likeOpacity }}
      >
        <div
          className="flex items-center gap-1.5 border-[3px] border-accent-green text-accent-green px-3 py-1.5 rounded-xl font-extrabold tracking-widest"
          style={{ transform: 'rotate(-15deg)', textShadow: '0 0 20px rgba(0,200,83,0.8)', boxShadow: '0 0 20px rgba(0,200,83,0.4)' }}
        >
          <span className="text-2xl">❤️</span>
          <span className="text-xl uppercase">LIKE</span>
        </div>
      </motion.div>

      {/* ✕ NOPE stamp — top left, tilted right */}
      <motion.div
        className="absolute top-5 left-4 z-20 pointer-events-none"
        style={{ opacity: nopeOpacity }}
      >
        <div
          className="flex items-center gap-1.5 border-[3px] border-accent-red text-accent-red px-3 py-1.5 rounded-xl font-extrabold tracking-widest"
          style={{ transform: 'rotate(15deg)', textShadow: '0 0 20px rgba(255,23,68,0.8)', boxShadow: '0 0 20px rgba(255,23,68,0.4)' }}
        >
          <span className="text-xl font-black">✕</span>
          <span className="text-xl uppercase">NOPE</span>
        </div>
      </motion.div>

      {/* ⭐ SUPER LIKE stamp — top center, no tilt */}
      {superLikeOpacity && (
        <motion.div
          className="absolute top-5 inset-x-0 z-20 flex justify-center pointer-events-none"
          style={{ opacity: superLikeOpacity }}
        >
          <div
            className="flex items-center gap-1.5 border-[3px] border-accent-gold text-accent-gold px-3 py-1.5 rounded-xl font-extrabold tracking-widest"
            style={{ textShadow: '0 0 20px rgba(255,215,0,0.8)', boxShadow: '0 0 20px rgba(255,215,0,0.4)' }}
          >
            <span className="text-2xl">⭐</span>
            <span className="text-xl uppercase">SUPER</span>
          </div>
        </motion.div>
      )}
    </>
  );
}
