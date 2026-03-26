'use client';

import { useGameStore } from '@/stores/gameStore';

/**
 * Shows the current player's display name as a subtle pill.
 * Placed in game/lobby/results headers so players always know
 * which name they joined with.
 */
export default function PlayerBadge() {
  const { room, playerId } = useGameStore();
  const name = room?.players.find(p => p.id === playerId)?.displayName;
  if (!name) return null;

  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full max-w-[130px]"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
      title={`Playing as ${name}`}
    >
      <span className="text-[10px] shrink-0" aria-hidden>👤</span>
      <span className="text-xs text-gray-400 font-medium truncate">{name}</span>
    </div>
  );
}
