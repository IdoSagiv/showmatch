'use client';

import { useRef, useEffect, useCallback } from 'react';
import { Howl } from 'howler';
import { SOUND_FILES, type SoundName } from '@/lib/sounds';

const MUTE_KEY = 'showmatch-muted';

export function useSound() {
  const soundsRef = useRef<Record<string, Howl>>({});
  const mutedRef = useRef(false);

  useEffect(() => {
    mutedRef.current = localStorage.getItem(MUTE_KEY) === 'true';

    // Preload all sounds
    for (const [name, src] of Object.entries(SOUND_FILES)) {
      soundsRef.current[name] = new Howl({
        src: [src],
        volume: 0.5,
        preload: true,
      });
    }

    return () => {
      Object.values(soundsRef.current).forEach(s => s.unload());
    };
  }, []);

  const play = useCallback((name: SoundName) => {
    if (mutedRef.current) return;
    soundsRef.current[name]?.play();
  }, []);

  const toggleMute = useCallback(() => {
    mutedRef.current = !mutedRef.current;
    localStorage.setItem(MUTE_KEY, String(mutedRef.current));
    return mutedRef.current;
  }, []);

  const isMuted = useCallback(() => mutedRef.current, []);

  return {
    playLike: () => play('like'),
    playPass: () => play('pass'),
    playSuperLike: () => play('superlike'),
    playMatch: () => play('match'),
    playVictory: () => play('victory'),
    playFlip: () => play('flip'),
    playTick: () => play('tick'),
    playTimeout: () => play('timeout'),
    playWildcard: () => play('wildcard'),
    toggleMute,
    isMuted,
  };
}
