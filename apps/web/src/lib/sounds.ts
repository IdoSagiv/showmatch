'use client';

export const SOUND_FILES = {
  like:      '/sounds/like.mp3',
  pass:      '/sounds/pass.mp3',
  superlike: '/sounds/superlike.mp3',
  match:     '/sounds/match.mp3',
  victory:   '/sounds/victory.mp3',
  flip:      '/sounds/flip.mp3',
  tick:      '/sounds/tick.mp3',
  timeout:   '/sounds/timeout.mp3',
  wildcard:  '/sounds/wildcard.mp3',
} as const;

export type SoundName = keyof typeof SOUND_FILES;

// ---------- module-level singleton (no AudioContext, works on all mobile browsers) ----------

const cache: Partial<Record<SoundName, HTMLAudioElement>> = {};
let muted = false;

function getAudio(name: SoundName): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!cache[name]) {
    const el = new Audio(SOUND_FILES[name]);
    el.volume = 0.5;
    el.preload = 'auto';
    cache[name] = el;
  }
  return cache[name]!;
}

/** Play a sound. Safe to call anywhere (SSR-safe, catches autoplay errors silently). */
export function playSound(name: SoundName): void {
  if (typeof window === 'undefined' || muted) return;
  const el = getAudio(name);
  if (!el) return;
  el.currentTime = 0;
  el.play().catch(() => {});   // ignore NotAllowedError on browsers that need a gesture first
}

export function toggleMuteSound(): boolean {
  muted = !muted;
  try { localStorage.setItem('showmatch-muted', String(muted)); } catch {}
  return muted;
}

export function isSoundMuted(): boolean { return muted; }

// Restore mute preference from localStorage on first import
if (typeof window !== 'undefined') {
  try { muted = localStorage.getItem('showmatch-muted') === 'true'; } catch {}
}
