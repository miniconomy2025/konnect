'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Color, FontFamily, FontSize, Spacing, textGradientStyle } from '@/lib/presentation';
import { useRouter } from 'next/router';

const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    window.location.href = '/auth/google';
  };
  
    useEffect(() => {
        if(sessionStorage.getItem('auth_token')){
            window.location.href = '/Home';
        }
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        const userString = params.get("user");

        if (token && userString) {
        try {
                         JSON.parse(userString); // Validate JSON format
            sessionStorage.setItem("auth_token", token);
            router.push('/Home');
        } catch (err) {
            console.error("Error parsing user from query:", err);
        }
        }
    }, [router]);

  return (
      <main style={{
        minHeight: '90vh',
        background: Color.Background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.Large,
      }}>
        <section style={{
          width: '100%',
          maxWidth: 450,
          background: Color.Surface,
          borderRadius: 12,
          padding: Spacing.XLarge,
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${Color.Border || '#e5e5e5'}`,
        }}>
          <section style={{
            textAlign: 'center',
            marginBottom: Spacing.XLarge,
          }}>
              <hgroup style={{
              margin: 0,
              marginBottom: Spacing.Medium,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'baseline',
              justifyContent: 'center',
              gap: '0.3rem',
              }}>
                <h1 style={{
                fontSize: FontSize.XLarge,
                fontWeight: 400,
                fontFamily: FontFamily.Nunito,
                color: Color.Text,
                margin: 0,
              }}>
                Welcome to
              </h1>
              <h1 style={{
                fontSize: FontSize.XLarge,
                fontWeight: 700,
                fontFamily: FontFamily.Playwrite,
                margin: 0,
                ...textGradientStyle,
              }}>
                Konnect
              </h1>
            </hgroup>
            <p style={{
              fontSize: FontSize.Large,
              fontFamily: FontFamily.Nunito,
              color: Color.Secondary || '#666',
              margin: 0,
              lineHeight: 1.6,
              marginBottom: Spacing.Large,
            }}>
              Connect with like-minded people, share your thoughts, and discover amazing content from your community. Join the conversation that matters to you.
            </p>
          </section>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: Spacing.Medium,
              background: Color.Surface,
              color: Color.Text,
              border: `2px solid ${Color.Border || '#e5e5e5'}`,
              borderRadius: 8,
              fontSize: FontSize.Large,
              fontWeight: 600,
              fontFamily: FontFamily.Nunito,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: isLoading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: Spacing.Small,
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = Color.Primary;
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = Color.Border || '#e5e5e5';
              }
            }}
          >
            {!isLoading && (
              <Image
              width={200}
              height={200} 
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                alt="Google logo"
                style={{ 
                  width: 18, 
                  height: 18, 
                  flexShrink: 0 
                }}
              />
            )}
            {isLoading ? 'Signing In...' : 'Continue with Google'}
          </button>
        </section>
      </main>
  );
};

export default Login;