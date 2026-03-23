'use client';

import { useState } from 'react';
import { safeCopy } from '@/lib/clipboard';
import { shareText } from '@/lib/share';

interface ShareButtonProps {
  code: string;
}

export default function ShareButton({ code }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const flash = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const text = `Join my ShowMatch game! Enter code: ${code}`;
    const result = await shareText(text);
    if (result === 'copied') flash();
  };

  const handleCopy = async () => {
    await safeCopy(code);
    flash();
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleCopy}
        className="px-3 py-1.5 bg-dark-surface border border-dark-border rounded-lg text-sm hover:bg-dark-border transition-colors"
      >
        {copied ? 'Copied!' : 'Copy Code'}
      </button>
      <button
        onClick={handleShare}
        className="px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-sm hover:bg-primary/30 transition-colors"
      >
        Share
      </button>
    </div>
  );
}
