import { ToastType } from '@/types/toast';
import { CSSProperties } from 'react';

export const toastStyles = {
  container: {
    position: 'fixed' as const,
    top: '20px',
    right: '20px',
    zIndex: 9999,
    maxWidth: '400px',
    pointerEvents: 'none' as const,
  },

  toastStack: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    alignItems: 'flex-end',
  },

  toast: {
    position: 'relative' as const,
    padding: '16px 20px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    fontSize: '14px',
    lineHeight: '1.4',
    maxWidth: '100%',
    minWidth: '280px',
    pointerEvents: 'auto' as const,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'translateX(0) scale(1)',
    opacity: 1,
    marginBottom: '0px',
    fontWeight: '400',
  },

  toastEntering: {
    transform: 'translateX(100%) scale(0.95)',
    opacity: 0,
  },

  toastExiting: {
    transform: 'translateX(100%) scale(0.95)',
    opacity: 0,
    maxHeight: '0px',
    padding: '0 20px',
    marginBottom: '-8px',
  },

  // Collapsed state (stacked)
  toastCollapsed: {
    transform: 'translateX(0) scale(0.95)',
    opacity: 0.8,
    marginBottom: '-45px', // Overlap previous toasts
    filter: 'blur(0.5px)',
  },

  // Hover state expansion
  toastStackHovered: {
    // When container is hovered, all toasts expand
  },

  toastHoveredExpanded: {
    transform: 'translateX(0) scale(1)',
    opacity: 1,
    marginBottom: '8px',
    filter: 'none',
  },

  toastHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '4px',
  },

  toastTitle: {
    fontWeight: '700' as const,
    fontSize: '15px',
    marginBottom: '4px',
    color: 'inherit',
    fontFamily: 'var(--font-nunito), Arial, Helvetica, sans-serif',
  },

  toastMessage: {
    color: 'inherit',
    opacity: 0.9,
    wordWrap: 'break-word' as const,
    paddingRight: '8px',
    fontFamily: 'var(--font-nunito), Arial, Helvetica, sans-serif',
    fontWeight: '400',
  },

  dismissButton: {
    background: 'none',
    border: 'none',
    color: 'inherit',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    opacity: 0.7,
    fontSize: '18px',
    lineHeight: '1',
    minWidth: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.2s',
    flexShrink: 0,
    marginLeft: '8px',
    fontFamily: 'var(--font-nunito), Arial, Helvetica, sans-serif',
    fontWeight: '400',
  },

  dismissButtonHover: {
    opacity: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  actionButton: {
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    color: 'inherit',
    cursor: 'pointer',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '600' as const,
    marginTop: '8px',
    marginLeft: 'auto',
    display: 'block',
    transition: 'background-color 0.2s',
    fontFamily: 'var(--font-nunito), Arial, Helvetica, sans-serif',
  },

  actionButtonHover: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },

  progressBar: {
    position: 'absolute' as const,
    bottom: '0',
    left: '0',
    height: '3px',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: '0 0 8px 8px',
    transformOrigin: 'left',
    transition: 'transform linear',
  },
};

export const getToastTypeStyles = (type: ToastType): CSSProperties => {
  const baseStyles = {
    color: 'white',
    border: '1px solid',
  };

  switch (type) {
    case 'success':
      return {
        ...baseStyles,
        backgroundColor: '#10b981',
        borderColor: '#059669',
      };
    case 'error':
      return {
        ...baseStyles,
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
      };
    case 'warning':
      return {
        ...baseStyles,
        backgroundColor: '#f59e0b',
        borderColor: '#d97706',
        color: '#1f2937', // Darker text for better contrast on yellow
      };
    case 'info':
      return {
        ...baseStyles,
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
      };
    default:
      return {
        ...baseStyles,
        backgroundColor: '#6b7280',
        borderColor: '#4b5563',
      };
  }
};

export const getToastIcon = (type: ToastType): string => {
  switch (type) {
    case 'success':
      return '✓';
    case 'error':
      return '✕';
    case 'warning':
      return '⚠';
    case 'info':
      return 'ℹ';
    default:
      return '•';
  }
};