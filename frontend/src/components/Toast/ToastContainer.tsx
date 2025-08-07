"use client";

import { useToast } from '@/contexts/ToastContext';
import { toastStyles } from '@/styles/toast';
import React, { useState } from 'react';
import Toast from './Toast';

const MAX_VISIBLE_TOASTS = 3;

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();
  const [isHovered, setIsHovered] = useState(false);

  // Sort toasts by creation time (newest first for display)
  const sortedToasts = [...toasts].sort((a, b) => b.createdAt - a.createdAt);
  
  // Take only the most recent toasts
  const visibleToasts = sortedToasts.slice(0, MAX_VISIBLE_TOASTS);
  
  // If there are more toasts than visible, show a count indicator
  const hiddenCount = toasts.length - visibleToasts.length;

  if (toasts.length === 0) {
    return null;
  }

  const containerStyle = {
    ...toastStyles.container,
  };

  const stackStyle = {
    ...toastStyles.toastStack,
    ...(isHovered ? toastStyles.toastStackHovered : {}),
  };

  return (
    <div
      style={containerStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={stackStyle}>
        {hiddenCount > 0 && (
          <div
            style={{
              fontSize: '12px',
              color: '#6b7280',
              textAlign: 'center',
              padding: '4px 8px',
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              borderRadius: '12px',
              marginBottom: '8px',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              fontWeight: '500',
            }}
          >
            +{hiddenCount} more notification{hiddenCount === 1 ? '' : 's'}
          </div>
        )}
        
        {visibleToasts.map((toast, index) => (
          <Toast
            key={toast.id}
            toast={toast}
            onDismiss={removeToast}
            isStacked={index > 0}
            isHovered={isHovered}
            stackIndex={index}
          />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;