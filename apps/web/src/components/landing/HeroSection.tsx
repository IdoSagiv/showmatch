'use client';

import { motion } from 'framer-motion';
import Logo from '@/components/ui/Logo';

export default function HeroSection() {
  return (
    <div className="text-center mb-10">
      <Logo size="lg" />
      <motion.p
        className="mt-3 text-xl text-gray-400 tracking-wide"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Swipe. Match. Watch.
      </motion.p>
    </div>
  );
}
