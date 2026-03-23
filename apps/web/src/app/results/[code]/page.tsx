'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { useGameStore } from '@/stores/gameStore';
import ResultReveal from '@/components/results/ResultReveal';
import RankingBoard from '@/components/results/RankingBoard';
import WildcardPicker from '@/components/results/WildcardPicker';
import Button from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';

export default function ResultsPage() {
  const router = useRouter();
  const params = useParams();
  const code = (params.code as string).toUpperCase();
  const socket = useSocket();
  const {
    room, matchedTitles, winner, fullRankings, wildcardCandidates,
    isFirstMatch, playerId, swipeReveal, gameStats,
  } = useGameStore();
  const [rankingSubmitted, setRankingSubmitted] = useState(false);

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
  const isRanking = room.status === 'ranking' && !winner;
  const noMatches = matchedTitles.length === 0 && room.status === 'finished' && !winner;

  return (
    <main className="min-h-screen bg-dark">
      <header className="flex items-center p-4 border-b border-dark-border">
        <a href="/"><Logo size="sm" /></a>
      </header>

      <div className="max-w-lg mx-auto p-4 space-y-6">
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

            {/* Swipe Reveal */}
            {swipeReveal.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold mb-3">Who Liked What</h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {swipeReveal.slice(0, 20).map(({ title, playerDecisions }) => (
                    <div key={title.tmdbId} className="flex items-center gap-3 bg-dark-surface rounded-lg p-2">
                      {title.posterPath && (
                        <img src={title.posterPath} alt={title.title} className="w-8 h-12 rounded object-cover" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{title.title}</p>
                        <div className="flex gap-2 mt-1">
                          {playerDecisions.map(pd => (
                            <span key={pd.playerName} className="text-xs" title={pd.playerName}>
                              {pd.decision === 'like' ? '❤️' : pd.decision === 'superlike' ? '⭐' : '❌'}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fun Stats */}
            {gameStats.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-bold mb-3">Awards</h3>
                <div className="grid grid-cols-2 gap-3">
                  {gameStats.map((stat, i) => (
                    <div
                      key={stat.title}
                      className="bg-dark-card rounded-xl p-3 border border-dark-border text-center"
                    >
                      <div className="text-2xl mb-1">{stat.emoji}</div>
                      <div className="text-sm font-bold">{stat.title}</div>
                      <div className="text-xs text-primary">{stat.playerName}</div>
                      <div className="text-xs text-gray-500">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
              <Button onClick={handleShare} variant="secondary" className={isCreator ? '' : 'flex-1'}>
                Share Result
              </Button>
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
