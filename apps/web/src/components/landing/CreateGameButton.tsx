'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';

export default function CreateGameButton() {
  const router = useRouter();

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Button
        size="lg"
        onClick={() => router.push('/create')}
        className="w-full text-lg py-4"
      >
        Create Game
      </Button>
    </motion.div>
  );
}
