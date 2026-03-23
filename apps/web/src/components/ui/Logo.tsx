'use client';

import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'lg';
}

export default function Logo({ size = 'sm' }: LogoProps) {
  const textSize = size === 'lg' ? 'text-5xl md:text-6xl' : 'text-2xl';

  return (
    <motion.div
      className="flex items-center gap-2"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', duration: 0.5 }}
    >
      <span className={`font-bold ${textSize} tracking-tight`}>
        <span className="text-white">Show</span>
        <span className="text-primary">Match</span>
      </span>
    </motion.div>
  );
}
