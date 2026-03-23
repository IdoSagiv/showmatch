'use client';

import { motion } from 'framer-motion';
import type { TitleCard } from '@/types/game';

interface SwipeRevealProps {
  reveals: Array<{
    title: TitleCard;
    playerDecisions: Array<{ playerName: string; decision: string }>;
  }>;
}

export default function SwipeReveal({ reveals }: SwipeRevealProps) {
  if (reveals.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-bold mb-3">Who Liked What</h3>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {reveals.slice(0, 20).map(({ title, playerDecisions }, i) => (
          <motion.div
            key={title.tmdbId}
            className="flex items-center gap-3 bg-dark-surface rounded-lg p-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            {title.posterPath && (
              <img src={title.posterPath} alt={title.title} className="w-8 h-12 rounded object-cover" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate" title={title.title}>{title.title}</p>
              <div className="flex gap-1 mt-1 flex-wrap">
                {playerDecisions.map(pd => (
                  <span
                    key={pd.playerName}
                    className="text-xs bg-dark-card px-1.5 py-0.5 rounded"
                    title={`${pd.playerName}: ${pd.decision}`}
                  >
                    {pd.decision === 'like' ? '❤️' : pd.decision === 'superlike' ? '⭐' : '❌'} {pd.playerName.split(' ')[0]}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
