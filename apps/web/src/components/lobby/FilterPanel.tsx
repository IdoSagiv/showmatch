'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import type { GameSettings, StreamingProvider } from '@/types/game';
import { GENRES, CONTENT_RATINGS, TIMER_OPTIONS, SORT_OPTIONS } from '@/lib/constants';
import YearRangeSlider from '@/components/ui/YearRangeSlider';

interface FilterPanelProps {
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
  isCreator: boolean;
}

export default function FilterPanel({ settings, onSettingsChange, isCreator }: FilterPanelProps) {
  const [providers, setProviders] = useState<StreamingProvider[]>([]);
  const [providerTooltip, setProviderTooltip] = useState<string | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleProviderPointerDown = useCallback((name: string) => {
    longPressTimer.current = setTimeout(() => setProviderTooltip(name), 500);
  }, []);

  const handleProviderPointerUp = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = null;
  }, []);

  const handleProviderPointerLeave = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = null;
    setProviderTooltip(null);
  }, []);

  useEffect(() => {
    fetch('/api/tmdb/providers?region=US')
      .then(res => res.json())
      .then(data => setProviders(data))
      .catch(() => {});
  }, []);

  const update = useCallback((partial: Partial<GameSettings>) => {
    if (!isCreator) return;
    onSettingsChange({ ...settings, ...partial });
  }, [settings, onSettingsChange, isCreator]);

  const toggleInArray = (arr: number[], val: number) =>
    arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];

  const toggleInStringArray = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];

  if (!isCreator) {
    return (
      <div className="bg-dark-card rounded-2xl p-4 border border-dark-border">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Game Settings</h3>
        <div className="flex flex-wrap gap-2 text-sm text-gray-300">
          <span>Cards: {settings.poolSize === 'all' ? 'Marathon' : settings.poolSize}</span>
          <span>Rating: {settings.minRating}+</span>
          <span>{settings.yearRange[0]}-{settings.yearRange[1]}</span>
          {settings.firstMatchMode && <span className="text-accent-gold">First Match Mode</span>}
          {settings.timerSeconds && <span>{settings.timerSeconds}s timer</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-card rounded-2xl p-4 border border-dark-border space-y-5">
      <h3 className="text-lg font-bold">Settings</h3>

      {/* Media Type */}
      <div>
        <label className="text-sm text-gray-400 mb-2 block">Type</label>
        <div className="flex gap-2">
          {(['movie', 'tv'] as const).map(type => (
            <button
              key={type}
              onClick={() => {
                if (settings.mediaTypes.includes(type)) {
                  // Already active — if it's the only one, do nothing;
                  // if both are active, keep only this one.
                  if (settings.mediaTypes.length > 1) {
                    update({ mediaTypes: [type] });
                  }
                } else {
                  // Not active — add it back (both selected)
                  update({ mediaTypes: ['movie', 'tv'] });
                }
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                settings.mediaTypes.includes(type)
                  ? 'bg-primary text-white'
                  : 'bg-dark-surface text-gray-500 border border-dark-border'
              }`}
            >
              {type === 'movie' ? 'Movies' : 'TV Series'}
            </button>
          ))}
        </div>
      </div>

      {/* Streaming Providers */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm text-gray-400">Streaming Services</label>
          <div className="flex gap-2">
            <button onClick={() => update({ providers: providers.map(p => p.id) })} className="text-xs text-primary">All</button>
            <button onClick={() => update({ providers: [] })} className="text-xs text-gray-500">Clear</button>
          </div>
        </div>
        {/* Long-press tooltip */}
        {providerTooltip && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-xl shadow-lg border border-dark-border pointer-events-none">
            {providerTooltip}
          </div>
        )}

        <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
          {providers.map(p => (
            <button
              key={p.id}
              onClick={() => update({ providers: toggleInArray(settings.providers, p.id) })}
              onPointerDown={() => handleProviderPointerDown(p.name)}
              onPointerUp={handleProviderPointerUp}
              onPointerLeave={handleProviderPointerLeave}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                settings.providers.includes(p.id) ? 'bg-primary/20 ring-1 ring-primary' : 'bg-dark-surface'
              }`}
              title={p.name}
            >
              <img src={p.logoPath} alt={p.name} className="w-8 h-8 rounded-md" />
              <span className="text-[10px] text-gray-400 truncate w-full text-center">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Genres */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm text-gray-400">Genres</label>
          <div className="flex gap-2">
            <button
              onClick={() => update({ genres: [] })}
              className={`text-xs transition-colors ${settings.genres.length === 0 ? 'text-primary font-semibold' : 'text-gray-500 hover:text-primary'}`}
            >
              All
            </button>
            {settings.genres.length > 0 && (
              <button
                onClick={() => update({ genres: [] })}
                className="text-xs text-gray-500 hover:text-white transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(GENRES).slice(0, 15).map(([id, name]) => (
            <button
              key={id}
              onClick={() => update({ genres: toggleInArray(settings.genres, parseInt(id)) })}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                settings.genres.length === 0 || settings.genres.includes(parseInt(id))
                  ? 'bg-primary/20 text-primary ring-1 ring-primary/30'
                  : 'bg-dark-surface text-gray-500'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
        {settings.genres.length > 0 && (
          <p className="text-[10px] text-gray-600 mt-1.5">
            {settings.genres.length} genre{settings.genres.length > 1 ? 's' : ''} selected · tap All to reset
          </p>
        )}
      </div>

      {/* Cards to swipe */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm text-gray-400">Cards to swipe</label>
          <span className="text-sm font-mono">{settings.poolSize === 'all' ? 'Marathon' : settings.poolSize}</span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={10}
            max={50}
            step={5}
            value={settings.poolSize === 'all' ? 50 : settings.poolSize}
            onChange={e => update({ poolSize: parseInt(e.target.value) })}
            className="flex-1 accent-primary"
          />
          <button
            onClick={() => update({ poolSize: settings.poolSize === 'all' ? 30 : 'all' })}
            className={`px-3 py-1 rounded-lg text-xs ${settings.poolSize === 'all' ? 'bg-primary text-white' : 'bg-dark-surface text-gray-400'}`}
          >
            Marathon
          </button>
        </div>
      </div>

      {/* Min Rating */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm text-gray-400">Min Rating</label>
          <span className="text-sm font-mono">{settings.minRating}</span>
        </div>
        <input
          type="range"
          min={0}
          max={9}
          step={0.5}
          value={settings.minRating}
          onChange={e => update({ minRating: parseFloat(e.target.value) })}
          className="w-full accent-primary"
        />
      </div>

      {/* Year Range */}
      <div>
        <label className="text-sm text-gray-400 mb-3 block">Year Range</label>
        <YearRangeSlider
          min={1950}
          max={new Date().getFullYear()}
          value={settings.yearRange}
          onChange={(val) => update({ yearRange: val })}
        />
      </div>

      {/* Content Rating */}
      <div>
        <label className="text-sm text-gray-400 mb-2 block">Content Rating</label>
        <div className="flex gap-2">
          {CONTENT_RATINGS.map(rating => (
            <button
              key={rating}
              onClick={() => update({ contentRatings: toggleInStringArray(settings.contentRatings, rating) })}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                settings.contentRatings.includes(rating)
                  ? 'bg-primary/20 text-primary'
                  : 'bg-dark-surface text-gray-500'
              }`}
            >
              {rating}
            </button>
          ))}
        </div>
      </div>

      {/* Sort By */}
      <div>
        <label className="text-sm text-gray-400 mb-2 block">Sort By</label>
        <div className="flex gap-2">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => update({ sortBy: opt.value })}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                settings.sortBy === opt.value
                  ? 'bg-primary text-white'
                  : 'bg-dark-surface text-gray-400'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* First Match Mode */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium">First Match Mode</label>
          <p className="text-xs text-gray-500">First title everyone agrees on wins instantly!</p>
        </div>
        <button
          onClick={() => update({ firstMatchMode: !settings.firstMatchMode })}
          className={`w-12 h-6 rounded-full transition-colors ${settings.firstMatchMode ? 'bg-primary' : 'bg-dark-border'}`}
        >
          <motion.div
            className="w-5 h-5 bg-white rounded-full shadow"
            animate={{ x: settings.firstMatchMode ? 24 : 2 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </div>

      {/* Timer */}
      <div>
        <label className="text-sm text-gray-400 mb-2 block">Time Per Card</label>
        <div className="flex gap-2">
          {TIMER_OPTIONS.map(opt => (
            <button
              key={String(opt.value)}
              onClick={() => update({ timerSeconds: opt.value })}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                settings.timerSeconds === opt.value
                  ? 'bg-primary text-white'
                  : 'bg-dark-surface text-gray-400'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
