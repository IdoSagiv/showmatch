'use client';

import { motion } from 'framer-motion';

interface UndoButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export default function UndoButton({ onClick, disabled }: UndoButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className="w-10 h-10 rounded-full bg-dark-surface border border-dark-border flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
      whileTap={{ scale: 0.9 }}
      title="Undo last swipe"
    >
      &#8617;
    </motion.button>
  );
}
