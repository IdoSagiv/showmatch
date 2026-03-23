'use client';

import { motion } from 'framer-motion';

interface WaitingAnimationProps {
  creatorName: string;
}

export default function WaitingAnimation({ creatorName }: WaitingAnimationProps) {
  return (
    <div className="text-center py-8">
      <div className="flex justify-center gap-1 mb-4">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-3 h-3 bg-primary rounded-full"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
          />
        ))}
      </div>
      <p className="text-gray-400">
        Waiting for <span className="text-white font-medium">{creatorName}</span> to start the game...
      </p>
    </div>
  );
}
