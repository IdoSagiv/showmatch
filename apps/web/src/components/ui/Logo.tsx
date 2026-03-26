'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/gameStore';
import { getSocket } from '@/lib/socket';
import { clearSession } from '@/lib/session';
import Modal from './Modal';
import Button from './Button';

interface LogoProps {
  size?: 'sm' | 'lg';
  /** Override font size (e.g. 'clamp(3rem,10vw,6rem)') */
  fontSize?: string;
}

export default function Logo({ size = 'sm', fontSize }: LogoProps) {
  const textSize = size === 'lg' ? 'text-[3.5rem] md:text-[4rem]' : 'text-2xl';
  const router = useRouter();
  const { room, reset, playerId } = useGameStore();

  // ── Leave-game confirm ──
  const [showConfirm, setShowConfirm] = useState(false);

  const isInGame = !!room;

  const handleClick = (e: React.MouseEvent) => {
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
    clearSession();
    reset();
    setShowConfirm(false);
    router.push('/');
  };

  return (
    <>
      <motion.a
        href="/"
        onClick={handleClick}
        className="flex items-center gap-2 cursor-pointer"
        style={{ textDecoration: 'none' }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.5, stiffness: 400, damping: 22 }}
      >
        <span
          className={`font-bold ${fontSize ? '' : textSize} tracking-tight`}
          style={fontSize ? { fontSize } : undefined}
        >
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
    </>
  );
}
