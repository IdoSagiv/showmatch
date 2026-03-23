'use client';

import { useState } from 'react';
import type { TitleCard } from '@/types/game';
import Button from '@/components/ui/Button';
import { safeCopy } from '@/lib/clipboard';

interface ShareResultButtonProps {
  winner: TitleCard;
}

export default function ShareResultButton({ winner }: ShareResultButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const text = `We're watching "${winner.title}" (${winner.year})! Decided on ShowMatch 🎬`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'ShowMatch Result', text });
        return;
      } catch {}
    }

    await safeCopy(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button onClick={handleShare} variant="secondary">
      {copied ? 'Copied!' : 'Share Result'}
    </Button>
  );
}
