'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function CreateGameButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleClick = () => {
    if (pending) return;
    setPending(true);
    router.push('/create');
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={pending}
      className="relative w-full rounded-2xl overflow-hidden font-black text-lg text-white py-5 tracking-wide disabled:opacity-80"
      style={{
        background: 'linear-gradient(135deg, #e50914 0%, #ff4b2b 50%, #ff6b35 100%)',
        boxShadow: '0 4px 32px rgba(229,9,20,0.45), 0 1px 0 rgba(255,255,255,0.12) inset',
      }}
      whileTap={{ scale: 0.97 }}
      whileHover={!pending ? { scale: 1.01 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
    >
      {/* Shimmer sweep */}
      {!pending && (
        <motion.div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          <motion.div
            className="absolute inset-y-0 w-1/2"
            style={{ background: 'linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)' }}
            animate={{ x: ['-100%', '300%'] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
          />
        </motion.div>
      )}

      {pending ? (
        <span className="flex items-center justify-center gap-2">
          {[0, 1, 2].map(i => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-white block"
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </span>
      ) : (
        'Create Game'
      )}
    </motion.button>
  );
}
