'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CreateGameButton from '@/components/landing/CreateGameButton';
import JoinGameForm from '@/components/landing/JoinGameForm';
import GameHistoryButton from '@/components/landing/GameHistoryButton';

/** Decorative poster cards for the right panel (TMDB public CDN) */
const POSTER_CARDS = [
  { path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg', rotate: -11, cx: -115, cy: -55, z: 1, delay: 0.1 },
  { path: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', rotate:   5, cx:  55, cy: -80, z: 4, delay: 0.4 },
  { path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', rotate:  -4, cx: -30, cy:  75, z: 3, delay: 0.2 },
  { path: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', rotate:  14, cx: 140, cy:  30, z: 2, delay: 0.6 },
];

const STEPS = [
  { emoji: '🎬', label: 'Pick a vibe',      desc: "Set the genre, era, and whether you're feeling movies or shows." },
  { emoji: '👆', label: 'Swipe together',   desc: 'Everyone in the room votes on the same titles in real time.' },
  { emoji: '🎉', label: 'Watch the match',  desc: "Mutual likes win — the crowd's pick is revealed live." },
];

export default function Home() {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const msg = sessionStorage.getItem('showmatch-toast');
    if (msg) {
      setToast(msg);
      sessionStorage.removeItem('showmatch-toast');
      setTimeout(() => setToast(null), 4000);
    }
  }, []);

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col">

      {/* ── Atmospheric blobs ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-32 left-1/3 w-[700px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(229,9,20,0.40) 0%, transparent 65%)' }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 -right-32 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(109,40,217,0.28) 0%, transparent 65%)' }}
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute top-1/3 -left-24 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(255,107,53,0.22) 0%, transparent 65%)' }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        />
      </div>

      {/* ── Two-pane layout ── */}
      {/*  mobile: flex-col (only left pane shows)            */}
      {/*  desktop (lg+): flex-row, left + right side by side */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-stretch">

        {/* ═══ LEFT PANE: Brand + CTAs ═══ */}
        <div className="flex-1 flex flex-col items-center justify-center px-5 py-12 lg:pl-20 lg:pr-10">
          <motion.div
            className="w-full max-w-sm lg:max-w-md"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 24 }}
          >
            {/* Logo */}
            <div className="text-center lg:text-left mb-8 lg:mb-10">
              <h1
                className="font-black tracking-tight leading-none"
                style={{ fontSize: 'clamp(3rem, 10vw, 6rem)' }}
              >
                <span className="text-white">Show</span>
                <span className="gradient-text">Match</span>
              </h1>
              <p className="mt-3 text-xs text-gray-500 tracking-[0.3em] uppercase font-semibold">
                Swipe · Match · Watch
              </p>
            </div>

            {/* How it works — compact row on mobile, full cards on desktop */}
            <motion.div
              className="w-full mb-7 lg:mb-10"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 220, damping: 26 }}
            >
              {/* Mobile: 3 compact horizontal tiles */}
              <div className="flex gap-2 lg:hidden">
                {STEPS.map((step) => (
                  <div
                    key={step.label}
                    className="flex-1 flex flex-col items-center gap-1.5 px-2 py-3 rounded-2xl text-center"
                    style={{ background: 'rgba(15,14,31,0.65)', border: '1px solid rgba(255,255,255,0.055)', backdropFilter: 'blur(12px)' }}
                  >
                    <span className="text-xl">{step.emoji}</span>
                    <p className="text-white text-[11px] font-bold leading-tight">{step.label}</p>
                  </div>
                ))}
              </div>

              {/* Desktop: full description cards */}
              <div className="hidden lg:flex flex-col gap-3">
                {STEPS.map((step, i) => (
                  <motion.div
                    key={step.label}
                    className="flex items-start gap-4 px-5 py-4 rounded-2xl"
                    style={{ background: 'rgba(15,14,31,0.6)', border: '1px solid rgba(255,255,255,0.055)', backdropFilter: 'blur(12px)' }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1, type: 'spring', stiffness: 240, damping: 26 }}
                  >
                    <span className="text-2xl leading-none mt-0.5 shrink-0">{step.emoji}</span>
                    <div>
                      <p className="text-white font-bold text-sm leading-snug">{step.label}</p>
                      <p className="text-gray-500 text-xs mt-1 leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Action buttons */}
            <motion.div
              className="flex flex-col gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, type: 'spring', stiffness: 240, damping: 24 }}
            >
              <CreateGameButton />

              <div className="flex items-center gap-3 text-gray-700 text-xs my-1">
                <div className="flex-1 h-px bg-dark-border" />
                <span className="tracking-widest uppercase">or</span>
                <div className="flex-1 h-px bg-dark-border" />
              </div>

              <JoinGameForm />
            </motion.div>

            <motion.div
              className="mt-5 flex justify-center lg:justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.42 }}
            >
              <GameHistoryButton />
            </motion.div>
          </motion.div>
        </div>

        {/* ═══ RIGHT PANE: Floating card fan — desktop only ═══ */}
        <div className="hidden lg:flex flex-1 items-center justify-center pr-16 relative">
          <div className="relative" style={{ width: 420, height: 520 }}>
            {POSTER_CARDS.map((card, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `calc(50% + ${card.cx}px)`,
                  top: `calc(50% + ${card.cy}px)`,
                  transform: `translate(-50%, -50%) rotate(${card.rotate}deg)`,
                  zIndex: card.z,
                  width: 176,
                  height: 264,
                }}
              >
                {/* Entrance */}
                <motion.div
                  className="w-full h-full"
                  initial={{ opacity: 0, scale: 0.78 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + card.delay, type: 'spring', stiffness: 160, damping: 20 }}
                >
                  {/* Bob */}
                  <motion.div
                    className="w-full h-full rounded-3xl overflow-hidden"
                    style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.07)' }}
                    animate={{ y: [0, -12, 0] }}
                    transition={{ duration: 3.8 + i * 0.6, repeat: Infinity, ease: 'easeInOut', delay: card.delay + 1.2 }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://image.tmdb.org/t/p/w342${card.path}`}
                      alt=""
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </motion.div>
                </motion.div>
              </div>
            ))}

            {/* Glow pool */}
            <div
              className="absolute bottom-12 left-1/2 -translate-x-1/2 w-72 h-6 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, rgba(229,9,20,0.45) 0%, transparent 70%)', filter: 'blur(14px)' }}
            />

            <motion.p
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-600 tracking-widest uppercase whitespace-nowrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
            >
              What will you pick tonight?
            </motion.p>
          </div>
        </div>

      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="fixed left-1/2 -translate-x-1/2 glass-card px-5 py-3 rounded-2xl text-sm z-50 whitespace-nowrap"
            style={{ top: 'max(1rem, env(safe-area-inset-top))' }}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
