'use client';

import { useState, useEffect, useRef } from 'react';
import type { GameSettings } from '@/types/game';

interface FilterPreviewProps {
  settings: GameSettings;
}

export default function FilterPreview({ settings }: FilterPreviewProps) {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('count_only', 'true');
        params.set('media_types', settings.mediaTypes.join(','));
        if (settings.providers.length > 0) params.set('providers', settings.providers.join('|'));
        if (settings.genres.length > 0) params.set('genres', settings.genres.join('|'));
        params.set('min_rating', settings.minRating.toString());
        params.set('region', settings.region);
        if (settings.language) params.set('language', settings.language);
        params.set('year_from', settings.yearRange[0].toString());
        params.set('year_to', settings.yearRange[1].toString());
        params.set('sort_by', settings.sortBy);

        const res = await fetch(`/api/tmdb/discover?${params}`);
        const data = await res.json();
        setCount(data.count);
      } catch {
        setCount(null);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [settings]);

  return (
    <div className="bg-dark-surface rounded-xl px-4 py-3 text-center">
      {loading ? (
        <span className="text-sm text-gray-400 animate-pulse">Counting titles...</span>
      ) : count === null ? (
        <span className="text-sm text-gray-500">--</span>
      ) : count === 0 ? (
        <span className="text-sm text-accent-red">No titles match — try broadening your filters</span>
      ) : (
        <span className="text-sm">
          <span className="font-bold text-primary">{count.toLocaleString()}</span>
          <span className="text-gray-400"> titles match your filters</span>
        </span>
      )}
    </div>
  );
}
