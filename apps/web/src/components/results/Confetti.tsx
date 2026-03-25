'use client';

import { useEffect } from 'react';

export default function Confetti() {
  useEffect(() => {
    // Slight delay so the reveal animation completes and the page is scrolled to top
    const delay = setTimeout(() => {
      // Scroll to top so confetti is visible (page may have content below)
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });

      import('canvas-confetti').then(mod => {
        const confetti = mod.default;
        const duration = 2500;
        const end = Date.now() + duration;

        // Burst from both sides — useWorker:false for mobile compat
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
          fire({ angle: 60, origin: { x: 0, y: 0.65 } });
          fire({ angle: 120, origin: { x: 1, y: 0.65 } });
          if (Date.now() < end) requestAnimationFrame(frame);
        };

        // Big initial burst from the center
        (confetti as any)({
          particleCount: 120,
          spread: 100,
          origin: { y: 0.55 },
          colors: ['#e50914', '#ffd700', '#00c853', '#ffffff'],
          disableForReducedMotion: true,
          useWorker: false,
        });

        frame();
      });
    }, 300);

    return () => clearTimeout(delay);
  }, []);

  return null;
}
