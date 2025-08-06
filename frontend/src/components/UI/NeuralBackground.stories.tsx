import type { Meta, StoryObj } from '@storybook/react';
import { NeuralBackground } from './NeuralBackground';
import React from 'react';

const meta: Meta<typeof NeuralBackground> = {
  title: 'UI/NeuralBackground',
  component: NeuralBackground,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'An animated neural network background with moving circles that connect when they get close, creating a dynamic visual effect.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  render: () => (
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
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontFamily: 'var(--font-nunito), Arial, sans-serif' }}>
          Neural Network Background
        </h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
          Watch the circles move and connect like neurons!
        </p>
      </section>
    </section>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Default neural background with animated circles and connections.',
      },
    },
  },
};

// Dark theme story
export const DarkTheme: Story = {
  render: () => (
    <section style={{ 
      position: 'relative', 
      width: '100vw', 
      height: '100vh',
      background: '#0a0a0a',
    }}>
      <NeuralBackground 
        style={{
          opacity: 0.8,
        }}
      />
      <section style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        color: 'white',
        zIndex: 1,
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontFamily: 'var(--font-nunito), Arial, sans-serif' }}>
          Dark Neural Network
        </h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
          Perfect for dark mode applications
        </p>
      </section>
    </section>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Neural background on a dark theme with reduced opacity.',
      },
    },
  },
};

// Light theme story
export const LightTheme: Story = {
  render: () => (
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
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontFamily: 'var(--font-nunito), Arial, sans-serif' }}>
          Light Neural Network
        </h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
          Subtle animation for light backgrounds
        </p>
      </section>
    </section>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Neural background on a light theme with subtle blue connections.',
      },
    },
  },
};

// Interactive demo story
export const InteractiveDemo: Story = {
  render: () => {
    const [isVisible, setIsVisible] = React.useState(true);
    
    return (
      <section style={{ 
        position: 'relative', 
        width: '100vw', 
        height: '100vh',
        background: '#FAF9F6',
      }}>
        {isVisible && <NeuralBackground />}
        
        <section style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#333',
          zIndex: 1,
        }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontFamily: 'var(--font-nunito), Arial, sans-serif' }}>
            Interactive Demo
          </h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.8 }}>
            Toggle the neural background animation
          </p>
          <button
            onClick={() => setIsVisible(!isVisible)}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              background: isVisible ? '#ff4757' : '#2ed573',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontFamily: 'var(--font-nunito), Arial, sans-serif',
              transition: 'all 0.3s ease',
            }}
          >
            {isVisible ? 'Hide Animation' : 'Show Animation'}
          </button>
        </section>
      </section>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo where you can toggle the neural background animation on and off.',
      },
    },
  },
}; 