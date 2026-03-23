'use client';

import { useState } from 'react';

interface ShareButtonProps {
  code: string;
}

export default function ShareButton({ code }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const text = `Join my ShowMatch game! Code: ${code}`;
    const url = `${window.location.origin}/join/${code}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'ShowMatch', text, url });
        return;
      } catch { /* User cancelled or not supported */ }
    }

    await navigator.clipboard.writeText(`${text}\n${url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
