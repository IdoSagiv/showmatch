'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { useGameStore } from '@/stores/gameStore';
import ResultReveal from '@/components/results/ResultReveal';
import RankingBoard from '@/components/results/RankingBoard';
import WildcardPicker from '@/components/results/WildcardPicker';
import SwipeReveal from '@/components/results/SwipeReveal';
import GameStats from '@/components/results/GameStats';
import Logo from '@/components/ui/Logo';
import { saveGameToHistory } from '@/lib/history';
import { safeCopy } from '@/lib/clipboard';

export default function ResultsPage() {
  const router = useRouter();
  const params = useParams();
  const code = (params.code as string).toUpperCase();
  const socket = useSocket();
  const {
    room, matchedTitles, winner, fullRankings, wildcardCandidates,
    isFirstMatch, playerId, swipeReveal, gameStats, gameOver, setWinner, reset,
  } = useGameStore();
  const [rankingSubmitted, setRankingSubmitted] = useState(false);
  const [historySaved, setHistorySaved] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Auto-set winner when there's exactly 1 match (server skips ranking round)
  useEffect(() => {
    if (gameOver && matchedTitles.length === 1 && !winner) {
      setWinner(matchedTitles[0]);
    }
  }, [gameOver, matchedTitles, winner, setWinner]);

  // Save to history when winner is determined
  useEffect(() => {
    if (winner && room && !historySaved) {
      setHistorySaved(true);
      saveGameToHistory({
        id: `${code}-${Date.now()}`,
        date: new Date().toISOString(),
        players: room.players.map(p => p.displayName),
        winner: { title: winner.title, posterPath: winner.posterPath },
        stats: gameStats,
      });
    }
  }, [winner, room, historySaved, code, gameStats]);

  useEffect(() => {
    if (!room) {
      router.push('/');
    }
  }, [room, router]);

  useEffect(() => {
    if (room?.status === 'lobby') {
      router.push(`/lobby/${code}`);
    }
  }, [room?.status, code, router]);

  const handleSubmitRanking = useCallback((rankings: Array<{ tmdbId: number; rank: number }>) => {
    socket.emit('submitRanking', rankings);
    setRankingSubmitted(true);
  }, [socket]);

  const handlePlayAgain = useCallback(() => {
    (socket as any).emit('playAgain', { playerId });
  }, [socket, playerId]);

  const handleEndGame = useCallback(() => {
    (socket as any).emit('endGame', { playerId });
    // Host navigates themselves — server will notify guests via socket.to() (not io.to())
    // so the host won't receive the roomClosed toast.
    reset();
    router.push('/');
  }, [socket, playerId, reset, router]);

  const handleShare = useCallback(async () => {
    if (!winner) return;
    const text = `We're watching "${winner.title}" (${winner.year})! Decided on ShowMatch 🎬`;

    // navigator.share works on mobile (HTTPS or localhost)
    if (navigator.share) {
      try {
        await navigator.share({ title: 'ShowMatch Result', text });
        return;
      } catch {}
    }

    await safeCopy(text);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  }, [winner]);

  if (!room) return null;

  const isCreator = room.players.find(p => p.id === playerId)?.isCreator ?? false;
  // Use gameOver (set by allPlayersFinished event) since client room.status isn't updated server-side
  const isRanking = gameOver && matchedTitles.length > 1 && !winner;
  const noMatches = gameOver && matchedTitles.length === 0 && !winner;
  const waitingForResults = gameOver && !winner && !isRanking && !noMatches;

  return (
    <main className="min-h-screen bg-dark pb-36">
      <header className="flex items-center p-4 border-b border-dark-border">
        <Logo size="sm" />
      </header>

      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* Still waiting */}
        {!gameOver && !winner && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400">Waiting for everyone to finish…</p>
          </div>
        )}

        {/* No matches */}
        {noMatches && (
          <WildcardPicker candidates={wildcardCandidates} />
        )}

        {/* Ranking phase */}
        {isRanking && matchedTitles.length > 1 && (
          <RankingBoard
            titles={matchedTitles}
            onSubmit={handleSubmitRanking}
            submitted={rankingSubmitted}
          />
        )}

        {/* Waiting for rankings */}
        {rankingSubmitted && !winner && (
          <div className="text-center py-8">
            <p className="text-gray-400 animate-pulse">Waiting for other players to submit rankings...</p>
            <div className="mt-4 flex justify-center gap-2">
              {room.players.filter(p => p.connected).map(p => (
                <div key={p.id} className="text-center">
                  <div className="w-8 h-8 rounded-full bg-dark-surface flex items-center justify-center text-xs">
                    {p.displayName.split(' ').map(w => w[0]).join('')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Winner reveal */}
        {winner && (
          <>
            <ResultReveal
              winner={winner}
              skipCountdown={isFirstMatch || matchedTitles.length === 1}
            />

            {/* Watch Now — streaming links */}
            {winner.providers && winner.providers.length > 0 && (
              <div className="text-center space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-widest">Available on</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {winner.providers.map(p => (
                    <a
                      key={p.id}
                      href={`https://www.justwatch.com/search?q=${encodeURIComponent(winner.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-dark-surface border border-dark-border rounded-full px-3 py-1.5 text-sm hover:border-primary transition-colors"
                    >
                      <img src={p.logoPath} alt={p.name} className="w-5 h-5 rounded" />
                      {p.name}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4">
              <SwipeReveal reveals={swipeReveal} />
            </div>

            <div className="mt-6">
              <GameStats stats={gameStats} />
            </div>
          </>
        )}

        {/* Broadening suggestion for no matches */}
        {noMatches && (
          <div className="mt-6 space-y-3">
            <p className="text-sm text-gray-500 text-center">Try selecting more genres or lowering the rating threshold</p>
{/* action buttons in sticky footer */}
          </div>
        )}
      </div>

      {/* Sticky footer — always visible once game is over */}
      {(winner || noMatches) && (
        <div className="fixed bottom-0 left-0 right-0 z-10 bg-dark/90 backdrop-blur-sm border-t border-dark-border">
          <div className="max-w-lg mx-auto p-3 flex gap-2">
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dark-border bg-dark-surface hover:bg-dark-border transition-colors text-white font-semibold text-sm active:scale-95"
            >
              <span>{shareCopied ? '✓' : '📤'}</span>
              {shareCopied ? 'Copied!' : 'Share'}
            </button>

            {isCreator && (
              <>
                <button
                  onClick={handlePlayAgain}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary hover:bg-primary/90 transition-colors text-white font-semibold text-sm active:scale-95"
                >
                  <span>🔄</span> Play Again
                </button>
                <button
                  onClick={handleEndGame}
                  className="flex items-center justify-center px-4 py-3 rounded-xl border border-red-900/40 bg-red-950/30 hover:bg-red-950/60 transition-colors text-red-400 text-sm active:scale-95"
                  title="End Game"
                >
                  🚪
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
