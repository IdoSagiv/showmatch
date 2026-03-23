'use client';

import type { StreamingProvider } from '@/types/game';

interface StreamingLogosProps {
  providers: StreamingProvider[];
}

export default function StreamingLogos({ providers }: StreamingLogosProps) {
  if (providers.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-gray-500">On:</span>
      {providers.slice(0, 5).map(p => (
        <img
          key={p.id}
          src={p.logoPath}
          alt={p.name}
          title={p.name}
          className="w-6 h-6 rounded-md"
        />
      ))}
      {providers.length > 5 && (
        <span className="text-xs text-gray-500">+{providers.length - 5}</span>
      )}
    </div>
  );
}
