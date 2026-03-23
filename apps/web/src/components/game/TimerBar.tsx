'use client';

import { useEffect, useState, useRef } from 'react';

interface TimerBarProps {
  seconds: number;
  isPaused: boolean;
  onExpired: () => void;
  cardKey: number;
}

export default function TimerBar({ seconds, isPaused, onExpired, cardKey }: TimerBarProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => { setTimeLeft(seconds); }, [cardKey, seconds]);

  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) { clearInterval(intervalRef.current); onExpired(); return 0; }
        return prev - 0.1;
      });
    }, 100);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPaused, cardKey, onExpired]);

  const pct = (timeLeft / seconds) * 100;
  const urgent = pct <= 30;

  return (
    <div className="w-full mt-0.5">
      {/* Thin accent strip — lives directly under the progress bar as one visual unit */}
      <div className="h-[3px] bg-dark-border/50 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-100 ${urgent ? 'bg-accent-red' : 'bg-accent-gold'}`}
          style={{ width: `${pct}%`, boxShadow: urgent ? '0 0 6px rgba(255,23,68,0.8)' : '0 0 4px rgba(255,215,0,0.5)' }}
        />
      </div>
      {/* Urgent countdown text only in last 5s */}
      {timeLeft <= 5 && timeLeft > 0 && (
        <p className="text-right text-[11px] text-accent-red font-bold mt-0.5 animate-pulse tabular-nums">
          {Math.ceil(timeLeft)}s
        </p>
      )}
    </div>
  );
}
