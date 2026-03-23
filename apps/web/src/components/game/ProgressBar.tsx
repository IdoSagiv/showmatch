'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = total > 0 ? Math.min(100, (current / total) * 100) : 0;
  const remaining = Math.max(0, total - current);

  return (
    <div className="w-full">
      <div className="h-2 bg-dark-surface rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-[#ff6b35] rounded-full"
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 100 }}
          style={{ boxShadow: '0 0 8px rgba(229,9,20,0.5)' }}
        />
      </div>
      {remaining > 0 && (
        <p className="text-right text-xs text-gray-500 font-medium mt-0.5">{remaining} left</p>
      )}
    </div>
  );
}
