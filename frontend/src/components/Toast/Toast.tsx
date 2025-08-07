"use client";

import { getToastIcon, getToastTypeStyles, toastStyles } from '@/styles/toast';
import { Toast as ToastType } from '@/types/toast';
import React, { useEffect, useRef, useState } from 'react';

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
  isStacked: boolean;
  isHovered: boolean;
  stackIndex: number;
}

const Toast: React.FC<ToastProps> = ({ 
  toast, 
  onDismiss, 
  isStacked, 
  isHovered, 
  stackIndex 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const [dismissHovered, setDismissHovered] = useState(false);
  const [actionHovered, setActionHovered] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const pausedTimeRef = useRef<number>(0);

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Progress bar animation
  useEffect(() => {
    if (!toast.duration || toast.duration <= 0 || isPaused) return;

    const startProgress = () => {
      const startTime = Date.now() - pausedTimeRef.current;
      startTimeRef.current = startTime;
      
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = Math.max(0, toast.duration! - elapsed);
        const newProgress = (remaining / toast.duration!) * 100;
        
        setProgress(newProgress);
        
        if (remaining <= 0) {
          handleDismiss();
        }
      }, 16); // ~60fps
    };

    startProgress();

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [toast.duration, isPaused]);

  // Pause on hover
  useEffect(() => {
    if (isHovered && !isPaused) {
      setIsPaused(true);
      pausedTimeRef.current = Date.now() - startTimeRef.current;
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    } else if (!isHovered && isPaused) {
      setIsPaused(false);
    }
  }, [isHovered, isPaused]);

  const handleDismiss = () => {
    if (isExiting) return;
    
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 300); // Match exit animation duration
  };

  const handleClick = () => {
    if (toast.action) {
      toast.action.onClick();
    }
  };

  const getToastStyle = () => {
    const baseStyle = {
      ...toastStyles.toast,
      ...getToastTypeStyles(toast.type),
    };

    if (isExiting) {
      return {
        ...baseStyle,
        ...toastStyles.toastExiting,
      };
    }

    if (!isVisible) {
      return {
        ...baseStyle,
        ...toastStyles.toastEntering,
      };
    }

    if (isStacked && !isHovered) {
      const stackOffset = Math.min(stackIndex * 4, 12); // Max 12px offset for deep stacks
      return {
        ...baseStyle,
        ...toastStyles.toastCollapsed,
        transform: `translateX(${stackOffset}px) scale(${0.95 - stackIndex * 0.02})`,
        zIndex: 9999 - stackIndex,
      };
    }

    if (isStacked && isHovered) {
      return {
        ...baseStyle,
        ...toastStyles.toastHoveredExpanded,
        zIndex: 9999 - stackIndex,
      };
    }

    return baseStyle;
  };

  const dismissButtonStyle = {
    ...toastStyles.dismissButton,
    ...(dismissHovered ? toastStyles.dismissButtonHover : {}),
  };

  const actionButtonStyle = {
    ...toastStyles.actionButton,
    ...(actionHovered ? toastStyles.actionButtonHover : {}),
  };

  return (
    <div
      style={getToastStyle()}
      onClick={handleClick}
      role="alert"
      aria-live="polite"
    >
      <div style={toastStyles.toastHeader}>
        <div>
          {toast.title && (
            <div style={toastStyles.toastTitle}>
              {getToastIcon(toast.type)} {toast.title}
            </div>
          )}
          <div style={toastStyles.toastMessage}>
            {!toast.title && `${getToastIcon(toast.type)} `}
            {toast.message}
          </div>
        </div>
        
        {toast.dismissible && (
          <button
            style={dismissButtonStyle}
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            onMouseEnter={() => setDismissHovered(true)}
            onMouseLeave={() => setDismissHovered(false)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        )}
      </div>

      {toast.action && (
        <button
          style={actionButtonStyle}
          onClick={(e) => {
            e.stopPropagation();
            toast.action!.onClick();
          }}
          onMouseEnter={() => setActionHovered(true)}
          onMouseLeave={() => setActionHovered(false)}
        >
          {toast.action.label}
        </button>
      )}

      {toast.duration && toast.duration > 0 && !isPaused && (
        <div
          style={{
            ...toastStyles.progressBar,
            transform: `scaleX(${progress / 100})`,
            transitionDuration: isPaused ? '0s' : '16ms',
          }}
        />
      )}
    </div>
  );
};

export default Toast;