'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  animate,
  type PanInfo,
} from 'framer-motion';
import type { TitleCard } from '@/types/game';
import CardOverlay from './CardOverlay';
import StreamingLogos from './StreamingLogos';

/** "16" → "16+"  |  "PG-13" → "PG-13"  |  "R" → "R" */
function formatContentRating(rating: string): string {
  return /^\d+$/.test(rating) ? `${rating}+` : rating;
}

interface SwipeCardProps {
  card: TitleCard;
  onSwipe: (decision: 'like' | 'pass' | 'superlike') => void;
  isTop: boolean;
  stackIndex: number;
  superLikeUsed?: boolean;
  pendingDecision?: 'like' | 'pass' | 'superlike' | null;
  onPendingConsumed?: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
  preview?: boolean;
  onDragProgress?: (direction: 'like' | 'pass' | 'superlike' | null) => void;
}

export default function SwipeCard({
  card, onSwipe, isTop, stackIndex,
  superLikeUsed = false,
  pendingDecision, onPendingConsumed,
  onDragProgress,
  onUndo, canUndo = false,
  preview = false,
}: SwipeCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [exiting, setExiting] = useState(false);
  const backScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!flipped && backScrollRef.current) {
      backScrollRef.current.scrollTop = 0;
    }
  }, [flipped]);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-250, 0, 250], [-18, 0, 18]);
  // Super-zone: dragging primarily upward (|y| > |x| and y < 0).
  // Only one badge shows at a time — super-zone takes priority over left/right.
  const superZone = (xv: number, yv: number) => yv < -20 && Math.abs(yv) > Math.abs(xv);

  const likeOpacity = useTransform(
    [x, y] as any,
    ([xv, yv]: number[]) => superZone(xv, yv) ? 0 : Math.max(0, Math.min(1, (xv - 20) / 100)),
  );
  const nopeOpacity = useTransform(
    [x, y] as any,
    ([xv, yv]: number[]) => superZone(xv, yv) ? 0 : Math.max(0, Math.min(1, (-xv - 20) / 100)),
  );
  const superLikeOpacity = useTransform(
    [x, y] as any,
    ([xv, yv]: number[]) => superZone(xv, yv) ? Math.max(0, Math.min(1, (-yv - 20) / 100)) : 0,
  );
  const decisionRef = useRef<'like' | 'pass' | 'superlike'>('pass');

  useMotionValueEvent(x, 'change', (latest) => {
    if (!isTop || exiting || !onDragProgress) return;
    const yv = y.get();
    if (superZone(latest, yv)) { onDragProgress('superlike'); return; }
    if (latest > 30) onDragProgress('like');
    else if (latest < -30) onDragProgress('pass');
    else onDragProgress(null);
  });
  useMotionValueEvent(y, 'change', (latest) => {
    if (!isTop || exiting || !onDragProgress) return;
    const xv = x.get();
    if (superZone(xv, latest)) { onDragProgress('superlike'); return; }
    if (xv > 30) onDragProgress('like');
    else if (xv < -30) onDragProgress('pass');
    else onDragProgress(null);
  });

  const scale = 1 - stackIndex * 0.04;
  const yOffset = stackIndex * 8;

  const flyOut = useCallback((decision: 'like' | 'pass' | 'superlike') => {
    if (exiting) return;
    setExiting(true);
    decisionRef.current = decision;
    const targetX = decision === 'pass' ? -750 : decision === 'like' ? 750 : 0;
    const targetY = decision === 'superlike' ? -750 : 0;
    const targetRotate = decision === 'pass' ? -28 : decision === 'like' ? 28 : 0;
    Promise.all([
      animate(x, targetX, { duration: 0.32, ease: [0.4, 0, 0.2, 1] }),
      animate(y, targetY, { duration: 0.32, ease: [0.4, 0, 0.2, 1] }),
      animate(rotate as any, targetRotate, { duration: 0.32 }),
    ]).then(() => onSwipe(decision));
  }, [exiting, x, y, rotate, onSwipe]);

  const pendingRef = useRef<typeof pendingDecision>(null);
  if (isTop && pendingDecision && pendingDecision !== pendingRef.current && !exiting) {
    pendingRef.current = pendingDecision;
    setTimeout(() => { flyOut(pendingDecision); onPendingConsumed?.(); }, 0);
  }

  const handleDragEnd = (_: any, info: PanInfo) => {
    const swipedUp = (info.offset.y < -80 || info.velocity.y < -500) &&
                     Math.abs(info.offset.x) < Math.abs(info.offset.y);
    if (swipedUp && !superLikeUsed) { flyOut('superlike'); return; }
    const swipedH = Math.abs(info.offset.x) > 100 || Math.abs(info.velocity.x) > 600;
    if (swipedH) {
      flyOut(info.offset.x > 0 ? 'like' : 'pass');
    } else {
      onDragProgress?.(null);
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 });
      animate(y, 0, { type: 'spring', stiffness: 400, damping: 30 });
    }
  };

  const handleTap = () => {
    if (preview || (isTop && !exiting)) setFlipped(f => !f);
  };

  const cardShadow = isTop
    ? '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.07)'
    : '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)';

  return (
    <motion.div
      className="absolute w-full h-full"
      style={{ zIndex: 10 - stackIndex }}
      initial={{ scale: scale * 0.96, opacity: 0, y: yOffset + 12 }}
      animate={{ scale, opacity: 1 - stackIndex * 0.08, y: yOffset }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
    >
      <motion.div
        className="relative cursor-grab active:cursor-grabbing select-none h-full"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        style={{ x, y, rotate, touchAction: (preview || flipped) ? 'pan-y' : 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none', willChange: 'transform' } as any}
        drag={!preview && isTop && !exiting ? (flipped ? 'x' : true) : false}
        dragElastic={flipped ? 0.4 : 0.8}
        dragConstraints={flipped ? { top: 0, bottom: 0 } : undefined}
        onDragEnd={isTop ? handleDragEnd : undefined}
        onClick={handleTap}
      >
        {/* Swipe overlay stamps + color wash */}
        {isTop && (
          <CardOverlay
            likeOpacity={likeOpacity}
            nopeOpacity={nopeOpacity}
            superLikeOpacity={superLikeUsed ? undefined : superLikeOpacity}
            x={x} y={y}
          />
        )}

        {/* 3D flip wrapper — perspective on parent, single rotation on inner */}
        <div className="relative h-full" style={{ perspective: '1400px' }}>
          {/* ── Single rotating stage — one animation drives both faces ── */}
          <motion.div
            className="absolute inset-0"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            style={{ transformStyle: 'preserve-3d', willChange: 'transform' } as any}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >

          {/* ── FRONT FACE — full-bleed cinematic poster ── */}
          <div
            className="absolute inset-0 rounded-3xl overflow-hidden"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', boxShadow: cardShadow } as any}
          >
            {/* Poster — full bleed */}
            {card.posterPath ? (
              <img
                src={card.posterPath}
                alt={card.title}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                draggable={false}
                onDragStart={e => e.preventDefault()}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-dark-surface to-dark-card flex items-center justify-center">
                <span className="text-7xl opacity-10">{card.mediaType === 'movie' ? '🎬' : '📺'}</span>
              </div>
            )}

            {/* Top vignette — keeps controls readable */}
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/70 via-black/20 to-transparent pointer-events-none" />

            {/* Bottom gradient + info overlay — short, light, shows poster above */}
            <div
              className="absolute inset-x-0 bottom-0 pb-4 px-4 pointer-events-none"
              style={{
                paddingTop: '4.5rem',
                background: 'linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.88) 25%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.15) 68%, transparent 82%)',
              }}
            >
              {/* Title */}
              <h2
                className="text-white font-black leading-tight tracking-tight"
                style={{
                  fontSize: card.title.length > 28 ? '1.1rem' : '1.3rem',
                  textShadow: '0 1px 16px rgba(0,0,0,1), 0 2px 6px rgba(0,0,0,0.9)',
                }}
              >
                {card.title}
              </h2>

              {/* Year (range for TV) + ratings on one compact line */}
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-white/80 text-sm font-semibold" style={{ textShadow: '0 1px 12px rgba(0,0,0,1)' }}>
                  {card.mediaType === 'tv' ? (
                    <>
                      {card.seriesStatus === 'running'
                        ? `${card.year} –`
                        : card.endYear ? `${card.year} – ${card.endYear}` : card.year}
                      {card.seasons && (
                        <span className="text-white/60"> · {card.seasons} {card.seasons === 1 ? 'season' : 'seasons'}</span>
                      )}
                    </>
                  ) : card.year}
                </span>
                {card.voteAverage > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span className="bg-[#F5C518] text-black text-[10px] font-extrabold px-1.5 py-0.5 rounded leading-none">IMDb</span>
                    <span className="text-white font-bold text-sm" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}>
                      {card.voteAverage.toFixed(1)}
                    </span>
                  </span>
                )}
                {card.rottenTomatoesScore !== null ? (
                  <span className="flex items-center gap-1 text-white text-sm font-bold" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}>
                    🍅 {card.rottenTomatoesScore}%
                  </span>
                ) : card.metacriticScore !== null ? (
                  <span className="flex items-center gap-1.5 text-white text-sm font-bold">
                    <span className="bg-[#FFCC34] text-black text-[10px] font-extrabold px-1.5 py-0.5 rounded leading-none">MC</span>
                    <span style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}>{card.metacriticScore}</span>
                  </span>
                ) : null}
              </div>

              {/* Genre chips — max 3, compact */}
              {card.genres.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {card.genres.slice(0, 3).map(g => (
                    <span
                      key={g}
                      className="px-2 py-0.5 rounded-full text-[11px] font-semibold text-white/90"
                      style={{ background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(4px)' }}
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {/* Providers */}
              {card.providers.length > 0 && (
                <div className="mt-2 pointer-events-auto">
                  <StreamingLogos providers={card.providers} searchTitle={card.title} />
                </div>
              )}
            </div>

            {/* Type + age badges — bottom right */}
            <div className="absolute bottom-4 right-4 flex flex-col items-end gap-1.5 pointer-events-none z-10">
              <span className="text-[10px] font-bold text-white/85 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full tracking-wide uppercase">
                {card.mediaType === 'movie' ? '🎬 Film' : '📺 Series'}
              </span>
              {card.contentRating && (
                <span className="text-[10px] font-bold text-white/75 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full">
                  {formatContentRating(card.contentRating)}
                </span>
              )}
            </div>

            {/* Undo — top left */}
            {!preview && isTop && onUndo && (
              <button
                onClick={e => { e.stopPropagation(); onUndo(); }}
                disabled={!canUndo}
                className="absolute top-3 left-3 z-10 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white/80 text-base disabled:opacity-20 transition-all hover:bg-black/70 pointer-events-auto"
                title="Undo last swipe"
              >
                ↩
              </button>
            )}

            {/* Info icon — top right */}
            <div className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white/65 text-sm select-none pointer-events-none">
              ⓘ
            </div>
          </div>{/* end FRONT FACE */}

          {/* ── BACK FACE — scrollable detail view ── */}
          <div
            className="absolute inset-0 rounded-3xl overflow-hidden"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'linear-gradient(160deg, #0f0e1f 0%, #1a192f 60%, #0f0e1f 100%)',
              boxShadow: cardShadow,
              border: '1px solid rgba(255,255,255,0.07)',
            } as any}
          >
            {/* Subtle poster blur as back background */}
            {card.posterPath && (
              <img
                src={card.posterPath}
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover opacity-[0.06] blur-2xl scale-110 pointer-events-none"
                draggable={false}
              />
            )}

            <div ref={backScrollRef} className="relative p-5 h-full overflow-y-auto space-y-4" style={{ touchAction: 'pan-y', overscrollBehavior: 'none' }}>
              <h2 className="text-xl font-black leading-tight tracking-tight">
                {card.title}{' '}
                <span className="text-gray-500 font-normal text-base">
                  ({card.mediaType === 'tv'
                    ? card.seriesStatus === 'running'
                      ? `${card.year} –`
                      : card.endYear
                        ? `${card.year} – ${card.endYear}`
                        : card.year
                    : card.year})
                </span>
                {card.seasons && (
                  <span className="text-gray-600 font-normal text-sm ml-1">
                    · {card.seasons} {card.seasons === 1 ? 'season' : 'seasons'}
                  </span>
                )}
              </h2>

              {/* Stats grid */}
              <div className="flex gap-2 flex-wrap">
                {card.voteAverage > 0 && (
                  <div className="bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-center min-w-[58px]">
                    <div className="text-yellow-400 text-lg font-black">{card.voteAverage.toFixed(1)}</div>
                    <div className="mt-0.5"><span className="bg-[#F5C518] text-black text-[8px] font-extrabold px-1 py-0.5 rounded leading-none">IMDb</span></div>
                  </div>
                )}
                {card.rottenTomatoesScore !== null && (
                  <div className="bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-center min-w-[58px]">
                    <div className="text-red-400 text-lg font-black">{card.rottenTomatoesScore}%</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">RT</div>
                  </div>
                )}
                {card.rottenTomatoesScore === null && card.metacriticScore !== null && (
                  <div className="bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-center min-w-[58px]">
                    <div className="text-yellow-300 text-lg font-black">{card.metacriticScore}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">MC</div>
                  </div>
                )}
                {card.runtime && (
                  <div className="bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-center min-w-[58px]">
                    <div className="text-white text-base font-black">
                      {card.runtime >= 60 ? `${Math.floor(card.runtime / 60)}h ${card.runtime % 60}m` : `${card.runtime}m`}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">Runtime</div>
                  </div>
                )}
                {card.seasons && (
                  <div className="bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-center min-w-[58px]">
                    <div className="text-white text-base font-black">{card.seasons}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{card.seasons === 1 ? 'Season' : 'Seasons'}</div>
                  </div>
                )}
              </div>

              {card.contentRating && (
                <span className="inline-block px-2.5 py-1 bg-white/8 border border-white/10 rounded-lg text-xs font-bold text-white/70">
                  {formatContentRating(card.contentRating)}
                </span>
              )}

              {/* Genres */}
              <div className="flex flex-wrap gap-1">
                {card.genres.map(g => (
                  <span key={g} className="px-2.5 py-0.5 bg-white/8 border border-white/10 rounded-full text-xs text-gray-300 font-medium">{g}</span>
                ))}
              </div>

              <p className="text-sm text-gray-300 leading-relaxed">{card.overview}</p>

              {card.cast.length > 0 && (
                <p className="text-sm"><span className="text-gray-500 font-medium">Starring </span>{card.cast.join(', ')}</p>
              )}
              {card.director && (
                <p className="text-sm"><span className="text-gray-500 font-medium">Directed by </span>{card.director}</p>
              )}

              {card.providers.length > 0 && (
                <StreamingLogos providers={card.providers} searchTitle={card.title} />
              )}

              {card.trailerKey && (
                <a
                  href={`https://www.youtube.com/watch?v=${card.trailerKey}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-accent-orange rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
                  onClick={e => e.stopPropagation()}
                >
                  ▶ Watch Trailer
                </a>
              )}

              <p className="text-xs text-gray-600 text-center pb-2">Tap anywhere to flip back</p>
            </div>
          </div>{/* end BACK FACE */}

          </motion.div>{/* end rotating stage */}
        </div>{/* end perspective container */}
      </motion.div>
    </motion.div>
  );
}
