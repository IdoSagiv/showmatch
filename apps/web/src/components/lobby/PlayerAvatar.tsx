'use client';

interface PlayerAvatarProps {
  name: string;
  connected?: boolean;
  size?: 'sm' | 'md';
  progress?: number;
  total?: number;
  avatarClassName?: string;
}

const COLORS = [
  'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
  'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
];

function getColor(name: string): string {
  let hash = 0;
  for (const char of name) hash = char.charCodeAt(0) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function PlayerAvatar({ name, connected = true, size = 'md', progress, total, avatarClassName }: PlayerAvatarProps) {
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  const colorClass = avatarClassName ?? getColor(name);

  return (
    <div className="relative">
      <div className={`${sizeClass} ${colorClass} rounded-full flex items-center justify-center font-bold ${!connected ? 'opacity-50' : ''}`}>
        {getInitials(name)}
      </div>
      {progress !== undefined && total !== undefined && total > 0 && (
        <div className="absolute -bottom-1 left-0 right-0 h-1 bg-dark-border rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${Math.min(100, (progress / total) * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
