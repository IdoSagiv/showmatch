'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSocket } from '@/hooks/useSocket';
import { useGameStore } from '@/stores/gameStore';
import { NAME_ADJECTIVES, NAME_NOUNS } from '@/lib/constants';
import Button from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';

function randomName(): string {
  const adj = NAME_ADJECTIVES[Math.floor(Math.random() * NAME_ADJECTIVES.length)];
  const noun = NAME_NOUNS[Math.floor(Math.random() * NAME_NOUNS.length)];
  return `${adj} ${noun}`;
}

export default function JoinPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const code = (params.code as string).toUpperCase();
  const socket = useSocket();
  const { setRoom, setPlayerId } = useGameStore();
  const [name, setName] = useState(randomName());
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  // Skip room check when navigating from the join form (?v=1 = pre-verified).
  // Still check for direct URL access so we don't show a broken name picker.
  const [checking, setChecking] = useState(!searchParams.get('v'));

  useEffect(() => {
    if (!checking) return; // pre-verified — no need to check

    const doCheck = () => {
      socket.emit('checkRoom', code, (response: any) => {
        if ('error' in response) {
          sessionStorage.setItem('showmatch-toast', response.error);
          router.replace('/');
        } else {
          setChecking(false);
        }
      });
    };

    if (socket.connected) {
      doCheck();
    } else {
      socket.once('connect', doCheck);
      socket.connect();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleJoin = () => {
    if (!name.trim() || joining) return;
    setJoining(true);
    setError(null);

    const doJoin = () => {
      socket.emit('joinRoom', code, name.trim(), (response: any) => {
        if ('error' in response) {
          setError(response.error);
          setJoining(false);
          return;
        }
        setRoom(response.room);
        setPlayerId(socket.id || '');
        router.push(`/lobby/${code}`);
      });
    };

    if (socket.connected) {
      doJoin();
    } else {
      socket.once('connect', doJoin);
      socket.connect();
    }
  };

  if (checking) {
    return (
      <main className="min-h-screen bg-dark flex flex-col">
        <header className="flex items-center p-4 border-b border-dark-border">
          <Logo size="sm" />
        </header>
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Checking room…
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-dark">
      <header className="flex items-center p-4 border-b border-dark-border">
        <Logo size="sm" />
      </header>

      <div className="max-w-sm mx-auto p-4 mt-12">
        <motion.div
          className="bg-dark-card rounded-2xl p-6 border border-dark-border space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-1">Joining Room</p>
            <p className="text-3xl font-mono font-bold tracking-[0.3em]">{code}</p>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Display Name</label>
            <div className="relative">
              <input
                value={name}
                onChange={e => setName(e.target.value.slice(0, 50))}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
                placeholder="Your name"
                maxLength={50}
                autoFocus
                className="
                  w-full bg-dark-surface border border-dark-border rounded-xl
                  px-4 py-3 text-center text-lg font-medium text-white
                  focus:outline-none focus:border-primary transition-colors
                "
              />
              <button
                type="button"
                onClick={() => setName(randomName())}
                title="Random name"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition-colors text-lg"
              >
                🎲
              </button>
            </div>
          </div>

          {error && (
            <p className="text-accent-red text-sm text-center">{error}</p>
          )}

          <Button
            size="lg"
            onClick={handleJoin}
            disabled={!name.trim() || joining}
            className="w-full"
          >
            {joining ? 'Joining...' : 'Join Game'}
          </Button>
        </motion.div>
      </div>
    </main>
  );
}
