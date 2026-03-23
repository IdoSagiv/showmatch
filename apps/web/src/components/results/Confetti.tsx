'use client';

import { useEffect } from 'react';

export default function Confetti() {
  useEffect(() => {
    import('canvas-confetti').then(mod => {
      const confetti = mod.default;
      const duration = 3500;
      const end = Date.now() + duration;

      // Burst from both sides — more particles, useWorker:false for mobile compat
      // (cast to any to bypass outdated type definitions)
      const fire = (opts: object) =>
        (confetti as any)({
          particleCount: 6,
          spread: 60,
          ticks: 200,
          gravity: 1.2,
          scalar: 1.1,
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

      // Initial big burst
      (confetti as any)({
        particleCount: 80,
        spread: 100,
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
