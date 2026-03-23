'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
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
  /** Whether this player has already used their one superlike this game */
  superLikeUsed?: boolean;
  /** Programmatic trigger from buttons: set to fire an exit animation */
  pendingDecision?: 'like' | 'pass' | 'superlike' | null;
  onPendingConsumed?: () => void;
  /** Undo last swipe — shown as a small button on the card */
  onUndo?: () => void;
  canUndo?: boolean;
}

export default function SwipeCard({
  card, onSwipe, isTop, stackIndex,
  superLikeUsed = false,
  pendingDecision, onPendingConsumed,
  onUndo, canUndo = false,
}: SwipeCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [exiting, setExiting] = useState(false);
  const backScrollRef = useRef<HTMLDivElement>(null);

  // Reset scroll position when card is un-flipped
  useEffect(() => {
    if (!flipped && backScrollRef.current) {
      backScrollRef.current.scrollTop = 0;
    }
  }, [flipped]);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-250, 0, 250], [-18, 0, 18]);
  const likeOpacity       = useTransform(x, [20, 120], [0, 1]);
  const nopeOpacity       = useTransform(x, [-120, -20], [1, 0]);
  const superLikeOpacity  = useTransform(y, [-120, -20], [1, 0]);
  const decisionRef = useRef<'like' | 'pass' | 'superlike'>('pass');

  const scale = 1 - stackIndex * 0.05;
  const yOffset = stackIndex * 10;

  // Fly the card off screen, then notify parent
  const flyOut = useCallback((decision: 'like' | 'pass' | 'superlike') => {
    if (exiting) return;
    setExiting(true);
    decisionRef.current = decision;

    const targetX = decision === 'pass' ? -700 : decision === 'like' ? 700 : 0;
    const targetY = decision === 'superlike' ? -700 : 0;
    const targetRotate = decision === 'pass' ? -25 : decision === 'like' ? 25 : 0;

    Promise.all([
      animate(x, targetX, { duration: 0.35, ease: [0.4, 0, 0.2, 1] }),
      animate(y, targetY, { duration: 0.35, ease: [0.4, 0, 0.2, 1] }),
      animate(rotate as any, targetRotate, { duration: 0.35 }),
    ]).then(() => {
      onSwipe(decision);
    });
  }, [exiting, x, y, rotate, onSwipe]);

  // Button-triggered swipe (pendingDecision from parent)
  const pendingRef = useRef<typeof pendingDecision>(null);
  if (isTop && pendingDecision && pendingDecision !== pendingRef.current && !exiting) {
    pendingRef.current = pendingDecision;
    setTimeout(() => {
      flyOut(pendingDecision);
      onPendingConsumed?.();
    }, 0);
  }

  const handleDragEnd = (_: any, info: PanInfo) => {
    const swipedUp = (info.offset.y < -80 || info.velocity.y < -500) &&
                     Math.abs(info.offset.x) < Math.abs(info.offset.y);
    if (swipedUp && !superLikeUsed) {
      flyOut('superlike');
      return;
    }
    const swipedH = Math.abs(info.offset.x) > 100 || Math.abs(info.velocity.x) > 600;
    if (swipedH) {
      flyOut(info.offset.x > 0 ? 'like' : 'pass');
    } else {
      // Snap back smoothly
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 });
      animate(y, 0, { type: 'spring', stiffness: 400, damping: 30 });
    }
  };

  const handleTap = () => {
    if (isTop && !exiting) setFlipped(f => !f);
  };

  return (
    <motion.div
      className="absolute w-full h-full"
      style={{ zIndex: 10 - stackIndex }}
      initial={{ scale: scale * 0.95, opacity: 0, y: yOffset + 10 }}
      animate={{ scale, opacity: 1 - stackIndex * 0.1, y: yOffset }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
    >
      <motion.div
        className="relative cursor-grab active:cursor-grabbing select-none h-full"
        style={{ x, y, rotate, touchAction: flipped ? 'pan-y' : 'none' }}
        drag={isTop && !exiting ? (flipped ? 'x' : true) : false}
        dragElastic={0.8}
        onDragEnd={isTop ? handleDragEnd : undefined}
        onClick={handleTap}
      >
        {/* Overlay stamps */}
        {isTop && (
          <CardOverlay
            likeOpacity={likeOpacity}
            nopeOpacity={nopeOpacity}
            superLikeOpacity={superLikeUsed ? undefined : superLikeOpacity}
          />
        )}

        {/* Card faces wrapper (3D perspective) */}
        <div className="h-full" style={{ perspective: 1200 }}>
          {/* Front face — fills the card container via h-full, flex-col splits
              the poster from the info strip */}
          <motion.div
            className="bg-dark-card rounded-2xl overflow-hidden border border-dark-border shadow-2xl h-full flex flex-col"
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            style={{ backfaceVisibility: 'hidden', transformStyle: 'preserve-3d' }}
          >
            {/* Poster — flex-1 fills remaining height */}
            <div className="relative bg-dark-surface w-full flex-1 min-h-0 overflow-hidden">
              {card.posterPath ? (
                <>
                  {/* Blurred background fill */}
                  <img
                    src={card.posterPath}
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-25"
                    draggable={false}
                  />
                  {/* Crisp poster */}
                  <img
                    src={card.posterPath}
                    alt={card.title}
                    className="relative w-full h-full object-contain object-center"
                    draggable={false}
                  />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">No Poster</div>
              )}

              {/* Undo button — top-left, only on top card when there's something to undo */}
              {isTop && onUndo && (
                <button
                  onClick={e => { e.stopPropagation(); onUndo(); }}
                  disabled={!canUndo}
                  className="absolute top-2 left-2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/70 disabled:opacity-20 transition-opacity"
                  title="Undo last swipe"
                >
                  ↩
                </button>
              )}

              {/* Info icon — top-right, tap-for-details hint */}
              <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/70 text-sm select-none pointer-events-none">
                ⓘ
              </span>

              {/* Media type badge — bottom-right */}
              <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-0.5 rounded-full">
                {card.mediaType === 'movie' ? '🎬 Film' : '📺 Series'}
              </span>
            </div>

            {/* Info strip — fixed height, never shrinks or grows */}
            <div className="p-4 space-y-2 shrink-0">
              <h2 className="text-lg font-bold truncate" title={card.title}>
                {card.title} <span className="text-gray-500 font-normal text-base">({card.year})</span>
              </h2>

              <div className="flex gap-3 text-sm items-center flex-wrap">
                {card.voteAverage > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span className="bg-[#F5C518] text-black text-[10px] font-extrabold px-1.5 py-0.5 rounded leading-none">IMDb</span>
                    <span>{card.voteAverage.toFixed(1)}</span>
                  </span>
                )}
                {card.rottenTomatoesScore !== null ? (
                  <span className="flex items-center gap-1">
                    <span>🍅</span>
                    <span>{card.rottenTomatoesScore}%</span>
                  </span>
                ) : card.metacriticScore !== null ? (
                  <span className="flex items-center gap-1.5">
                    <span className="bg-[#FFCC34] text-black text-[10px] font-extrabold px-1.5 py-0.5 rounded leading-none">MC</span>
                    <span>{card.metacriticScore}</span>
                  </span>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-1">
                {card.genres.map(g => (
                  <span key={g} className="px-2 py-0.5 bg-dark-surface rounded-full text-xs text-gray-400">{g}</span>
                ))}
              </div>

              {card.providers.length > 0 && <StreamingLogos providers={card.providers} searchTitle={card.title} />}
            </div>
          </motion.div>

          {/* Back face */}
          <motion.div
            className="absolute inset-0 bg-dark-card rounded-2xl border border-dark-border shadow-2xl overflow-hidden"
            animate={{ rotateY: flipped ? 360 : 180 }}
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            style={{ backfaceVisibility: 'hidden', transformStyle: 'preserve-3d' }}
          >
            <div ref={backScrollRef} className="p-5 h-full overflow-y-auto space-y-4">
              <h2 className="text-xl font-bold leading-tight">{card.title} <span className="text-gray-500 font-normal text-base">({card.year})</span></h2>

              <div className="flex gap-3 flex-wrap">
                <div className="bg-dark-surface rounded-lg px-3 py-2 text-center min-w-[56px]">
                  <div className="text-yellow-400 text-lg font-bold">{card.voteAverage.toFixed(1)}</div>
                  <div className="mt-0.5"><span className="bg-[#F5C518] text-black text-[9px] font-extrabold px-1 py-0.5 rounded leading-none">IMDb</span></div>
                </div>
                {card.rottenTomatoesScore !== null && (
                  <div className="bg-dark-surface rounded-lg px-3 py-2 text-center min-w-[56px]">
                    <div className="text-red-400 text-lg font-bold">{card.rottenTomatoesScore}%</div>
                    <div className="text-xs text-gray-500">RT</div>
                  </div>
                )}
                {card.rottenTomatoesScore === null && card.metacriticScore !== null && (
                  <div className="bg-dark-surface rounded-lg px-3 py-2 text-center min-w-[56px]">
                    <div className="text-yellow-400 text-lg font-bold">{card.metacriticScore}</div>
                    <div className="text-xs text-gray-500">MC</div>
                  </div>
                )}
                {card.runtime && (
                  <div className="bg-dark-surface rounded-lg px-3 py-2 text-center min-w-[56px]">
                    <div className="text-lg font-bold">
                      {card.runtime >= 60
                        ? `${Math.floor(card.runtime / 60)}h ${card.runtime % 60}m`
                        : `${card.runtime}m`}
                    </div>
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
                <p className="text-sm"><span className="text-gray-500">Starring: </span>{card.cast.join(', ')}</p>
              )}
              {card.director && (
                <p className="text-sm"><span className="text-gray-500">Directed by: </span>{card.director}</p>
              )}

              {card.trailerKey && (
                <a
                  href={`https://www.youtube.com/watch?v=${card.trailerKey}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
                  onClick={e => e.stopPropagation()}
                >
                  ▶ Watch Trailer
                </a>
              )}

              <p className="text-xs text-gray-600 text-center pb-2">Tap to flip back ↕</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
