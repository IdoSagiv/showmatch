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
import ShareResultButton from '@/components/results/ShareResultButton';
import Button from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';
import { saveGameToHistory } from '@/lib/history';

export default function ResultsPage() {
  const router = useRouter();
  const params = useParams();
  const code = (params.code as string).toUpperCase();
  const socket = useSocket();
  const {
    room, matchedTitles, winner, fullRankings, wildcardCandidates,
    isFirstMatch, playerId, swipeReveal, gameStats, gameOver, setWinner,
  } = useGameStore();
  const [rankingSubmitted, setRankingSubmitted] = useState(false);
  const [historySaved, setHistorySaved] = useState(false);

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
    socket.emit('playAgain');
  }, [socket]);

  const handleEndGame = useCallback(() => {
    socket.emit('endGame');
  }, [socket]);

  const handleShare = useCallback(async () => {
    if (!winner) return;
    const text = `We're watching ${winner.title}! Decided on ShowMatch`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'ShowMatch Result', text });
        return;
      } catch {}
    }
    await navigator.clipboard.writeText(text);
  }, [winner]);

  if (!room) return null;

  const isCreator = room.players.find(p => p.id === playerId)?.isCreator ?? false;
  // Use gameOver (set by allPlayersFinished event) since client room.status isn't updated server-side
  const isRanking = gameOver && matchedTitles.length > 1 && !winner;
  const noMatches = gameOver && matchedTitles.length === 0 && !winner;
  const waitingForResults = gameOver && !winner && !isRanking && !noMatches;

  return (
    <main className="min-h-screen bg-dark">
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

            <div className="mt-8">
              <SwipeReveal reveals={swipeReveal} />
            </div>

            <div className="mt-6">
              <GameStats stats={gameStats} />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mt-6">
              {isCreator && (
                <>
                  <Button onClick={handlePlayAgain} variant="secondary" className="flex-1">
                    Play Again
                  </Button>
                  <Button onClick={handleEndGame} variant="ghost" className="flex-1">
                    End Game
                  </Button>
                </>
              )}
              <ShareResultButton winner={winner} />
            </div>
          </>
        )}

        {/* Broadening suggestion for no matches */}
        {noMatches && (
          <div className="text-center mt-6 space-y-3">
            <p className="text-sm text-gray-500">Try selecting more genres or lowering the rating threshold</p>
            {isCreator && (
              <div className="flex gap-3 justify-center">
                <Button onClick={handlePlayAgain} variant="secondary">Play Again</Button>
                <Button onClick={handleEndGame} variant="ghost">End Game</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
