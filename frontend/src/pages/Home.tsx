'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { FeedToggle } from '@/components/FeedToggle';
import { Feed } from '@/components/Feed';
import { Color, FontFamily, FontSize, Spacing } from '@/lib/presentation';

export function Home() {
  const [feedMode, setFeedMode] = useState<'discover' | 'following'>('discover');
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // Show scroll to top button after scrolling down 300px
      setShowScrollToTop(scrollY > 300);
      
      // Show sticky feed toggle after scrolling past header
      setIsScrolled(scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <main style={{
      minHeight: '100vh',
      background: Color.Background,
      position: 'relative',
    }}>
      <Header />
      
      <nav style={{
        opacity: isScrolled ? 0 : 1,
        transition: 'opacity 0.3s ease',
        pointerEvents: isScrolled ? 'none' : 'auto',
        marginTop: Spacing.Medium,
      }}>
        <FeedToggle mode={feedMode} onModeChange={setFeedMode} />
      </nav>
      
      <nav style={{
        position: 'fixed',
        top: Spacing.XSmall,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        opacity: isScrolled ? 1 : 0,
        visibility: isScrolled ? 'visible' : 'hidden',
        transition: 'opacity 0.3s ease, visibility 0.3s ease',
      }}>
        <FeedToggle mode={feedMode} onModeChange={setFeedMode} />
      </nav>
      
      <Feed mode={feedMode} />
      
      <button
        onClick={scrollToTop}
        style={{
          position: 'fixed',
          bottom: `calc(${Spacing.Large} + 60px)`, // Position above the create post button
          right: Spacing.Large,
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: Color.Surface,
          border: `1px solid ${Color.Primary}`,
          color: Color.Primary,
          fontSize: FontSize.Large,
          fontWeight: 600,
          fontFamily: FontFamily.Nunito,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          transition: 'all 0.3s ease',
          zIndex: 999,
          lineHeight: 1,
          textAlign: 'center',
          padding: 0,
          opacity: showScrollToTop ? 1 : 0,
          visibility: showScrollToTop ? 'visible' : 'hidden',
          transform: showScrollToTop ? 'translateY(0)' : 'translateY(20px)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = showScrollToTop ? 'scale(1.1)' : 'translateY(20px)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
          e.currentTarget.style.background = Color.Primary;
          e.currentTarget.style.color = Color.Surface;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = showScrollToTop ? 'scale(1)' : 'translateY(20px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
          e.currentTarget.style.background = Color.Surface;
          e.currentTarget.style.color = Color.Primary;
        }}
        aria-label="Scroll to top"
      >
        <img 
          src="/assets/images/upArrow.png" 
          alt="Scroll to top" 
          style={{
            width: 15,
            height: 15,
            objectFit: 'contain',
          }}
        />
      </button>
      
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