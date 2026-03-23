'use client';

import { useState } from 'react';
import { Reorder, motion, useDragControls } from 'framer-motion';
import type { TitleCard } from '@/types/game';
import Button from '@/components/ui/Button';

interface RankingBoardProps {
  titles: TitleCard[];
  onSubmit: (rankings: Array<{ tmdbId: number; rank: number }>) => void;
  submitted: boolean;
}

/** Single draggable row — needs its own component so we can call useDragControls per item. */
function DraggableItem({ item, index }: { item: TitleCard; index: number }) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={dragControls}
    >
      <motion.div
        className="flex items-center gap-3 bg-dark-card rounded-xl p-3 mb-2 border border-dark-border"
        whileDrag={{ scale: 1.02, boxShadow: '0 0 20px rgba(229,9,20,0.3)' }}
        layout
      >
        <span className="text-lg font-bold text-primary w-8 text-center shrink-0">
          {index + 1}
        </span>

        {item.posterPath && (
          <img
            src={item.posterPath}
            alt={item.title}
            className="w-10 h-14 rounded object-cover shrink-0"
          />
        )}

        <div className="flex-1 min-w-0">
          <p className="font-medium truncate" title={item.title}>{item.title}</p>
          <p className="text-xs text-gray-500">{item.year} &middot; &#9733; {item.voteAverage.toFixed(1)}</p>
        </div>

        {/* Drag handle — only this area initiates drag; rest of card is scroll-friendly */}
        <div
          className="shrink-0 flex items-center justify-center w-10 h-10 rounded-lg
                     text-gray-500 active:text-primary
                     cursor-grab active:cursor-grabbing select-none"
          style={{ touchAction: 'none' }}
          onPointerDown={(e) => dragControls.start(e)}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
            <rect x="2" y="3" width="14" height="2" rx="1" />
            <rect x="2" y="8" width="14" height="2" rx="1" />
            <rect x="2" y="13" width="14" height="2" rx="1" />
          </svg>
        </div>
      </motion.div>
    </Reorder.Item>
  );
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
      <div className="text-center">
        <h2 className="text-xl font-bold">
          You agreed on {titles.length} titles! Rank them.
        </h2>
        {!submitted && (
          <p className="text-xs text-gray-500 mt-1">Hold the <span className="text-gray-400">≡</span> handle to drag</p>
        )}
      </div>

      {submitted ? (
        // Locked static list after submission
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={item.tmdbId}
              className="flex items-center gap-3 bg-dark-card rounded-xl p-3 mb-2 border border-dark-border opacity-60"
            >
              <span className="text-lg font-bold text-primary w-8 text-center shrink-0">{index + 1}</span>
              {item.posterPath && (
                <img src={item.posterPath} alt={item.title} className="w-10 h-14 rounded object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate" title={item.title}>{item.title}</p>
                <p className="text-xs text-gray-500">{item.year} &middot; &#9733; {item.voteAverage.toFixed(1)}</p>
              </div>
              <span className="text-green-400 text-lg shrink-0">✓</span>
            </div>
          ))}
        </div>
      ) : (
        <Reorder.Group axis="y" values={items} onReorder={setItems}>
          {items.map((item, index) => (
            <DraggableItem key={item.tmdbId} item={item} index={index} />
          ))}
        </Reorder.Group>
      )}

      <Button
        size="lg"
        onClick={handleSubmit}
        disabled={submitted}
        className="w-full"
      >
        {submitted ? '✓ Rankings Submitted' : 'Submit Rankings'}
      </Button>
    </div>
  );
}
