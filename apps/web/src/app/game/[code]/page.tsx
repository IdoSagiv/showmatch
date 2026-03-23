'use client';

import { useEffect, useCallback, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { useGameStore } from '@/stores/gameStore';
import CardStack from '@/components/game/CardStack';
import SwipeButtons from '@/components/game/SwipeButtons';
import UndoButton from '@/components/game/UndoButton';
import ProgressBar from '@/components/game/ProgressBar';
import TimerBar from '@/components/game/TimerBar';
import PlayerAvatar from '@/components/lobby/PlayerAvatar';
import Logo from '@/components/ui/Logo';
import TutorialOverlay, { TutorialReplayButton } from '@/components/game/TutorialOverlay';
import { useBeforeUnload } from '@/hooks/useBeforeUnload';
import { useSound } from '@/hooks/useSound';

export default function GamePage() {
  useBeforeUnload();
  const router = useRouter();
  const params = useParams();
  const code = (params.code as string).toUpperCase();
  const socket = useSocket();
  const {
    room, titlePool, currentCardIndex, mySwipes,
    matchedTitles, winner, isFirstMatch, gameOver,
    recordSwipe, undoLastSwipe, playerId,
  } = useGameStore();
  const { playLike, playPass, playSuperLike } = useSound();

  // Sound is driven from handleSwipe so it fires for both gestures AND button taps
  const soundForDecision = useCallback((decision: 'like' | 'pass' | 'superlike') => {
    if (decision === 'like') playLike();
    else if (decision === 'pass') playPass();
    else playSuperLike();
  }, [playLike, playPass, playSuperLike]);
  const [flipped, setFlipped] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [pendingDecision, setPendingDecision] = useState<'like' | 'pass' | 'superlike' | null>(null);

  useEffect(() => {
    if (!room || !titlePool.length) {
      router.push('/');
    }
  }, [room, titlePool, router]);

  // Redirect to results
  useEffect(() => {
    if (gameOver || room?.status === 'ranking' || room?.status === 'finished' || winner) {
      router.push(`/results/${code}`);
    }
  }, [gameOver, room?.status, winner, code, router]);

  // Redirect back to lobby on reset
  useEffect(() => {
    if (room?.status === 'lobby') {
      router.push(`/lobby/${code}`);
    }
  }, [room?.status, code, router]);

  const handleSwipe = useCallback((decision: 'like' | 'pass' | 'superlike') => {
    if (!titlePool[currentCardIndex]) return;
    const tmdbId = titlePool[currentCardIndex].tmdbId;

    soundForDecision(decision);
    socket.emit('submitSwipe', tmdbId, decision);
    recordSwipe({ tmdbId, decision, timestamp: Date.now() });
    setFlipped(false);
    setCanUndo(true);

    // Haptic feedback
    try {
      if (decision === 'superlike') {
        navigator.vibrate?.([100, 50, 100]);
      } else {
        navigator.vibrate?.(50);
      }
    } catch {}
  }, [socket, titlePool, currentCardIndex, recordSwipe, soundForDecision]);

  const handleUndo = useCallback(() => {
    const undone = undoLastSwipe();
    if (undone) {
      socket.emit('undoSwipe');
      setCanUndo(false);
    }
  }, [socket, undoLastSwipe]);

  const handleTimerExpired = useCallback(() => {
    handleSwipe('pass');
  }, [handleSwipe]);

  if (!room || !titlePool.length) return null;

  const isFinished = currentCardIndex >= titlePool.length;
  const me = room.players.find(p => p.id === playerId);
  const otherPlayers = room.players.filter(p => p.id !== playerId);

  return (
    <main className="min-h-screen bg-dark flex flex-col overflow-hidden" style={{ touchAction: 'pan-y' }}>
      <TutorialOverlay onDismiss={() => setShowTutorial(false)} />
      {/* Header */}
      <header className="flex items-center justify-between p-3 border-b border-dark-border">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          <TutorialReplayButton onClick={() => {
            localStorage.removeItem('showmatch-tutorial-seen');
            setShowTutorial(true);
          }} />
          {otherPlayers.map(p => (
            <PlayerAvatar
              key={p.id}
              name={p.displayName}
              connected={p.connected}
              size="sm"
              progress={p.progress}
              total={titlePool.length}
            />
          ))}
        </div>
      </header>

      <div className="flex-1 flex flex-col p-4 max-w-lg mx-auto w-full">
        {/* Progress */}
        <ProgressBar current={currentCardIndex} total={titlePool.length} />

        {/* Timer */}
        {room.settings.timerSeconds && !isFinished && (
          <div className="mt-2">
            <TimerBar
              seconds={room.settings.timerSeconds}
              isPaused={flipped}
              onExpired={handleTimerExpired}
              cardKey={currentCardIndex}
            />
          </div>
        )}

        {/* Card Stack */}
        <div className="flex-1 flex items-center justify-center mt-4 overflow-hidden">
          <CardStack
            cards={titlePool}
            currentIndex={currentCardIndex}
            onSwipe={handleSwipe}
            pendingDecision={pendingDecision}
            onPendingConsumed={() => setPendingDecision(null)}
          />
        </div>

        {/* Buttons */}
        {!isFinished && (
          <div className="flex items-center justify-center gap-4">
            <UndoButton onClick={handleUndo} disabled={!canUndo} />
            <SwipeButtons
              onPass={() => setPendingDecision('pass')}
              onLike={() => setPendingDecision('like')}
              onSuperLike={() => setPendingDecision('superlike')}
              superLikeUsed={me?.superLikeUsed ?? false}
              disabled={isFinished || !!pendingDecision}
            />
          </div>
        )}
      </div>
    </main>
  );
}
