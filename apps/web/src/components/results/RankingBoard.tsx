'use client';

import { useState } from 'react';
import { Reorder, motion } from 'framer-motion';
import type { TitleCard } from '@/types/game';
import Button from '@/components/ui/Button';

interface RankingBoardProps {
  titles: TitleCard[];
  onSubmit: (rankings: Array<{ tmdbId: number; rank: number }>) => void;
  submitted: boolean;
}

export default function RankingBoard({ titles, onSubmit, submitted }: RankingBoardProps) {
  const [items, setItems] = useState(titles);

  const handleSubmit = () => {
    const rankings = items.map((item, i) => ({
      tmdbId: item.tmdbId,
      rank: i + 1,
    }));
    onSubmit(rankings);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-center">
        You agreed on {titles.length} titles! Rank them.
      </h2>

      <Reorder.Group axis="y" values={items} onReorder={setItems}>
        {items.map((item, index) => (
          <Reorder.Item key={item.tmdbId} value={item}>
            <motion.div
              className="flex items-center gap-3 bg-dark-card rounded-xl p-3 mb-2 border border-dark-border cursor-grab active:cursor-grabbing"
              whileDrag={{ scale: 1.02, boxShadow: '0 0 20px rgba(229,9,20,0.3)' }}
              layout
            >
              <span className="text-lg font-bold text-primary w-8 text-center">{index + 1}</span>
              {item.posterPath && (
                <img src={item.posterPath} alt={item.title} className="w-10 h-14 rounded object-cover" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.title}</p>
                <p className="text-xs text-gray-500">{item.year} &middot; &#9733; {item.voteAverage.toFixed(1)}</p>
              </div>
              <div className="text-gray-600 text-xl cursor-grab">&#9776;</div>
            </motion.div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      <Button
        size="lg"
        onClick={handleSubmit}
        disabled={submitted}
        className="w-full"
      >
        {submitted ? 'Rankings Submitted!' : 'Submit Rankings'}
      </Button>
    </div>
  );
}
