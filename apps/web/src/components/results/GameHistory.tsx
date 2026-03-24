'use client';

import { useState, useEffect } from 'react';
import {
  motion, AnimatePresence,
  animate, useMotionValue, useTransform,
} from 'framer-motion';
import { getGameHistory, deleteGameFromHistory, clearGameHistory } from '@/lib/history';
import type { GameHistoryEntry } from '@/types/game';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

// ─── Single swipeable row ──────────────────────────────────────────────────

interface RowProps {
  entry: GameHistoryEntry;
  onDelete: (id: string) => void;
}

function DeletableHistoryItem({ entry, onDelete }: RowProps) {
  const x = useMotionValue(0);

  // Red bg + trash icon fade in as the drag distance grows
  const bgOpacity  = useTransform(x, [-50, -10, 0, 10, 50], [1, 0.6, 0, 0.6, 1]);
  const iconScale  = useTransform(x, [-50, -10, 0, 10, 50], [1, 0.8, 0.5, 0.8, 1]);

  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    const far   = Math.abs(info.offset.x) > 80;
    const fast  = Math.abs(info.velocity.x) > 450;
    if (far || fast) {
      const dir = info.offset.x >= 0 ? 1 : -1;
      // Fly card off screen, then remove from list
      animate(x, dir * 600, { type: 'tween', duration: 0.22, ease: 'easeOut' });
      setTimeout(() => onDelete(entry.id), 200);
    } else {
      // Snap back
      animate(x, 0, { type: 'spring', stiffness: 500, damping: 38 });
    }
  };

  return (
    // Height-collapse wrapper — exits by collapsing to 0
    <motion.div
      layout
      initial={false}
      exit={{ height: 0, opacity: 0, marginBottom: 0 }}
      transition={{ duration: 0.22, ease: 'easeInOut' }}
      className="overflow-hidden"
    >
      {/* Red background (revealed as card slides) */}
      <div className="relative rounded-xl overflow-hidden mb-0">
        <motion.div
          className="absolute inset-0 rounded-xl flex items-center justify-center gap-2"
          style={{
            background: '#e50914',
            opacity: bgOpacity,
          }}
        >
          <motion.span style={{ scale: iconScale, fontSize: '1.3rem' }}>🗑️</motion.span>
        </motion.div>

        {/* Draggable card — sits on top of the red layer */}
        <motion.div
          drag="x"
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          style={{ x, touchAction: 'pan-y' }}
          className="relative bg-dark-surface rounded-xl p-3 border border-dark-border cursor-grab active:cursor-grabbing select-none"
        >
          <div className="flex items-center gap-3">
            {entry.winner?.posterPath && (
              <img
                src={entry.winner.posterPath}
                alt={entry.winner.title}
                className="w-10 h-14 rounded object-cover shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate" title={entry.winner?.title || 'No winner'}>
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
      </div>
    </motion.div>
  );
}

// ─── Modal with list ───────────────────────────────────────────────────────

interface GameHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GameHistory({ isOpen, onClose }: GameHistoryProps) {
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    if (isOpen) setHistory(getGameHistory());
  }, [isOpen]);

  const handleDelete = (id: string) => {
    deleteGameFromHistory(id);
    setHistory(prev => prev.filter(e => e.id !== id));
  };

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
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          <p className="text-xs text-gray-600 text-center pb-1">Swipe left or right to delete</p>
          <AnimatePresence mode="popLayout" initial={false}>
            {history.map(entry => (
              <DeletableHistoryItem
                key={entry.id}
                entry={entry}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-4 pt-4 border-t border-dark-border">
          {confirmClear ? (
            <div className="flex gap-2 justify-center">
              <Button onClick={handleClear} variant="ghost" size="sm">Yes, Clear All</Button>
              <Button onClick={() => setConfirmClear(false)} variant="secondary" size="sm">Cancel</Button>
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
