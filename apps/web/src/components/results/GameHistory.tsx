'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getGameHistory, clearGameHistory } from '@/lib/history';
import type { GameHistoryEntry } from '@/types/game';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface GameHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GameHistory({ isOpen, onClose }: GameHistoryProps) {
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setHistory(getGameHistory());
    }
  }, [isOpen]);

  const handleClear = () => {
    clearGameHistory();
    setHistory([]);
    setConfirmClear(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Game History">
      {history.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No games played yet</p>
      ) : (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {history.map((entry) => (
            <motion.div
              key={entry.id}
              className="bg-dark-surface rounded-xl p-3 border border-dark-border"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-center gap-3">
                {entry.winner?.posterPath && (
                  <img
                    src={entry.winner.posterPath}
                    alt={entry.winner.title}
                    className="w-10 h-14 rounded object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {entry.winner?.title || 'No winner'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(entry.date).toLocaleDateString()} &middot; {entry.players.join(', ')}
                  </p>
                </div>
              </div>

              {entry.stats.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {entry.stats.map(s => (
                    <span key={s.title} className="text-xs bg-dark-card px-2 py-0.5 rounded">
                      {s.emoji} {s.playerName}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-4 pt-4 border-t border-dark-border">
          {confirmClear ? (
            <div className="flex gap-2 justify-center">
              <Button onClick={handleClear} variant="ghost" size="sm">
                Yes, Clear All
              </Button>
              <Button onClick={() => setConfirmClear(false)} variant="secondary" size="sm">
                Cancel
              </Button>
            </div>
          ) : (
            <Button onClick={() => setConfirmClear(true)} variant="ghost" size="sm" className="w-full">
              Clear History
            </Button>
          )}
        </div>
      )}
    </Modal>
  );
}
