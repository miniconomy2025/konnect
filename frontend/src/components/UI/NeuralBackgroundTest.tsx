'use client';

import React from 'react';
import { NeuralBackground } from './NeuralBackground';

export const NeuralBackgroundTest: React.FC = () => {
  return (
    <section style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      background: '#FAF9F6',
    }}>
      <NeuralBackground />
      
      <section style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        color: '#333',
        zIndex: 1,
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '2rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', fontFamily: 'var(--font-nunito), Arial, sans-serif' }}>
          Neural Background Test
        </h1>
        <p style={{ fontSize: '1rem', opacity: 0.8 }}>
          You should see animated circles with blue, orange, and purple gradients connecting when they get close!
        </p>
        <p style={{ fontSize: '0.875rem', opacity: 0.6, marginTop: '1rem' }}>
          Background: #FAF9F6 | Colors: Blue, Orange, Purple
        </p>
      </section>
    </section>
  );
};

export default NeuralBackgroundTest; 