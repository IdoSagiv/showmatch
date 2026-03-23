'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSocket } from '@/hooks/useSocket';
import { useGameStore } from '@/stores/gameStore';
import { NAME_ADJECTIVES, NAME_NOUNS } from '@/lib/constants';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Logo from '@/components/ui/Logo';

function randomName(): string {
  const adj = NAME_ADJECTIVES[Math.floor(Math.random() * NAME_ADJECTIVES.length)];
  const noun = NAME_NOUNS[Math.floor(Math.random() * NAME_NOUNS.length)];
  return `${adj} ${noun}`;
}

export default function JoinPage() {
  const router = useRouter();
  const params = useParams();
  const code = (params.code as string).toUpperCase();
  const socket = useSocket();
  const { setRoom, setPlayerId } = useGameStore();
  const [name, setName] = useState(randomName());
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

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

  return (
    <main className="min-h-screen bg-dark">
      <header className="flex items-center p-4 border-b border-dark-border">
        <a href="/"><Logo size="sm" /></a>
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
            <Input
              value={name}
              onChange={setName}
              maxLength={50}
              className="w-full text-center text-lg"
              autoFocus
            />
            <button
              onClick={() => setName(randomName())}
              className="mt-2 text-xs text-primary hover:text-primary-light transition-colors w-full text-center"
            >
              Generate new name
            </button>
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
