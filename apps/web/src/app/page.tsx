'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CreateGameButton from '@/components/landing/CreateGameButton';
import { clearSession } from '@/lib/session';
import JoinGameForm from '@/components/landing/JoinGameForm';
import GameHistoryButton from '@/components/landing/GameHistoryButton';
import Logo from '@/components/ui/Logo';
import CreditLink from '@/components/ui/CreditLink';

/** Decorative poster cards for the right panel (TMDB public CDN) */
const POSTER_CARDS = [
  { path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg', rotate: -11, cx: -115, cy: -55, z: 1, delay: 0.1 },
  { path: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', rotate:   5, cx:  55, cy: -80, z: 4, delay: 0.4 },
  { path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', rotate:  -4, cx: -30, cy:  75, z: 3, delay: 0.2 },
  { path: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', rotate:  14, cx: 140, cy:  30, z: 2, delay: 0.6 },
];

const STEPS = [
  { emoji: '🎬', label: 'Pick the vibe',     desc: "Set the genre, era, and whether you're feeling movies or shows." },
  { emoji: '👆', label: 'Swipe together',   desc: 'Everyone in the room votes on the same titles in real time.' },
  { emoji: '🎉', label: 'Watch together',  desc: "Mutual likes win, and the crowd's pick is revealed live." },
];

export default function Home() {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    // User reached home intentionally — clear any stale reconnect session
    clearSession();
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
          style={{ background: 'radial-gradient(ellipse, rgba(229,9,20,0.26) 0%, transparent 65%)' }}
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 -right-32 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(109,40,217,0.18) 0%, transparent 65%)' }}
          animate={{ scale: [1.1, 1, 1.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute top-1/3 -left-24 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(255,107,53,0.32) 0%, transparent 65%)' }}
          animate={{ scale: [1, 1.15, 1] }}
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
            initial={{ y: 28 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 24 }}
          >
            {/* Logo */}
            <div className="flex flex-col items-center mb-8 lg:mb-10">
              <Logo fontSize="clamp(3rem, 10vw, 6rem)" />
              <p className="mt-3 text-xs text-white/55 tracking-[0.3em] uppercase font-semibold text-center">
                Swipe · Match · Watch
              </p>
            </div>

            {/* How it works — unified step cards with staggered slide-in */}
            <div className="w-full mb-7 lg:mb-10 flex flex-col gap-2.5">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.label}
                  className="flex items-center gap-3 px-4 py-3.5 lg:px-5 lg:py-4 rounded-2xl relative overflow-hidden"
                  style={{ background: 'rgba(8,8,15,0.92)', border: '1px solid rgba(255,255,255,0.07)' }}
                  initial={{ x: -40 }}
                  animate={{ x: 0 }}
                  transition={{ delay: 0.05 + i * 0.08, type: 'spring', stiffness: 280, damping: 26 }}
                >
                  {/* Subtle left accent bar */}
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full"
                    style={{ background: 'linear-gradient(to bottom, #e50914, #ff6b35)' }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 0.2 + i * 0.12, duration: 0.4, ease: 'easeOut' }}
                  />

                  {/* Step number */}
                  <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black text-primary"
                    style={{ background: 'rgba(229,9,20,0.15)', border: '1px solid rgba(229,9,20,0.35)' }}>
                    {i + 1}
                  </div>

                  {/* Emoji */}
                  <span className="text-xl lg:text-2xl shrink-0">{step.emoji}</span>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm leading-snug">{step.label}</p>
                    <p className="text-gray-400 text-[11px] lg:text-xs mt-0.5 leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Action buttons */}
            <motion.div
              className="flex flex-col gap-3"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 240, damping: 24 }}
            >
              <CreateGameButton />

              <div className="flex items-center gap-3 text-gray-400 text-xs my-1">
                <div className="flex-1 h-px bg-white/15" />
                <span className="tracking-widest uppercase">or</span>
                <div className="flex-1 h-px bg-white/15" />
              </div>

              <JoinGameForm />
            </motion.div>

            <motion.div
              className="mt-5 flex justify-center"
              initial={{ y: 10 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 26 }}
            >
              <GameHistoryButton />
            </motion.div>

            <div className="mt-4 pb-4 flex justify-center">
              <CreditLink />
            </div>
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
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-400 tracking-widest uppercase whitespace-nowrap"
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
