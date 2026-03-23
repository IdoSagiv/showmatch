'use client';

const SOUND_FILES = {
  like: '/sounds/like.mp3',
  pass: '/sounds/pass.mp3',
  superlike: '/sounds/superlike.mp3',
  match: '/sounds/match.mp3',
  victory: '/sounds/victory.mp3',
  flip: '/sounds/flip.mp3',
  tick: '/sounds/tick.mp3',
  timeout: '/sounds/timeout.mp3',
  wildcard: '/sounds/wildcard.mp3',
} as const;

export type SoundName = keyof typeof SOUND_FILES;

export { SOUND_FILES };
