import React from 'react';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number | string;
  circle?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 8,
  circle = false,
  style,
  className,
}) => {
  const finalStyle: React.CSSProperties = {
    width,
    height,
    borderRadius: circle ? '50%' : borderRadius,
    background: 'linear-gradient(90deg, #eee 25%, #f5f5f5 37%, #eee 63%)',
    backgroundSize: '400% 100%',
    animation: 'skeleton-shimmer 1.2s ease-in-out infinite',
    ...style,
  };

  return (
    <div className={className} style={finalStyle}>
      <style>{`
        @keyframes skeleton-shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
      `}</style>
    </div>
  );
};

