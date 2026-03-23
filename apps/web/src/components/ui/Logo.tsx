'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/gameStore';
import { getSocket } from '@/lib/socket';
import Modal from './Modal';
import Button from './Button';

interface LogoProps {
  size?: 'sm' | 'lg';
}

export default function Logo({ size = 'sm' }: LogoProps) {
  const textSize = size === 'lg' ? 'text-5xl md:text-6xl' : 'text-2xl';
  const router = useRouter();
  const { room, reset } = useGameStore();
  const [showConfirm, setShowConfirm] = useState(false);

  const isInGame = room?.status === 'swiping' || room?.status === 'ranking';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isInGame) {
      setShowConfirm(true);
    } else {
      router.push('/');
    }
  };

  const handleLeave = () => {
    try {
      const socket = getSocket();
      socket.emit('leaveRoom');
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
        className="flex items-center gap-2 cursor-pointer"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
      >
        <span className={`font-bold ${textSize} tracking-tight`}>
          <span className="text-white">Show</span>
          <span className="text-primary">Match</span>
        </span>
      </motion.a>

      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Leave Game?">
        <p className="text-gray-400 mb-6">
          Are you sure you want to leave? Your progress will be lost.
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
