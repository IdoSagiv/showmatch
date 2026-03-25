'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';

// ── Demo card ─────────────────────────────────────────────────────────────────
function DemoCard({
  cardControls,
  frontControls,
  backControls,
  stampControls,
  stamp,
}: {
  cardControls: ReturnType<typeof useAnimationControls>;
  frontControls: ReturnType<typeof useAnimationControls>;
  backControls: ReturnType<typeof useAnimationControls>;
  stampControls: ReturnType<typeof useAnimationControls>;
  stamp: 'like' | 'nope' | 'super' | null;
}) {
  const stampStyle = {
    like:  { label: 'LIKE',       color: '#22c55e', rotate: -22 },
    nope:  { label: 'NOPE',       color: '#e50914', rotate:  18 },
    super: { label: 'SUPER LIKE', color: '#ffd700', rotate: -18 },
  };
  const s = stamp ? stampStyle[stamp] : null;

  return (
    <div className="relative flex items-center justify-center" style={{ height: 220 }}>
      {/* The card */}
      <motion.div
        animate={cardControls}
        style={{ width: 140, height: 200, borderRadius: 18, transformOrigin: 'bottom center', perspective: 1000 }}
        className="relative cursor-pointer"
      >
        {/* Front face */}
        <motion.div
          animate={frontControls}
          initial={{ rotateY: 0 }}
          style={{ position: 'absolute', inset: 0, borderRadius: 18, backfaceVisibility: 'hidden' }}
        >
          {/* Poster gradient */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 18,
            background: 'linear-gradient(160deg, #2d1b4e 0%, #1a0a2e 40%, #0d0d1a 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden',
          }}>
            {/* Fake poster shimmer */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '65%',
              background: 'linear-gradient(135deg, rgba(109,40,217,0.6) 0%, rgba(229,9,20,0.4) 100%)',
            }} />
            {/* Fake title area */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 12px 12px' }}>
              <div style={{ height: 10, width: '70%', borderRadius: 5, background: 'rgba(255,255,255,0.8)', marginBottom: 6 }} />
              <div style={{ height: 7, width: '45%', borderRadius: 4, background: 'rgba(255,255,255,0.35)' }} />
            </div>
            {/* Fake rating badge */}
            <div style={{
              position: 'absolute', top: 10, right: 10,
              background: 'rgba(0,0,0,0.7)', borderRadius: 8, padding: '3px 7px',
              fontSize: 10, fontWeight: 700, color: '#ffd700',
            }}>
              ★ 8.4
            </div>
          </div>
        </motion.div>

        {/* Back face */}
        <motion.div
          animate={backControls}
          initial={{ rotateY: 180 }}
          style={{ position: 'absolute', inset: 0, borderRadius: 18, backfaceVisibility: 'hidden' }}
        >
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 18,
            background: 'linear-gradient(160deg, #1a2744 0%, #0f1a2e 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '14px 12px',
          }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 8, letterSpacing: 2, textTransform: 'uppercase' }}>Details</div>
            {[90, 65, 80, 55].map((w, i) => (
              <div key={i} style={{ height: 6, width: `${w}%`, borderRadius: 3, background: 'rgba(255,255,255,0.15)', marginBottom: 7 }} />
            ))}
            <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
              {['Drama', 'Thriller'].map(g => (
                <div key={g} style={{ fontSize: 9, padding: '2px 7px', borderRadius: 20, background: 'rgba(229,9,20,0.2)', border: '1px solid rgba(229,9,20,0.4)', color: '#ff6b6b' }}>{g}</div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stamp overlay */}
        {s && (
          <motion.div
            animate={stampControls}
            initial={{ opacity: 0, scale: 0.6 }}
            style={{
              position: 'absolute', inset: 0, borderRadius: 18, zIndex: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <div style={{
              border: `3px solid ${s.color}`,
              borderRadius: 8,
              padding: '4px 10px',
              transform: `rotate(${s.rotate}deg)`,
              color: s.color,
              fontSize: 16,
              fontWeight: 900,
              letterSpacing: '0.15em',
              textShadow: `0 0 20px ${s.color}88`,
              boxShadow: `0 0 20px ${s.color}44`,
            }}>
              {s.label}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Arrow hint */}
      {stamp === 'like' && (
        <motion.div
          animate={{ x: [0, 12, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
          style={{ position: 'absolute', right: 24, fontSize: 22, top: '50%', transform: 'translateY(-50%)' }}
        >→</motion.div>
      )}
      {stamp === 'nope' && (
        <motion.div
          animate={{ x: [0, -12, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
          style={{ position: 'absolute', left: 24, fontSize: 22, top: '50%', transform: 'translateY(-50%)' }}
        >←</motion.div>
      )}
      {stamp === 'super' && (
        <motion.div
          animate={{ y: [0, -10, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: 4, fontSize: 18 }}
        >↑</motion.div>
      )}
    </div>
  );
}

// ── Steps ─────────────────────────────────────────────────────────────────────
interface Step {
  title: string;
  description: string;
  stamp: 'like' | 'nope' | 'super' | null;
  runAnimation: (
    cardCtrl: ReturnType<typeof useAnimationControls>,
    frontCtrl: ReturnType<typeof useAnimationControls>,
    backCtrl: ReturnType<typeof useAnimationControls>,
    stampCtrl: ReturnType<typeof useAnimationControls>,
  ) => Promise<void>;
}

const STEPS: Step[] = [
  {
    title: 'Swipe Right to Like',
    description: "Like what you see? Swipe right. When everyone agrees — it's a match.",
    stamp: 'like',
    runAnimation: async (card, _f, _b, stamp) => {
      await card.start({ x: 0, rotate: 0, transition: { duration: 0 } });
      await stamp.start({ opacity: 0, scale: 0.6, transition: { duration: 0 } });
      await new Promise(r => setTimeout(r, 500));
      // Slide right — stamp appears, but card stays visible
      await Promise.all([
        card.start({ x: 90, rotate: 14, transition: { type: 'spring', stiffness: 200, damping: 20 } }),
        stamp.start({ opacity: 1, scale: 1, transition: { duration: 0.2 } }),
      ]);
      await new Promise(r => setTimeout(r, 700));
      // Spring back
      await Promise.all([
        card.start({ x: 0, rotate: 0, transition: { type: 'spring', stiffness: 300, damping: 22 } }),
        stamp.start({ opacity: 0, transition: { duration: 0.2 } }),
      ]);
      await new Promise(r => setTimeout(r, 600));
    },
  },
  {
    title: 'Swipe Left to Pass',
    description: "Not feeling it? Swipe left to skip. Tap the undo button to take it back.",
    stamp: 'nope',
    runAnimation: async (card, _f, _b, stamp) => {
      await card.start({ x: 0, rotate: 0, transition: { duration: 0 } });
      await stamp.start({ opacity: 0, scale: 0.6, transition: { duration: 0 } });
      await new Promise(r => setTimeout(r, 500));
      // Slide left — stamp appears, card stays visible
      await Promise.all([
        card.start({ x: -90, rotate: -14, transition: { type: 'spring', stiffness: 200, damping: 20 } }),
        stamp.start({ opacity: 1, scale: 1, transition: { duration: 0.2 } }),
      ]);
      await new Promise(r => setTimeout(r, 700));
      // Spring back
      await Promise.all([
        card.start({ x: 0, rotate: 0, transition: { type: 'spring', stiffness: 300, damping: 22 } }),
        stamp.start({ opacity: 0, transition: { duration: 0.2 } }),
      ]);
      await new Promise(r => setTimeout(r, 600));
    },
  },
  {
    title: 'Super Like',
    description: 'One per game. Guarantees this title makes the final round. Use it wisely.',
    stamp: 'super',
    runAnimation: async (card, _f, _b, stamp) => {
      await card.start({ y: 0, scale: 1, transition: { duration: 0 } });
      await stamp.start({ opacity: 0, scale: 0.6, transition: { duration: 0 } });
      await new Promise(r => setTimeout(r, 500));
      // Slide up — stamp appears, card stays visible
      await Promise.all([
        card.start({ y: -80, scale: 1.06, transition: { type: 'spring', stiffness: 200, damping: 20 } }),
        stamp.start({ opacity: 1, scale: 1, transition: { duration: 0.2 } }),
      ]);
      await new Promise(r => setTimeout(r, 700));
      // Spring back
      await Promise.all([
        card.start({ y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 22 } }),
        stamp.start({ opacity: 0, transition: { duration: 0.2 } }),
      ]);
      await new Promise(r => setTimeout(r, 600));
    },
  },
  {
    title: 'Tap to See Details',
    description: 'Tap the card to flip it. See the full description, cast, and streaming info.',
    stamp: null,
    runAnimation: async (card, front, back, _stamp) => {
      await front.start({ rotateY: 0, transition: { duration: 0 } });
      await back.start({ rotateY: 180, transition: { duration: 0 } });
      await new Promise(r => setTimeout(r, 500));
      await front.start({ rotateY: -90, transition: { duration: 0.2, ease: 'easeIn' } });
      await back.start({ rotateY: 90, transition: { duration: 0 } });
      await back.start({ rotateY: 0, transition: { duration: 0.2, ease: 'easeOut' } });
      await new Promise(r => setTimeout(r, 1200));
      await back.start({ rotateY: 90, transition: { duration: 0.2, ease: 'easeIn' } });
      await front.start({ rotateY: -90, transition: { duration: 0 } });
      await front.start({ rotateY: 0, transition: { duration: 0.2, ease: 'easeOut' } });
      await new Promise(r => setTimeout(r, 600));
    },
  },
];

// ── Main component ─────────────────────────────────────────────────────────────
interface TutorialOverlayProps {
  onDismiss: () => void;
  forceShow?: boolean;
}

export default function TutorialOverlay({ onDismiss, forceShow }: TutorialOverlayProps) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1); // 1 = forward, -1 = back
  const [running, setRunning] = useState(false);

  const cardCtrl  = useAnimationControls();
  const frontCtrl = useAnimationControls();
  const backCtrl  = useAnimationControls();
  const stampCtrl = useAnimationControls();

  useEffect(() => {
    if (!localStorage.getItem('showmatch-tutorial-seen')) setVisible(true);
  }, []);

  useEffect(() => {
    if (forceShow) { setStep(0); setVisible(true); }
  }, [forceShow]);

  // Loop animation for current step
  const loopRef = { current: true };
  useEffect(() => {
    if (!visible) return;
    loopRef.current = true;
    let cancelled = false;

    const loop = async () => {
      while (!cancelled) {
        await STEPS[step].runAnimation(cardCtrl, frontCtrl, backCtrl, stampCtrl);
        if (cancelled) break;
      }
    };
    loop();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, visible]);

  const handleNext = useCallback(() => {
    if (step >= STEPS.length - 1) {
      localStorage.setItem('showmatch-tutorial-seen', 'true');
      setVisible(false);
      onDismiss();
    } else {
      setDirection(1);
      setStep(s => s + 1);
    }
  }, [step, onDismiss]);

  const handleBack = useCallback(() => {
    if (step > 0) {
      setDirection(-1);
      setStep(s => s - 1);
    }
  }, [step]);

  const handleSkip = useCallback(() => {
    localStorage.setItem('showmatch-tutorial-seen', 'true');
    setVisible(false);
    onDismiss();
  }, [onDismiss]);

  if (!visible) return null;

  const current = STEPS[step];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-5"
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleNext}
      >
        <motion.div
          className="relative w-full max-w-xs rounded-3xl overflow-hidden"
          style={{ background: 'rgba(10,9,25,0.95)', border: '1px solid rgba(255,255,255,0.08)' }}
          initial={{ scale: 0.92, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Skip button */}
          <button
            onClick={handleSkip}
            style={{
              position: 'absolute', top: 14, right: 16, zIndex: 10,
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 20, width: 28, height: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.45)', fontSize: 14, cursor: 'pointer', lineHeight: 1,
            }}
            aria-label="Skip tutorial"
          >
            ✕
          </button>

          {/* Demo area */}
          <div className="relative px-6 pt-8 pb-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 * direction }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 * direction }}
                transition={{ duration: 0.2 }}
              >
                <DemoCard
                  cardControls={cardCtrl}
                  frontControls={frontCtrl}
                  backControls={backCtrl}
                  stampControls={stampCtrl}
                  stamp={current.stamp}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Text area */}
          <div className="px-6 pb-7 pt-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 16 * direction }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 * direction }}
                transition={{ duration: 0.22 }}
              >
                <h3 className="text-white font-black text-xl mb-2 leading-tight">{current.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{current.description}</p>
              </motion.div>
            </AnimatePresence>

            {/* Progress dots */}
            <div className="flex gap-1.5 mt-5 mb-5">
              {STEPS.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ width: i === step ? 20 : 6, background: i === step ? '#e50914' : 'rgba(255,255,255,0.2)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  style={{ height: 6, borderRadius: 3 }}
                />
              ))}
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              {step > 0 && (
                <motion.button
                  onClick={handleBack}
                  className="py-3.5 rounded-2xl font-black text-sm tracking-wide"
                  style={{
                    width: 52, flexShrink: 0,
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'rgba(255,255,255,0.6)',
                  }}
                  whileTap={{ scale: 0.96 }}
                  aria-label="Previous step"
                >
                  ←
                </motion.button>
              )}
              <motion.button
                onClick={handleNext}
                className="flex-1 py-3.5 rounded-2xl font-black text-sm text-white tracking-wide"
                style={{
                  background: 'linear-gradient(135deg, #e50914 0%, #ff4b2b 60%, #ff6b35 100%)',
                  boxShadow: '0 4px 20px rgba(229,9,20,0.4)',
                }}
                whileTap={{ scale: 0.96 }}
              >
                {step >= STEPS.length - 1 ? 'Got it!' : 'Next →'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function TutorialReplayButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-2 py-1 rounded-lg hover:bg-dark-surface"
      title="How to play"
    >
      how to play?
    </button>
  );
}
