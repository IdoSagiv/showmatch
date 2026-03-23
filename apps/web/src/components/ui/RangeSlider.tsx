'use client';

import { useRef, useCallback } from 'react';

interface RangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
}

export default function RangeSlider({ min, max, value, onChange, step = 1 }: RangeSliderProps) {
  const [lo, hi] = value;
  const trackRef = useRef<HTMLDivElement>(null);

  const loPercent = ((lo - min) / (max - min)) * 100;
  const hiPercent = ((hi - min) / (max - min)) * 100;

  const handleLoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Math.min(Number(e.target.value), hi - step);
    onChange([next, hi]);
  }, [hi, step, onChange]);

  const handleHiChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Math.max(Number(e.target.value), lo + step);
    onChange([lo, next]);
  }, [lo, step, onChange]);

  return (
    <div className="relative w-full">
      {/* Track background */}
      <div ref={trackRef} className="relative h-1.5 w-full rounded-full bg-dark-border">
        {/* Filled range */}
        <div
          className="absolute h-full rounded-full bg-primary"
          style={{ left: `${loPercent}%`, right: `${100 - hiPercent}%` }}
        />
      </div>

      {/* Sliders stacked — z-index ensures the correct one is on top near edges */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={lo}
        onChange={handleLoChange}
        className="absolute inset-0 w-full appearance-none bg-transparent cursor-pointer range-thumb"
        style={{ zIndex: lo > max - (max - min) * 0.1 ? 5 : 3 }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={hi}
        onChange={handleHiChange}
        className="absolute inset-0 w-full appearance-none bg-transparent cursor-pointer range-thumb"
        style={{ zIndex: 4 }}
      />
    </div>
  );
}
