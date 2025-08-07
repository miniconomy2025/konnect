'use client';

import { Feed } from '@/components/Feed/Feed';
import { FeedToggle } from '@/components/Feed/FeedToggle';
import { Header } from '@/components/Home/Header';
import Layout from '@/layouts/Main';
import { Color, FontFamily, FontSize, Spacing } from '@/lib/presentation';
// import { useRouter } from 'next/navigation'; // TODO: Implement navigation functionality
import { useToastHelpers } from '@/contexts/ToastContext';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

const Home: React.FC = () => {
  // const router = useRouter(); // TODO: Implement navigation functionality
  const [feedMode, setFeedMode] = useState<'discover' | 'following'>('discover');
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { error: showError } = useToastHelpers();

  useEffect(() => {
    if(!localStorage.getItem('auth_token')){
        showError('Please login first to access your feed!', {
            action: {
                label: 'Go to Login',
                onClick: () => window.location.href = '/Login'
            }
        });
        window.location.href = '/Login';
    }


    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowScrollToTop(scrollY > 300);
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
    <Layout>
        <Header
            editProfile={false}
            onSettingsClick={()=>{}}
        />
        
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
            bottom: `calc(${Spacing.Large} + 6rem)`,
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
            <Image
              width={15}
              height={15} 
            src="/assets/images/upArrow.png" 
            alt="Scroll to top" 
            style={{
                width: 15,
                height: 15,
                objectFit: 'contain',
            }}
            />
        </button>
    </Layout>
  );
}

export default Home;