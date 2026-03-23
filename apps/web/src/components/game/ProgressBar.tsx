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
      <div className="h-1.5 bg-dark-border rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 100 }}
        />
      </div>
      {remaining > 0 && (
        <p className="text-right text-xs text-gray-600 mt-0.5">{remaining} left</p>
      )}
    </div>
  );
}
