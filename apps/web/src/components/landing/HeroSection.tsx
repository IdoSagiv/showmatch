'use client';

import { motion } from 'framer-motion';
import Logo from '@/components/ui/Logo';

export default function HeroSection() {
  return (
    <div className="text-center mb-8">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      >
        <Logo size="lg" />
      </motion.div>

      {/* Tagline */}
      <motion.p
        className="mt-3 text-base text-gray-500 tracking-[0.15em] uppercase font-medium"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Swipe. Match. Watch.
      </motion.p>
    </div>
  );
}
