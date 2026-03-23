'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';

const STEPS = [
  {
    icon: '👉',
    title: 'Swipe Right',
    description: 'Swipe right if you want to watch this',
    animation: { x: [0, 80, 0] },
  },
  {
    icon: '👈',
    title: 'Swipe Left',
    description: 'Swipe left to skip',
    animation: { x: [0, -80, 0] },
  },
  {
    icon: '👆',
    title: 'Tap to Flip',
    description: 'Tap the card to see full details, cast, and trailer',
    animation: { scale: [1, 0.95, 1] },
  },
  {
    icon: '⭐',
    title: 'Super Like',
    description: 'Use your Super Like to guarantee a pick makes the final round!',
    animation: { y: [0, -20, 0], scale: [1, 1.2, 1] },
  },
];

interface TutorialOverlayProps {
  onDismiss: () => void;
  /** Set to true to force-show the tutorial (e.g. replay button). */
  forceShow?: boolean;
}

export default function TutorialOverlay({ onDismiss, forceShow }: TutorialOverlayProps) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  // Show on first visit
  useEffect(() => {
    const seen = localStorage.getItem('showmatch-tutorial-seen');
    if (!seen) {
      setVisible(true);
    }
  }, []);

  // Re-show when parent requests replay
  useEffect(() => {
    if (forceShow) {
      setStep(0);
      setVisible(true);
    }
  }, [forceShow]);

  const handleNext = () => {
    if (step >= STEPS.length - 1) {
      localStorage.setItem('showmatch-tutorial-seen', 'true');
      setVisible(false);
      onDismiss();
    } else {
      setStep(step + 1);
    }
  };

  if (!visible) return null;

  const current = STEPS[step];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          key={step}
          className="text-center max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <motion.div
            className="text-7xl mb-6"
            animate={current.animation}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          >
            {current.icon}
          </motion.div>

          <h3 className="text-2xl font-bold mb-3">{current.title}</h3>
          <p className="text-gray-400 mb-8">{current.description}</p>

          <div className="flex justify-center gap-2 mb-6">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${i === step ? 'bg-primary' : 'bg-dark-border'}`}
              />
            ))}
          </div>

          <Button onClick={handleNext} size="lg" className="min-w-[160px]">
            {step >= STEPS.length - 1 ? 'Got it!' : 'Next'}
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function TutorialReplayButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-8 h-8 rounded-full bg-dark-surface border border-dark-border text-primary hover:bg-dark-border transition-colors"
      title="How to play"
      aria-label="How to play"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="7" cy="7" r="6.25" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M7 10V6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="7" cy="4.5" r="0.75" fill="currentColor"/>
      </svg>
    </button>
  );
}
