'use client';

import { useCallback } from 'react';
import { playSound, toggleMuteSound, isSoundMuted } from '@/lib/sounds';

export function useSound() {
  const play = useCallback((name: Parameters<typeof playSound>[0]) => playSound(name), []);

  return {
    playLike:      () => play('like'),
    playPass:      () => play('pass'),
    playSuperLike: () => play('superlike'),
    playMatch:     () => play('match'),
    playVictory:   () => play('victory'),
    playFlip:      () => play('flip'),
    playTick:      () => play('tick'),
    playTimeout:   () => play('timeout'),
    playWildcard:  () => play('wildcard'),
    toggleMute:    toggleMuteSound,
    isMuted:       isSoundMuted,
  };
}
