'use client';

import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface YearRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

const currentYear = new Date().getFullYear();

const PRESETS: { label: string; range: [number, number] }[] = [
  { label: 'All',   range: [1950, currentYear] },
  { label: '90s+',  range: [1990, currentYear] },
  { label: '2000s+', range: [2000, currentYear] },
  { label: '2010s+', range: [2010, currentYear] },
  { label: 'Recent', range: [2018, currentYear] },
];

export default function YearRangeSlider({ min, max, value, onChange }: YearRangeSliderProps) {
  const [lo, hi] = value;
  const step = 1;

  const loPercent = ((lo - min) / (max - min)) * 100;
  const hiPercent = ((hi - min) / (max - min)) * 100;

  const handleLoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Math.min(Number(e.target.value), hi - step);
    onChange([next, hi]);
  }, [hi, onChange]);

  const handleHiChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Math.max(Number(e.target.value), lo + step);
    onChange([lo, next]);
  }, [lo, onChange]);

  const activePreset = PRESETS.find(p => p.range[0] === lo && p.range[1] === hi);

  return (
    <div className="space-y-4">
      {/* Preset pills */}
      <div className="flex gap-1.5 flex-wrap">
        {PRESETS.map(p => {
          const active = p.range[0] === lo && p.range[1] === hi;
          return (
            <motion.button
              key={p.label}
              onClick={() => onChange(p.range)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                active
                  ? 'bg-primary text-white shadow-[0_0_12px_rgba(229,9,20,0.4)]'
                  : 'bg-dark-surface border border-dark-border text-gray-400 hover:border-primary/40 hover:text-gray-200'
              }`}
              whileTap={{ scale: 0.92 }}
            >
              {p.label}
            </motion.button>
          );
        })}
      </div>

      {/* Slider track + thumbs */}
      <div className="relative pt-8 pb-1">
        {/* Lo thumb bubble — positioned using exact thumb-offset formula */}
        <div
          className="absolute top-0 flex flex-col items-center pointer-events-none"
          style={{ left: `calc(${loPercent}% + ${10 - loPercent * 0.2}px)`, transform: 'translateX(-50%)' }}
        >
          <div className="bg-primary text-white text-[11px] font-black px-2 py-0.5 rounded-lg tabular-nums" style={{ boxShadow: '0 2px 12px rgba(229,9,20,0.5)' }}>
            {lo}
          </div>
          <div className="w-0.5 h-1.5 bg-primary/60" />
        </div>

        {/* Hi thumb bubble */}
        <div
          className="absolute top-0 flex flex-col items-center pointer-events-none"
          style={{ left: `calc(${hiPercent}% + ${10 - hiPercent * 0.2}px)`, transform: 'translateX(-50%)' }}
        >
          <div className="bg-primary text-white text-[11px] font-black px-2 py-0.5 rounded-lg tabular-nums" style={{ boxShadow: '0 2px 12px rgba(229,9,20,0.5)' }}>
            {hi}
          </div>
          <div className="w-0.5 h-1.5 bg-primary/60" />
        </div>

        {/* Track */}
        <div className="relative h-2 w-full rounded-full bg-dark-border">
          {/* Filled range — gradient */}
          <div
            className="absolute h-full rounded-full"
            style={{
              left: `${loPercent}%`,
              right: `${100 - hiPercent}%`,
              background: 'linear-gradient(90deg, #e50914, #ff6b35)',
              boxShadow: '0 0 8px rgba(229,9,20,0.4)',
            }}
          />
        </div>

        {/* Lo slider input */}
        <input
          type="range"
          min={min} max={max} step={step} value={lo}
          onChange={handleLoChange}
          className="absolute inset-x-0 w-full appearance-none bg-transparent cursor-pointer range-thumb"
          style={{ top: 'calc(2rem - 1px)', zIndex: lo > max - (max - min) * 0.1 ? 5 : 3 }}
        />
        {/* Hi slider input */}
        <input
          type="range"
          min={min} max={max} step={step} value={hi}
          onChange={handleHiChange}
          className="absolute inset-x-0 w-full appearance-none bg-transparent cursor-pointer range-thumb"
          style={{ top: 'calc(2rem - 1px)', zIndex: 4 }}
        />
      </div>

      {/* Min/max labels */}
      <div className="flex justify-between text-xs text-gray-600 -mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
