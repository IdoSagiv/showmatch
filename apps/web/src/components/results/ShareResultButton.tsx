'use client';

import { useState } from 'react';
import type { TitleCard } from '@/types/game';
import Button from '@/components/ui/Button';
import { shareText } from '@/lib/share';

interface ShareResultButtonProps {
  winner: TitleCard;
}

export default function ShareResultButton({ winner }: ShareResultButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const result = await shareText(
      `We're watching "${winner.title}" (${winner.year})! Decided on ShowMatch 🎬`,
      { title: 'ShowMatch Result', url: appUrl },
    );
    if (result === 'copied') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Button onClick={handleShare} variant="secondary">
      {copied ? 'Copied!' : 'Share Result'}
    </Button>
  );
}
