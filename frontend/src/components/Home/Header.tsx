"use client";

import React from 'react';
import { Color, Spacing, FontSize, FontFamily, textGradientStyle } from '@/lib/presentation';
import { styles } from '@/styles/account';
import { Settings } from 'lucide-react';

interface HeaderProps {
  editProfile: boolean;
  onSettingsClick: () => void;
}

export function Header({ editProfile, onSettingsClick } : HeaderProps) {  
  return (
    <header
    style={{
      position: 'sticky',
      height:'4rem',
      top: 0,
      zIndex: 200,  
      background: Color.Surface,
      borderBottom: `1px solid ${Color.Border}`,
      padding: `${Spacing.Large} ${Spacing.Large}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <section style={{
        position: 'absolute',
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <section></section>
        <h1 style={{
          margin: 0,
          fontSize: FontSize.XLarge,
          fontWeight: 700,
          fontFamily: FontFamily.Playwrite,
          ...textGradientStyle
        }}>
          Konnect
        </h1>
        {editProfile ? 
            <button onClick={onSettingsClick} style={styles.iconButton}>
                <Settings size={24} />
            </button> 
            :
            <section></section>      
        }
       
      </section>
    </header>
  );
} 