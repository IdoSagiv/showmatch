'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TitleCard } from '@/types/game';
import Confetti from './Confetti';
import StreamingLogos from '@/components/game/StreamingLogos';

interface ResultRevealProps {
  winner: TitleCard;
  skipCountdown?: boolean;
}

export default function ResultReveal({ winner, skipCountdown = false }: ResultRevealProps) {
  const [countdown, setCountdown] = useState(skipCountdown ? 0 : 3);
  const [revealed, setRevealed] = useState(skipCountdown);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (skipCountdown) return;
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    } else {
      setRevealed(true);
    }
  }, [countdown, skipCountdown]);

  return (
    <div className="text-center">
      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div
            key={countdown}
            className="text-8xl font-bold text-primary"
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {countdown}
          </motion.div>
        ) : (
          <motion.div
            key="winner"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <Confetti />
            <h2 className="text-2xl font-bold mb-4 text-accent-gold">Tonight&apos;s Pick!</h2>

            {/* Flip card container */}
            <div
              className="relative max-w-xs mx-auto cursor-pointer select-none"
              style={{ perspective: 1200 }}
              onClick={() => setFlipped(f => !f)}
            >
              {/* Front face */}
              <motion.div
                className="bg-dark-card rounded-2xl overflow-hidden border border-dark-border shadow-2xl"
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                style={{ backfaceVisibility: 'hidden', transformStyle: 'preserve-3d' }}
              >
                {winner.posterPath && (
                  <img
                    src={winner.posterPath}
                    alt={winner.title}
                    className="w-full aspect-[2/3] object-cover"
                  />
                )}
                <div className="p-4 space-y-2">
                  <h3 className="text-xl font-bold">{winner.title}</h3>
                  <p className="text-gray-400">({winner.year})</p>
                  <div className="flex justify-center gap-3 text-sm">
                    <span className="flex items-center gap-1">
                      <span className="text-yellow-400">★</span>
                      <span>{winner.voteAverage.toFixed(1)}</span>
                      <span className="text-gray-600 text-xs">IMDB</span>
                    </span>
                    {winner.rottenTomatoesScore !== null && (
                      <span className="flex items-center gap-1">
                        <span>🍅</span>
                        <span>{winner.rottenTomatoesScore}%</span>
                      </span>
                    )}
                  </div>
                  {winner.providers && winner.providers.length > 0 && (
                    <div className="flex justify-center pt-1">
                      <StreamingLogos providers={winner.providers} />
                    </div>
                  )}
                  <p className="text-xs text-gray-600 pt-1">Tap for details ↕</p>
                </div>
              </motion.div>

              {/* Back face */}
              <motion.div
                className="absolute inset-0 bg-dark-card rounded-2xl border border-dark-border shadow-2xl overflow-hidden"
                animate={{ rotateY: flipped ? 360 : 180 }}
                transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                style={{ backfaceVisibility: 'hidden', transformStyle: 'preserve-3d' }}
              >
                <div className="p-5 h-full overflow-y-auto space-y-4 text-left">
                  <h3 className="text-xl font-bold leading-tight">
                    {winner.title}{' '}
                    <span className="text-gray-500 font-normal text-base">({winner.year})</span>
                  </h3>

                  <div className="flex gap-3 flex-wrap">
                    <div className="bg-dark-surface rounded-lg px-3 py-2 text-center min-w-[56px]">
                      <div className="text-yellow-400 text-lg font-bold">{winner.voteAverage.toFixed(1)}</div>
                      <div className="text-xs text-gray-500">IMDB</div>
                    </div>
                    {winner.rottenTomatoesScore !== null && (
                      <div className="bg-dark-surface rounded-lg px-3 py-2 text-center min-w-[56px]">
                        <div className="text-red-400 text-lg font-bold">{winner.rottenTomatoesScore}%</div>
                        <div className="text-xs text-gray-500">RT</div>
                      </div>
                    )}
                    {winner.runtime && (
                      <div className="bg-dark-surface rounded-lg px-3 py-2 text-center min-w-[56px]">
                        <div className="text-lg font-bold">
                          {winner.runtime >= 60
                            ? `${Math.floor(winner.runtime / 60)}h ${winner.runtime % 60}m`
                            : `${winner.runtime}m`}
                        </div>
                        <div className="text-xs text-gray-500">Runtime</div>
                      </div>
                    )}
                  </div>

                  {winner.contentRating && (
                    <span className="inline-block px-2 py-1 bg-dark-surface border border-dark-border rounded text-xs font-bold">
                      {winner.contentRating}
                    </span>
                  )}

                  {winner.overview && (
                    <p className="text-sm text-gray-300 leading-relaxed">{winner.overview}</p>
                  )}

                  {winner.cast && winner.cast.length > 0 && (
                    <p className="text-sm">
                      <span className="text-gray-500">Starring: </span>{winner.cast.join(', ')}
                    </p>
                  )}
                  {winner.director && (
                    <p className="text-sm">
                      <span className="text-gray-500">Directed by: </span>{winner.director}
                    </p>
                  )}

                  {winner.providers && winner.providers.length > 0 && (
                    <StreamingLogos providers={winner.providers} />
                  )}

                  {winner.trailerKey && (
                    <a
                      href={`https://www.youtube.com/watch?v=${winner.trailerKey}`}
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
        )}
      </AnimatePresence>
    </div>
  );
}
