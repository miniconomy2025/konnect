'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { FeedToggle } from '@/components/FeedToggle';
import { Feed } from '@/components/Feed';
import { Color, FontFamily, FontSize, Spacing } from '@/lib/presentation';

export function Home() {
  const [feedMode, setFeedMode] = useState<'discover' | 'following'>('discover');

  return (
    <main style={{
      minHeight: '100vh',
      background: Color.Background,
      position: 'relative',
    }}>
      <Header />
      <FeedToggle mode={feedMode} onModeChange={setFeedMode} />
      <Feed mode={feedMode} />
      
      <button
        onClick={() => {
          // TODO: Implement post creation functionality
          console.log('Create post clicked');
        }}
        style={{
          position: 'fixed',
          bottom: Spacing.Large,
          right: Spacing.Large,
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: Color.Primary,
          border: 'none',
          color: Color.Surface,
          fontSize: FontSize.XLarge,
          fontWeight: 400,
          fontFamily: FontFamily.Nunito,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)',
          transition: 'all 0.2s ease',
          zIndex: 1000,
          lineHeight: 1,
          textAlign: 'center',
          padding: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 122, 255, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 122, 255, 0.3)';
        }}
        aria-label="Create new post"
      >
        +
      </button>
    </main>
  );
} 