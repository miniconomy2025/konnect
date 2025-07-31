import React from 'react';
import { Color, Spacing, FontSize, FontFamily } from '@/lib/presentation';
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function Header() {

    const router = useRouter()

    const goToProfile = () => {
        router.push('/account')
    }
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 200,
      background: Color.Surface,
      borderBottom: `1px solid ${Color.Border}`,
      padding: `${Spacing.Medium} ${Spacing.Large}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <section style={{
        position: 'absolute',
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',
      }}>
        <h1 style={{
          margin: 0,
          fontSize: FontSize.XLarge,
          fontWeight: 400,
          color: Color.Text,
          fontFamily: FontFamily.Playwrite,
        }}>
          Konnect
        </h1>
      </section>
      
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: Spacing.Medium,
        marginLeft: 'auto',
      }}>
        <button onClick={goToProfile} 
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: `1px solid ${Color.Border}`,
          background: Color.Background,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          overflow: 'hidden',
          pointerEvents: 'auto',
        }}>
          <img 
            src="/assets/images/missingAvatar.jpg" 
            alt="User avatar"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </button>
      </nav>
    </header>
  );
} 