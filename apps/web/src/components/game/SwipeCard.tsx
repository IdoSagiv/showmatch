'use client';

import { useState } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from 'framer-motion';
import type { TitleCard } from '@/types/game';
import CardOverlay from './CardOverlay';
import StreamingLogos from './StreamingLogos';

interface SwipeCardProps {
  card: TitleCard;
  onSwipe: (decision: 'like' | 'pass' | 'superlike') => void;
  isTop: boolean;
  stackIndex: number;
}

export default function SwipeCard({ card, onSwipe, isTop, stackIndex }: SwipeCardProps) {
  const [flipped, setFlipped] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const scale = 1 - stackIndex * 0.05;
  const yOffset = stackIndex * 8;

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 100 || Math.abs(info.velocity.x) > 500) {
      onSwipe(info.offset.x > 0 ? 'like' : 'pass');
    }
  };

  const handleTap = () => {
    if (isTop) setFlipped(!flipped);
  };

  return (
    <motion.div
      className="absolute w-full"
      style={{
        zIndex: 10 - stackIndex,
        scale,
        y: yOffset,
        opacity: stackIndex > 2 ? 0 : 1 - stackIndex * 0.15,
      }}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale, opacity: 1 - stackIndex * 0.15 }}
    >
      <motion.div
        className="relative cursor-grab active:cursor-grabbing"
        style={{ x: isTop ? x : 0, rotate: isTop ? rotate : 0, perspective: 1000 }}
        drag={isTop ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDragEnd={isTop ? handleDragEnd : undefined}
        onClick={handleTap}
        exit={isTop ? { x: x.get() > 0 ? 500 : -500, opacity: 0, rotate: x.get() > 0 ? 30 : -30 } : undefined}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="relative" style={{ transformStyle: 'preserve-3d' }}>
          {/* Overlay stamps */}
          {isTop && <CardOverlay likeOpacity={likeOpacity} nopeOpacity={nopeOpacity} />}

          {/* Card content */}
          <motion.div
            className="bg-dark-card rounded-2xl overflow-hidden border border-dark-border shadow-2xl"
            style={{ backfaceVisibility: 'hidden' }}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Front face */}
            <div style={{ backfaceVisibility: 'hidden' }}>
              {/* Poster */}
              <div className="relative aspect-[2/3] max-h-[45vh] overflow-hidden">
                {card.posterPath ? (
                  <img
                    src={card.posterPath}
                    alt={card.title}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-full bg-dark-surface flex items-center justify-center text-gray-600">
                    No Poster
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4 space-y-2">
                <h2 className="text-lg font-bold truncate">
                  {card.title} <span className="text-gray-500 font-normal">({card.year})</span>
                </h2>

                {/* Ratings */}
                <div className="flex gap-3 text-sm">
                  <span className="flex items-center gap-1">
                    <span className="text-yellow-400">&#9733;</span>
                    {card.voteAverage.toFixed(1)}
                  </span>
                  {card.rottenTomatoesScore !== null && (
                    <span className="flex items-center gap-1">
                      <span className="text-red-500">&#127813;</span>
                      {card.rottenTomatoesScore}%
                    </span>
                  )}
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-1">
                  {card.genres.slice(0, 3).map(g => (
                    <span key={g} className="px-2 py-0.5 bg-dark-surface rounded-full text-xs text-gray-400">
                      {g}
                    </span>
                  ))}
                  {card.genres.length > 3 && (
                    <span className="px-2 py-0.5 text-xs text-gray-500">+{card.genres.length - 3} more</span>
                  )}
                </div>

                {/* Streaming */}
                {card.providers.length > 0 && <StreamingLogos providers={card.providers} />}

                <p className="text-xs text-gray-600 text-center mt-1">Tap for details</p>
              </div>
            </div>
          </motion.div>

          {/* Back face */}
          <motion.div
            className="absolute inset-0 bg-dark-card rounded-2xl border border-dark-border shadow-2xl overflow-hidden"
            style={{ backfaceVisibility: 'hidden', rotateY: 180 }}
            animate={{ rotateY: flipped ? 360 : 180 }}
            transition={{ duration: 0.4 }}
          >
            <div className="p-5 h-full overflow-y-auto space-y-4">
              <h2 className="text-xl font-bold">{card.title} ({card.year})</h2>

              {/* Ratings */}
              <div className="flex gap-4">
                <div className="bg-dark-surface rounded-lg px-3 py-2 text-center">
                  <div className="text-yellow-400 text-lg font-bold">{card.voteAverage.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">TMDB</div>
                </div>
                {card.rottenTomatoesScore !== null && (
                  <div className="bg-dark-surface rounded-lg px-3 py-2 text-center">
                    <div className="text-red-400 text-lg font-bold">{card.rottenTomatoesScore}%</div>
                    <div className="text-xs text-gray-500">RT</div>
                  </div>
                )}
                {card.runtime && (
                  <div className="bg-dark-surface rounded-lg px-3 py-2 text-center">
                    <div className="text-lg font-bold">{Math.floor(card.runtime / 60)}h {card.runtime % 60}m</div>
                    <div className="text-xs text-gray-500">Runtime</div>
                  </div>
                )}
              </div>

              {card.contentRating && (
                <span className="inline-block px-2 py-1 bg-dark-surface border border-dark-border rounded text-xs font-bold">
                  {card.contentRating}
                </span>
              )}

              <p className="text-sm text-gray-300 leading-relaxed">{card.overview}</p>

              {card.cast.length > 0 && (
                <p className="text-sm">
                  <span className="text-gray-500">Starring: </span>
                  {card.cast.join(', ')}
                </p>
              )}

              {card.director && (
                <p className="text-sm">
                  <span className="text-gray-500">Directed by: </span>
                  {card.director}
                </p>
              )}

              {card.trailerKey && (
                <a
                  href={`https://www.youtube.com/watch?v=${card.trailerKey}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
                  onClick={e => e.stopPropagation()}
                >
                  &#9654; Watch Trailer
                </a>
              )}

              <p className="text-xs text-gray-600 text-center">Tap to flip back</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
