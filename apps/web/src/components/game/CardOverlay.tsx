'use client';

import { motion, type MotionValue } from 'framer-motion';

interface CardOverlayProps {
  likeOpacity: MotionValue<number>;
  nopeOpacity: MotionValue<number>;
}

export default function CardOverlay({ likeOpacity, nopeOpacity }: CardOverlayProps) {
  return (
    <>
      {/* WANT stamp */}
      <motion.div
        className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
        style={{ opacity: likeOpacity }}
      >
        <div className="border-4 border-accent-green text-accent-green px-8 py-3 rounded-xl text-4xl font-extrabold -rotate-12">
          WANT
        </div>
      </motion.div>

      {/* NOPE stamp */}
      <motion.div
        className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
        style={{ opacity: nopeOpacity }}
      >
        <div className="border-4 border-accent-red text-accent-red px-8 py-3 rounded-xl text-4xl font-extrabold rotate-12">
          NOPE
        </div>
      </motion.div>
    </>
  );
}
