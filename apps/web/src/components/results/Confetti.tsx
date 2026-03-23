'use client';

import { useEffect } from 'react';

export default function Confetti() {
  useEffect(() => {
    import('canvas-confetti').then(mod => {
      const confetti = mod.default;
      const duration = 1500;
      const end = Date.now() + duration;

      // Burst from both sides — useWorker:false for mobile compat
      // (cast to any to bypass outdated type definitions)
      const fire = (opts: object) =>
        (confetti as any)({
          particleCount: 4,
          spread: 55,
          ticks: 150,
          gravity: 1.4,
          scalar: 1.0,
          colors: ['#e50914', '#ffd700', '#00c853', '#ffffff', '#ff69b4'],
          disableForReducedMotion: true,
          useWorker: false,
          ...opts,
        });

      const frame = () => {
        fire({ angle: 60, origin: { x: 0, y: 0.6 } });
        fire({ angle: 120, origin: { x: 1, y: 0.6 } });
        if (Date.now() < end) requestAnimationFrame(frame);
      };

      // Initial burst (lighter than before)
      (confetti as any)({
        particleCount: 50,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#e50914', '#ffd700', '#00c853'],
        disableForReducedMotion: true,
        useWorker: false,
      });

      frame();
    });
  }, []);

  return null;
}
