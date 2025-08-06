'use client';

import React, { useEffect, useRef } from 'react';

interface Circle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  color: string;
}

interface Connection {
  from: Circle;
  to: Circle;
  strength: number;
}

interface NeuralBackgroundProps {
  className?: string;
  style?: React.CSSProperties;
}

export const NeuralBackground: React.FC<NeuralBackgroundProps> = ({ 
  className = '', 
  style = {} 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const circlesRef = useRef<Circle[]>([]);
  const connectionsRef = useRef<Connection[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize circles
    const initCircles = () => {
      const circles: Circle[] = [];
      // Increased spawn rate - more dots!
      const numCircles = Math.min(120, Math.floor((canvas.width * canvas.height) / 10000));
      
      for (let i = 0; i < numCircles; i++) {
        // Generate random color for each circle using the specified palette
        const colors = [
          'rgba(252, 191, 73, 0.8)',   // #fcbf49 - Golden Yellow
          'rgba(254, 95, 85, 0.8)',    // #fe5f55 - Coral Red
          'rgba(148, 72, 188, 0.8)',   // #9448BC - Purple
        ];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        circles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 3 + 1,
          opacity: Math.random() * 0.3 + 0.1,
          color: randomColor,
        });
      }
      
      circlesRef.current = circles;
    };

    // Calculate connections between circles
    const calculateConnections = () => {
      const circles = circlesRef.current;
      const connections: Connection[] = [];
      const maxDistance = 180; // Slightly increased for more connections

      for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
          const circle1 = circles[i];
          const circle2 = circles[j];
          const distance = Math.sqrt(
            Math.pow(circle1.x - circle2.x, 2) + Math.pow(circle1.y - circle2.y, 2)
          );

          if (distance < maxDistance) {
            const strength = 1 - (distance / maxDistance);
            connections.push({
              from: circle1,
              to: circle2,
              strength,
            });
          }
        }
      }

      connectionsRef.current = connections;
    };

    // Update circle positions
    const updateCircles = () => {
      const circles = circlesRef.current;
      
      circles.forEach(circle => {
        // Update position
        circle.x += circle.vx;
        circle.y += circle.vy;

        // Bounce off edges
        if (circle.x <= circle.radius || circle.x >= canvas.width - circle.radius) {
          circle.vx *= -1;
        }
        if (circle.y <= circle.radius || circle.y >= canvas.height - circle.radius) {
          circle.vy *= -1;
        }

        // Keep within bounds
        circle.x = Math.max(circle.radius, Math.min(canvas.width - circle.radius, circle.x));
        circle.y = Math.max(circle.radius, Math.min(canvas.height - circle.radius, circle.y));
      });
    };

    // Draw everything
    const draw = () => {
      // Clear canvas with transparent background
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      // Draw connections with dynamic gradients based on circle colors
      const connections = connectionsRef.current;
      connections.forEach((connection, index) => {
        const { from, to, strength } = connection;
        
        // Create gradient from one circle's color to the other's color
        const gradient = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
        
        // Extract colors from the circles and adjust opacity based on strength
        const fromColor = from.color.replace('0.8)', `${strength * 0.6})`);
        const toColor = to.color.replace('0.8)', `${strength * 0.6})`);
        
        gradient.addColorStop(0, fromColor);
        gradient.addColorStop(1, toColor);
        
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = strength * 2;
        ctx.stroke();
      });

      // Draw circles with their individual colors
      const circles = circlesRef.current;
      circles.forEach((circle, index) => {
        // Create radial gradient for each circle using its assigned color
        const gradient = ctx.createRadialGradient(
          circle.x, circle.y, 0,
          circle.x, circle.y, circle.radius
        );
        
        // Use the circle's assigned color for the center
        const centerColor = circle.color;
        // Create a more transparent version for the edge
        const edgeColor = circle.color.replace('0.8)', '0.2)');
        
        gradient.addColorStop(0, centerColor);
        gradient.addColorStop(1, edgeColor);
        
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });
    };

    // Animation loop
    const animate = () => {
      updateCircles();
      calculateConnections();
      draw();
      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    initCircles();
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`neural-background ${className}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
        ...style,
      }}
    />
  );
};

export default NeuralBackground; 