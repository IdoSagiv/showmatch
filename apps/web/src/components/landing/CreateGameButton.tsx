'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function CreateGameButton() {
  const router = useRouter();

  return (
    <motion.button
      onClick={() => router.push('/create')}
      className="relative w-full rounded-2xl overflow-hidden font-black text-lg text-white py-5 tracking-wide"
      style={{
        background: 'linear-gradient(135deg, #e50914 0%, #ff4b2b 50%, #ff6b35 100%)',
        boxShadow: '0 4px 32px rgba(229,9,20,0.45), 0 1px 0 rgba(255,255,255,0.12) inset',
      }}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
    >
      {/* Shimmer sweep */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
          backgroundSize: '200% 100%',
        }}
        animate={{ backgroundPosition: ['200% 0', '-100% 0'] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
      />
      Create Game
    </motion.button>
  );
}
