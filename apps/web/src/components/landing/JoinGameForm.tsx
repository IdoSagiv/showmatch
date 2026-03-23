'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function JoinGameForm() {
  const [code, setCode] = useState('');
  const router = useRouter();

  const handleJoin = () => {
    if (code.length === 5) {
      router.push(`/join/${code.toUpperCase()}`);
    }
  };

  return (
    <motion.div
      className="mt-6 w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex items-center gap-2 rounded-xl border border-dark-border bg-dark-surface p-1">
        <Input
          value={code}
          onChange={setCode}
          placeholder="ENTER CODE"
          maxLength={5}
          uppercase
          className="flex-1 border-0 bg-transparent text-center font-mono text-2xl tracking-[0.3em] focus:ring-0"
        />
        <Button
          onClick={handleJoin}
          disabled={code.length !== 5}
          size="md"
          className="shrink-0"
        >
          Join
        </Button>
      </div>
    </motion.div>
  );
}
