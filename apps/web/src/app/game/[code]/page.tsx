'use client';

import { useEffect, useLayoutEffect, useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { useGameStore } from '@/stores/gameStore';
import CardStack from '@/components/game/CardStack';
import SwipeButtons from '@/components/game/SwipeButtons';
import ProgressBar from '@/components/game/ProgressBar';
import TimerBar from '@/components/game/TimerBar';
import Logo from '@/components/ui/Logo';
import PlayerBadge from '@/components/ui/PlayerBadge';
import TutorialOverlay, { TutorialReplayButton } from '@/components/game/TutorialOverlay';
import { useSound } from '@/hooks/useSound';

export default function GamePage() {
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
    recordSwipe, undoLastSwipe, playerId, reconnecting,
  } = useGameStore();
  const { playLike, playPass, playSuperLike, toggleMute, isMuted, setVolume, getVolume } = useSound();
  const [muted, setMuted] = useState(() => isMuted());
  const [showSettings, setShowSettings] = useState(false);
  const [volume, setVolumeState] = useState(() => getVolume());

  // Sound is driven from handleSwipe so it fires for both gestures AND button taps
  const soundForDecision = useCallback((decision: 'like' | 'pass' | 'superlike') => {
    if (decision === 'like') playLike();
    else if (decision === 'pass') playPass();
    else playSuperLike();
  }, [playLike, playPass, playSuperLike]);
  const [flipped, setFlipped] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showSuperlikeHint, setShowSuperlikeHint] = useState(false);
  const [showTimesUp, setShowTimesUp] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [pendingDecision, setPendingDecision] = useState<'like' | 'pass' | 'superlike' | null>(null);
  const [dragDirection, setDragDirection] = useState<'like' | 'pass' | 'superlike' | null>(null);

  useEffect(() => {
    if (!reconnecting && !room) {
      router.push('/');
    }
  }, [reconnecting, room, router]);

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
    setShowTimesUp(true);
    setTimeout(() => setShowTimesUp(false), 600);
    handleSwipe('pass');
  }, [handleSwipe]);

  // Preload the next 3 poster images so fast swipes never show a blank card
  useEffect(() => {
    for (let i = 1; i <= 3; i++) {
      const next = titlePool[currentCardIndex + i];
      if (next?.posterPath) {
        const img = new window.Image();
        img.src = next.posterPath;
      }
    }
  }, [currentCardIndex, titlePool]);

  // Guard browser back button — push a dummy history entry so back is intercepted
  useEffect(() => {
    history.pushState(null, '', location.href);
    const handler = () => {
      history.pushState(null, '', location.href);
      router.push('/');
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [router]);

  // One-time Superlike hint on first card of each game session
  useEffect(() => {
    if (!titlePool.length || currentCardIndex !== 0) return;
    const key = 'showmatch-superlike-hint';
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    setShowSuperlikeHint(true);
    const t = setTimeout(() => setShowSuperlikeHint(false), 3000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titlePool.length]);

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

  if (reconnecting) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="text-3xl animate-pulse">🎬</div>
        <p className="text-gray-400 text-sm tracking-wide">Reconnecting...</p>
      </div>
    </div>
  );
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
        <PlayerBadge />
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSettings(v => !v)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
            title="Sound settings"
            aria-label="Sound settings"
          >
            <span className="text-base">{muted ? '🔇' : '🔊'}</span>
          </button>
          <TutorialReplayButton onClick={() => {
            localStorage.removeItem('showmatch-tutorial-seen');
            setShowTutorial(true);
          }} />
        </div>
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

        {/* Card Stack / Done-waiting state */}
        <div className="flex-1 min-h-0 flex items-stretch justify-center mt-4 overflow-hidden">
          {isFinished ? (
            <div className="flex flex-col items-center justify-center gap-5 w-full">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="w-20 h-20 rounded-full bg-green-900/30 border-2 border-green-500/40 flex items-center justify-center text-4xl"
              >
                ✓
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-lg font-semibold text-gray-200"
              >
                You&apos;re done!
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="text-sm text-gray-500"
              >
                Waiting for everyone to finish...
              </motion.p>
              {/* Per-player progress dots */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="flex gap-3 flex-wrap justify-center"
              >
                {room.players.filter(p => p.connected).map(p => (
                  <div key={p.id} className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-colors ${p.finished ? 'border-green-500/60 bg-green-900/30 text-green-400' : 'border-gray-600 bg-dark-card text-gray-500'}`}>
                      {p.finished ? '✓' : p.displayName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[10px] text-gray-600 max-w-[48px] truncate">{p.displayName.split(' ')[0]}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          ) : (
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
          )}
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

      {/* Settings drawer */}
      <AnimatePresence>
        {showSettings && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
            />
            {/* Drawer */}
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 bg-dark-card border-t border-dark-border rounded-t-3xl p-6 pb-safe max-w-lg mx-auto"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-semibold text-white">Sound</h3>
                <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-white text-xl leading-none">×</button>
              </div>

              {/* Mute toggle */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-sm text-gray-300">Sound</span>
                <button
                  onClick={() => { const m = toggleMute(); setMuted(m); }}
                  className={`w-12 h-6 rounded-full transition-colors relative ${muted ? 'bg-dark-border' : 'bg-primary'}`}
                  aria-label={muted ? 'Unmute' : 'Mute'}
                >
                  <motion.div
                    className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow"
                    animate={{ x: muted ? 2 : 25 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              {/* Volume */}
              <div>
                <span className="text-sm text-gray-300 block mb-3">Volume</span>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => { setVolume(lvl); setVolumeState(lvl); }}
                      disabled={muted}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors capitalize disabled:opacity-30 ${volume === lvl ? 'bg-primary text-white' : 'bg-dark-surface text-gray-400'}`}
                    >
                      {lvl === 'low' ? '🔈' : lvl === 'medium' ? '🔉' : '🔊'} {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Time's up flash */}
      <AnimatePresence>
        {showTimesUp && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className="bg-accent-red/20 border border-accent-red/40 text-white text-lg font-bold px-6 py-3 rounded-2xl backdrop-blur-sm">
              ⏱ Time&apos;s up!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Superlike one-time hint toast */}
      <AnimatePresence>
        {showSuperlikeHint && (
          <motion.div
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <div className="bg-dark-surface/95 border border-yellow-500/30 text-sm text-gray-200 px-4 py-2.5 rounded-2xl shadow-lg backdrop-blur-sm whitespace-nowrap">
              ⭐ You have 1 Super Like — use it wisely!
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
