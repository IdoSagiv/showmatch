'use client';

import type { StreamingProvider } from '@/types/game';

interface StreamingLogosProps {
  providers: StreamingProvider[];
  /** When provided, each logo becomes a JustWatch search link for this title */
  searchTitle?: string;
}

export default function StreamingLogos({ providers, searchTitle }: StreamingLogosProps) {
  if (providers.length === 0) return null;

  const jwUrl = searchTitle
    ? `https://www.justwatch.com/search?q=${encodeURIComponent(searchTitle)}`
    : null;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-xs text-gray-500">On:</span>
      {providers.slice(0, 5).map(p => {
        const logo = (
          <img
            key={p.id}
            src={p.logoPath}
            alt={p.name}
            title={p.name}
            className="w-6 h-6 rounded-md"
          />
        );
        return jwUrl ? (
          <a
            key={p.id}
            href={jwUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={`Watch on ${p.name} — JustWatch`}
            onClick={e => e.stopPropagation()}
            className="opacity-90 hover:opacity-100 hover:scale-110 transition-all"
          >
            {logo}
          </a>
        ) : logo;
      })}
      {providers.length > 5 && (
        <span className="text-xs text-gray-500">+{providers.length - 5}</span>
      )}
    </div>
  );
}
