import React from 'react';
import { Color, Spacing, FontSize, Radius } from '@/lib/presentation';

interface FeedToggleProps {
  mode: 'discover' | 'following';
  onModeChange: (mode: 'discover' | 'following') => void;
}

export function FeedToggle({ mode, onModeChange }: FeedToggleProps) {
  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: Color.Surface,
      borderBottom: `1px solid ${Color.Border}`,
      padding: `${Spacing.Medium} ${Spacing.Large}`,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <section style={{
        display: 'flex',
        background: Color.Background,
        borderRadius: Radius.Large,
        padding: Spacing.XSmall,
        border: `1px solid ${Color.Border}`,
        position: 'relative',
      }}>
        <button
          onClick={() => onModeChange('discover')}
          style={{
            padding: `${Spacing.Small} ${Spacing.Large}`,
            borderRadius: Radius.Medium,
            border: 'none',
            background: mode === 'discover' ? Color.Primary : 'transparent',
            color: mode === 'discover' ? 'white' : Color.Text,
            fontSize: FontSize.Base,
            fontWeight: mode === 'discover' ? '600' : '400',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            minWidth: 100,
            fontFamily: 'inherit',
          }}
        >
          Discover
        </button>
        <button
          onClick={() => onModeChange('following')}
          style={{
            padding: `${Spacing.Small} ${Spacing.Large}`,
            borderRadius: Radius.Medium,
            border: 'none',
            background: mode === 'following' ? Color.Primary : 'transparent',
            color: mode === 'following' ? 'white' : Color.Text,
            fontSize: FontSize.Base,
            fontWeight: mode === 'following' ? '600' : '400',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            minWidth: 100,
            fontFamily: 'inherit',
          }}
        >
          Following
        </button>
      </section>
    </nav>
  );
} 