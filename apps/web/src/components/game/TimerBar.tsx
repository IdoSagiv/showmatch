'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface TimerBarProps {
  seconds: number;
  isPaused: boolean;
  onExpired: () => void;
  cardKey: number;
}

export default function TimerBar({ seconds, isPaused, onExpired, cardKey }: TimerBarProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setTimeLeft(seconds);
  }, [cardKey, seconds]);

  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          clearInterval(intervalRef.current);
          onExpired();
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, cardKey, onExpired]);

  const pct = (timeLeft / seconds) * 100;
  const color = pct > 60 ? 'bg-accent-green' : pct > 30 ? 'bg-yellow-500' : 'bg-accent-red';

  return (
    <div className="w-full">
      <div className="h-2 bg-dark-border rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
      {timeLeft <= 3 && timeLeft > 0 && (
        <p className="text-center text-accent-red text-xs mt-1 animate-pulse">
          {Math.ceil(timeLeft)}s
        </p>
      )}
    </div>
  );
}
