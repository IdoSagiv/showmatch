'use client';

import { useState } from 'react';
import GameHistory from '@/components/results/GameHistory';

export default function GameHistoryButton() {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowHistory(true)}
        className="text-gray-400 hover:text-white text-sm transition-colors"
      >
        Game History
      </button>

      <GameHistory isOpen={showHistory} onClose={() => setShowHistory(false)} />
    </>
  );
}
