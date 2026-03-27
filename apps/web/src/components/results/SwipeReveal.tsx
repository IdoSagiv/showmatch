'use client';

import { motion } from 'framer-motion';
import type { TitleCard } from '@/types/game';

interface SwipeRevealProps {
  reveals: Array<{
    title: TitleCard;
    playerDecisions: Array<{ playerName: string; decision: string }>;
  }>;
}

function decisionScore(d: string): number {
  if (d === 'superlike') return 2;
  if (d === 'like') return 1;
  return 0;
}

export default function SwipeReveal({ reveals }: SwipeRevealProps) {
  if (reveals.length === 0) return null;

  // Only show titles that at least one player liked or superliked
  const liked = reveals.filter(({ playerDecisions }) =>
    playerDecisions.some(pd => pd.decision === 'like' || pd.decision === 'superlike')
  );

  if (liked.length === 0) return null;

  // Sort by total score descending (superlike=2, like=1)
  const sorted = [...liked].sort((a, b) => {
    const scoreA = a.playerDecisions.reduce((sum, pd) => sum + decisionScore(pd.decision), 0);
    const scoreB = b.playerDecisions.reduce((sum, pd) => sum + decisionScore(pd.decision), 0);
    return scoreB - scoreA;
  });

  return (
    <div>
      <h3 className="text-lg font-bold mb-3">Who Liked What</h3>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {sorted.map(({ title, playerDecisions }, i) => {
          // Only show players who liked or superliked
          const likers = playerDecisions.filter(pd => pd.decision !== 'pass');
          return (
            <motion.div
              key={title.tmdbId}
              className="flex items-center gap-3 bg-dark-surface rounded-lg p-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              {title.posterPath && (
                <img src={title.posterPath} alt={title.title} className="w-8 h-12 rounded object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate" title={title.title}>{title.title}</p>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {likers.map(pd => (
                    <span
                      key={pd.playerName}
                      className={`text-xs px-1.5 py-0.5 rounded ${
                        pd.decision === 'superlike'
                          ? 'bg-yellow-900/40 text-yellow-300'
                          : 'bg-dark-card text-gray-300'
                      }`}
                      title={`${pd.playerName}: ${pd.decision}`}
                    >
                      {pd.decision === 'superlike' ? '⭐' : '❤️'} {pd.playerName.split(' ')[0]}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
