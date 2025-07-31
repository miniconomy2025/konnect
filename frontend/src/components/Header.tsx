import React from 'react';
import { Color, Spacing, FontSize, Radius } from '@/lib/presentation';

export function Header() {
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
        display: 'flex',
        alignItems: 'center',
        gap: Spacing.Small,
      }}>
        <figure style={{
          width: 32,
          height: 32,
          borderRadius: Radius.Medium,
          background: Color.Primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 0,
        }}>
          <strong style={{
            color: 'white',
            fontWeight: 'bold',
            fontSize: FontSize.Large,
          }}>
            K
          </strong>
        </figure>
        <h1 style={{
          margin: 0,
          fontSize: FontSize.Large,
          fontWeight: 'bold',
          color: Color.Text,
        }}>
          Konnect
        </h1>
      </section>
      
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: Spacing.Medium,
      }}>
        <button style={{
          padding: `${Spacing.Small} ${Spacing.Medium}`,
          borderRadius: Radius.Medium,
          border: `1px solid ${Color.Border}`,
          background: Color.Surface,
          color: Color.Text,
          fontSize: FontSize.Base,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          fontFamily: 'inherit',
        }}>
          Search
        </button>
        <button style={{
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
        }}>
          <strong style={{ fontSize: 20 }}>👤</strong>
        </button>
      </nav>
    </header>
  );
} 