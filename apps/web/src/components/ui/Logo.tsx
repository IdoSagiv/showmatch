'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/gameStore';
import { getSocket } from '@/lib/socket';
import Modal from './Modal';
import Button from './Button';

interface LogoProps {
  size?: 'sm' | 'lg';
}

const LONG_PRESS_MS = 500;

export default function Logo({ size = 'sm' }: LogoProps) {
  const textSize = size === 'lg' ? 'text-[3.5rem] md:text-[4rem]' : 'text-2xl';
  const router = useRouter();
  const { room, reset, playerId } = useGameStore();

  // ── Leave-game confirm ──
  const [showConfirm, setShowConfirm] = useState(false);

  // ── Add-to-home-screen panel ──
  const [showPanel, setShowPanel] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // ── Long-press detection ──
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longFiredRef = useRef(false);   // block the click that follows a long press
  const [pressing, setPressing] = useState(false); // subtle visual feedback

  const isInGame = !!room; // confirm any time there's an active room (lobby or in-game)

  const clearTimer = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    setPressing(false);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    longFiredRef.current = false;
    setPressing(true);
    timerRef.current = setTimeout(() => {
      longFiredRef.current = true;
      setPressing(false);
      setShowPanel(true);
    }, LONG_PRESS_MS);
  };

  const handlePointerUp   = () => clearTimer();
  const handlePointerLeave = () => clearTimer();
  // Cancel if finger moves significantly (avoid accidental triggers while scrolling)
  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'touch') return;
    clearTimer();
  };

  const handleClick = (e: React.MouseEvent) => {
    if (longFiredRef.current) { longFiredRef.current = false; e.preventDefault(); return; }
    if (isInGame) {
      e.preventDefault();
      setShowConfirm(true);
    }
    // else: let the <a href="/"> navigate naturally
  };

  // ── Leave handler ──
  const handleLeave = () => {
    try {
      getSocket().emit('leaveRoom', { playerId: playerId ?? undefined });
    } catch {}
    reset();
    setShowConfirm(false);
    router.push('/');
  };

  return (
    <>
      <motion.a
        href="/"
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onPointerMove={handlePointerMove}
        // Prevent the context menu on mobile long press (we handle it ourselves)
        onContextMenu={e => e.preventDefault()}
        className="flex items-center gap-2 cursor-pointer select-none"
        style={{ WebkitUserSelect: 'none', userSelect: 'none', WebkitTouchCallout: 'none', textDecoration: 'none' } as any}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: pressing ? 0.92 : 1, opacity: 1 }}
        transition={{ type: 'spring', duration: pressing ? 0.15 : 0.5, stiffness: 400, damping: 22 }}
      >
        <span className={`font-bold ${textSize} tracking-tight`}>
          <span className="text-white">Show</span>
          <span className="gradient-text">Match</span>
        </span>
      </motion.a>

      {/* ── Leave-game confirmation modal ── */}
      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Leave Game?">
        <p className="text-gray-400 mb-6">
          {room?.status === 'lobby'
            ? 'Are you sure? Players waiting in the lobby will be disconnected.'
            : 'Are you sure you want to leave? Your progress will be lost.'}
        </p>
        <div className="flex gap-3">
          <Button onClick={() => setShowConfirm(false)} variant="secondary" className="flex-1">
            Stay
          </Button>
          <Button onClick={handleLeave} variant="primary" className="flex-1">
            Leave
          </Button>
        </div>
      </Modal>

      {/* ── Add-to-home-screen panel (portal) ── */}
      {mounted && createPortal(
        <AnimatePresence>
          {showPanel && (
            <>
              {/* Backdrop */}
              <motion.div
                className="fixed inset-0 z-[290] bg-black/40 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowPanel(false)}
              />

              {/* Bottom sheet */}
              <motion.div
                className="fixed bottom-0 left-0 right-0 z-[300] rounded-t-3xl px-6 pb-10 pt-6"
                style={{
                  background: 'rgba(12,11,24,0.97)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderBottom: 'none',
                  backdropFilter: 'blur(24px)',
                }}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 380, damping: 36 }}
                onClick={e => e.stopPropagation()}
              >
                {/* Drag handle */}
                <div className="mx-auto w-10 h-1 rounded-full bg-white/20 mb-5" />

                {/* URL as a native link — right-click / iOS long-press gives "Copy Link" */}
                <a
                  href={typeof window !== 'undefined' ? window.location.origin : '#'}
                  onClick={e => e.preventDefault()}
                  className="block w-full rounded-2xl px-4 py-4 text-center font-mono text-sm text-white/80 select-all"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
                >
                  {typeof window !== 'undefined' ? window.location.origin : ''}
                </a>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
