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
  const greenWash = useTransform(x, [0,    180], [0, 0.22]);
  const redWash   = useTransform(x, [-180,   0], [0.22, 0]);
  const goldWash  = useTransform(y, [-180,   0], [0.22, 0]);

  const stampBase: React.CSSProperties = {
    fontWeight: 900,
    letterSpacing: '0.15em',
    fontSize: '1.25rem',
    textTransform: 'uppercase',
    border: '3px solid',
    borderRadius: '0.75rem',
    padding: '0.375rem 0.875rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
  };

  return (
    <>
      {/* Color washes */}
      <motion.div className="absolute inset-0 z-10 rounded-3xl pointer-events-none"
        style={{ opacity: greenWash, background: 'rgba(0,200,83,1)' }} />
      <motion.div className="absolute inset-0 z-10 rounded-3xl pointer-events-none"
        style={{ opacity: redWash, background: 'rgba(255,23,68,1)' }} />
      {superLikeOpacity && (
        <motion.div className="absolute inset-0 z-10 rounded-3xl pointer-events-none"
          style={{ opacity: goldWash, background: 'rgba(255,215,0,1)' }} />
      )}

      {/* ❤️ LIKE — centered */}
      <motion.div
        className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
        style={{ opacity: likeOpacity }}
      >
        <div style={{
          ...stampBase,
          transform: 'rotate(-12deg)',
          borderColor: '#00c853',
          color: '#00c853',
          textShadow: '0 0 20px rgba(0,200,83,0.9)',
          boxShadow: '0 0 24px rgba(0,200,83,0.5)',
        }}>
          <span style={{ fontSize: '1.5rem' }}>❤️</span> LIKE
        </div>
      </motion.div>

      {/* ✕ NOPE — centered */}
      <motion.div
        className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
        style={{ opacity: nopeOpacity }}
      >
        <div style={{
          ...stampBase,
          transform: 'rotate(12deg)',
          borderColor: '#ff1744',
          color: '#ff1744',
          textShadow: '0 0 20px rgba(255,23,68,0.9)',
          boxShadow: '0 0 24px rgba(255,23,68,0.5)',
        }}>
          <span style={{ fontSize: '1.3rem', fontWeight: 900 }}>✕</span> NOPE
        </div>
      </motion.div>

      {/* ⭐ SUPER LIKE — centered */}
      {superLikeOpacity && (
        <motion.div
          className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
          style={{ opacity: superLikeOpacity }}
        >
          <div style={{
            ...stampBase,
            borderColor: '#ffd700',
            color: '#ffd700',
            textShadow: '0 0 20px rgba(255,215,0,0.9)',
            boxShadow: '0 0 24px rgba(255,215,0,0.5)',
          }}>
            <span style={{ fontSize: '1.5rem' }}>⭐</span> SUPER
          </div>
        </motion.div>
      )}
    </>
  );
}
