'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { safeCopy } from '@/lib/clipboard';

interface CopyableCodeProps {
  code: string;
  /** Tailwind text-size class, e.g. "text-4xl" or "text-5xl" */
  textSize?: string;
  /** Extra tracking class, e.g. "tracking-[0.3em]" */
  tracking?: string;
  /** Extra className on the wrapper */
  className?: string;
}

export default function CopyableCode({
  code,
  textSize = 'text-5xl',
  tracking = 'tracking-[0.4em]',
  className = '',
}: CopyableCodeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await safeCopy(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }, [code]);

  return (
    <div className={`relative inline-flex flex-col items-center gap-1 ${className}`}>
      <motion.button
        onClick={handleCopy}
        className={`font-mono font-black ${textSize} ${tracking} code-glow text-white cursor-pointer select-none`}
        whileTap={{ scale: 0.94 }}
        title="Tap to copy"
      >
        {code}
      </motion.button>

      {/* "tap to copy" hint — fades out once copied */}
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span
            key="copied"
            className="text-xs text-green-400 font-semibold"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            ✓ Copied!
          </motion.span>
        ) : (
          <motion.span
            key="hint"
            className="text-[10px] text-gray-600 tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            tap to copy
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
