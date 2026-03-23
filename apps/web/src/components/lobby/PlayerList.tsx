'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { Player } from '@/types/game';
import PlayerAvatar from './PlayerAvatar';

interface PlayerListProps {
  players: Player[];
}

export default function PlayerList({ players }: PlayerListProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-400">
        Players ({players.length})
      </h3>
      <AnimatePresence mode="popLayout">
        {players.map(player => (
          <motion.div
            key={player.id}
            className="flex items-center gap-3 bg-dark-surface rounded-xl px-4 py-3"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            layout
          >
            <PlayerAvatar name={player.displayName} connected={player.connected} />
            <span className="font-medium flex-1 truncate">{player.displayName}</span>
            {player.isCreator && <span className="text-accent-gold text-sm" title="Room creator">👑</span>}
            <span className={`w-2 h-2 rounded-full ${player.connected ? 'bg-accent-green' : 'bg-gray-600'}`} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
