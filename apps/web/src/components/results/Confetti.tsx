'use client';

import { useEffect } from 'react';

export default function Confetti() {
  useEffect(() => {
    import('canvas-confetti').then(mod => {
      const confetti = mod.default;
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#e50914', '#ffd700', '#00c853'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#e50914', '#ffd700', '#00c853'],
        });

        if (Date.now() < end) requestAnimationFrame(frame);
      };

      frame();
    });
  }, []);

  return null;
}
