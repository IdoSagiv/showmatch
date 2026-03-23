'use client';

import { motion } from 'framer-motion';
import type { GameStatAward } from '@/types/game';

interface GameStatsProps {
  stats: GameStatAward[];
}

export default function GameStats({ stats }: GameStatsProps) {
  if (stats.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-bold mb-3">Awards</h3>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            className="bg-dark-card rounded-xl p-3 border border-dark-border text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.15 }}
          >
            <div className="text-3xl mb-1">{stat.emoji}</div>
            <div className="text-sm font-bold">{stat.title}</div>
            <div className="text-xs text-primary mt-1">{stat.playerName}</div>
            <div className="text-xs text-gray-500">{stat.value}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
