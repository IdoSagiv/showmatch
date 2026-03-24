'use client';

import { useEffect, useLayoutEffect, useCallback, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { useGameStore } from '@/stores/gameStore';
import CardStack from '@/components/game/CardStack';
import SwipeButtons from '@/components/game/SwipeButtons';
import ProgressBar from '@/components/game/ProgressBar';
import TimerBar from '@/components/game/TimerBar';
import Logo from '@/components/ui/Logo';
import TutorialOverlay, { TutorialReplayButton } from '@/components/game/TutorialOverlay';
import { useBeforeUnload } from '@/hooks/useBeforeUnload';
import { useSound } from '@/hooks/useSound';

export default function GamePage() {
  useBeforeUnload();

  // Use visualViewport.height (true visible height on mobile) via React state.
  // useLayoutEffect fires before the browser paints, so the correct height is
  // applied on the very first frame — no flash of wrong layout.
  const [gameHeight, setGameHeight] = useState('100vh');
  useLayoutEffect(() => {
    const set = () => {
      const h = window.visualViewport?.height ?? window.innerHeight;
      setGameHeight(`${h}px`);
    };
    set();
    const vv = window.visualViewport;
    vv?.addEventListener('resize', set);
    return () => vv?.removeEventListener('resize', set);
  }, []);

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
  const [dragDirection, setDragDirection] = useState<'like' | 'pass' | 'superlike' | null>(null);

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
    setDragDirection(null); // clear button highlight immediately
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
  }, [socket, titlePool, currentCardIndex, recordSwipe, soundForDecision, setDragDirection]);

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

  // Keyboard shortcuts: ← pass, → like, ↑ superlike
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!room || !titlePool.length) return;
      const finished = currentCardIndex >= titlePool.length;
      const player = room.players.find(p => p.id === playerId);
      if (finished || pendingDecision) return;
      if (e.key === 'ArrowLeft')  setPendingDecision('pass');
      if (e.key === 'ArrowRight') setPendingDecision('like');
      if (e.key === 'ArrowUp' && !player?.superLikeUsed) setPendingDecision('superlike');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [room, titlePool, currentCardIndex, pendingDecision, playerId]);

  if (!room || !titlePool.length) return null;

  const isFinished = currentCardIndex >= titlePool.length;
  const me = room.players.find(p => p.id === playerId);
  const otherPlayers = room.players.filter(p => p.id !== playerId);

  return (
    <main className="flex flex-col overflow-hidden" style={{ height: gameHeight, touchAction: 'pan-y' }}>
      <TutorialOverlay onDismiss={() => setShowTutorial(false)} forceShow={showTutorial} />
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2.5 bg-transparent backdrop-blur-md">
        <Logo size="sm" />
        <TutorialReplayButton onClick={() => {
          localStorage.removeItem('showmatch-tutorial-seen');
          setShowTutorial(true);
        }} />
      </header>

      <div className="flex-1 min-h-0 flex flex-col p-4 max-w-lg mx-auto w-full">
        {/* Progress */}
        <ProgressBar current={currentCardIndex} total={titlePool.length} />

        {/* Timer — sits flush under progress bar as a thin accent strip */}
        {room.settings.timerSeconds && !isFinished && (
          <TimerBar
            seconds={room.settings.timerSeconds}
            isPaused={flipped}
            onExpired={handleTimerExpired}
            cardKey={currentCardIndex}
          />
        )}

        {/* Card Stack */}
        <div className="flex-1 min-h-0 flex items-stretch justify-center mt-4 overflow-hidden">
          <CardStack
            cards={titlePool}
            currentIndex={currentCardIndex}
            onSwipe={handleSwipe}
            superLikeUsed={me?.superLikeUsed ?? false}
            pendingDecision={pendingDecision}
            onPendingConsumed={() => setPendingDecision(null)}
            otherPlayers={otherPlayers}
            totalCards={titlePool.length}
            onUndo={handleUndo}
            canUndo={canUndo}
            onDragProgress={setDragDirection}
          />
        </div>

        {/* Buttons */}
        {!isFinished && (
          <SwipeButtons
            onPass={() => setPendingDecision('pass')}
            onLike={() => setPendingDecision('like')}
            onSuperLike={() => setPendingDecision('superlike')}
            superLikeUsed={me?.superLikeUsed ?? false}
            disabled={isFinished || !!pendingDecision}
            dragDirection={dragDirection}
          />
        )}
      </div>
    </main>
  );
}
