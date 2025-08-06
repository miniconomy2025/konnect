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
      background: 'transparent',
      // paddingTop: Spacing.Medium,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
             <section style={{
         display: 'flex',
         // background: Color.Background,
         borderRadius: Radius.Large,
         padding: Spacing.XSmall,
         background: 'rgba(255, 255, 255, 0.6)',
         backdropFilter: 'blur(12px)',
         WebkitBackdropFilter: 'blur(12px)',
         border: `1px solid ${Color.Border}`,
         position: 'relative',
       }}>
        <section style={{
          position: 'absolute',
          top: Spacing.XSmall,
          left: Spacing.XSmall,
          width: 'calc(50% - 4px)',
          height: 'calc(100% - 8px)',
          background: Color.Primary,
          borderRadius: '12px',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: mode === 'following' ? 'translateX(100%)' : 'translateX(0)',
          zIndex: 1,
        }} />
        
        <button
          onClick={() => onModeChange('discover')}
          style={{
            padding: `${Spacing.Small} ${Spacing.Large}`,
            borderRadius: '12px',
            border: 'none',
            background: 'transparent',
            color: mode === 'discover' ? 'white' : Color.Text,
            fontSize: FontSize.Base,
            fontWeight: mode === 'discover' ? '600' : '400',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            minWidth: 100,
            fontFamily: 'inherit',
            position: 'relative',
            zIndex: 2,
          }}
        >
          Discover
        </button>
        <button
          onClick={() => onModeChange('following')}
          style={{
            padding: `${Spacing.Small} ${Spacing.Large}`,
            borderRadius: '12px',
            border: 'none',
            background: 'transparent',
            color: mode === 'following' ? 'white' : Color.Text,
            fontSize: FontSize.Base,
            fontWeight: mode === 'following' ? '600' : '400',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            minWidth: 100,
            fontFamily: 'inherit',
            position: 'relative',
            zIndex: 2,
          }}
        >
          Following
        </button>
      </section>
    </nav>
  );
} 