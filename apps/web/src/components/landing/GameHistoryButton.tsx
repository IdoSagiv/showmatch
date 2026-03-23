'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function GameHistoryButton() {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <motion.div
      className="mt-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.7 }}
    >
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
      >
        Game History
      </button>
    </motion.div>
  );
}
