'use client';

import React from 'react';
import { NeuralBackground } from '@/components/UI';
import Layout from '@/layouts/Main';

const TestNeural: React.FC = () => {
  return (
    <Layout>
      <main style={{
        minHeight: '100vh',
        background: 'transparent',
        position: 'relative',
      }}>
        <NeuralBackground />
        
        <section style={{
          position: 'relative',
          zIndex: 1,
          padding: '2rem',
          textAlign: 'center',
        }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            marginBottom: '1rem',
            fontFamily: 'var(--font-nunito), Arial, sans-serif',
            color: '#333',
          }}>
            Neural Background Test
          </h1>
          <p style={{ 
            fontSize: '1.1rem', 
            opacity: 0.8,
            marginBottom: '2rem',
            color: '#333',
          }}>
            You should see animated circles with blue, orange, and purple gradients connecting when they get close!
          </p>
          
          <section style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            padding: '2rem',
            borderRadius: '1rem',
            maxWidth: '600px',
            margin: '0 auto',
            border: '1px solid #eee',
          }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              marginBottom: '1rem',
              color: '#333',
            }}>
              Test Content
            </h2>
            <p style={{ 
              fontSize: '1rem', 
              lineHeight: 1.6,
              color: '#333',
            }}>
              This is a test page to verify that the neural background is working properly. 
              The background should show animated circles with gradient colors (blue, orange, purple) 
              that connect when they get close to each other, creating a neural network effect.
            </p>
            <p style={{ 
              fontSize: '0.875rem', 
              opacity: 0.7,
              marginTop: '1rem',
              color: '#333',
            }}>
              Background: #FAF9F6 | Colors: Blue, Orange, Purple
            </p>
          </section>
        </section>
      </main>
    </Layout>
  );
};

export default TestNeural; 