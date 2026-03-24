'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import GameHistory from '@/components/results/GameHistory';

export default function GameHistoryButton() {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <>
      <motion.div
        className="mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <button
          onClick={() => setShowHistory(true)}
          className="text-gray-400 hover:text-white text-sm transition-colors"
        >
          Game History
        </button>
      </motion.div>

      <GameHistory isOpen={showHistory} onClose={() => setShowHistory(false)} />
    </>
  );
}
