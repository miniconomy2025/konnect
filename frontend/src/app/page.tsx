'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { FeedToggle } from '@/components/FeedToggle';
import { Feed } from '@/components/Feed';
import { Color } from '@/lib/presentation';

export default function Home() {
  const [feedMode, setFeedMode] = useState<'discover' | 'following'>('discover');

  return (
    <main style={{
      minHeight: '100vh',
      background: Color.Background,
    }}>
      <Header />
      <FeedToggle mode={feedMode} onModeChange={setFeedMode} />
      <Feed mode={feedMode} />
    </main>
  );
}
