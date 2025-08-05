import React from 'react';
import { Color, Spacing, FontSize, FontFamily } from '@/lib/presentation';


export function Header() {
  return (
    <header
    style={{
      position: 'sticky',
      height:'2.5rem',
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
      </nav>
    </header>
  );
} 