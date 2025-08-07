import { ToastType } from '@/types/toast';
import { CSSProperties } from 'react';
import { Spacing, ComponentSize, FontSizeRem, BorderWidth, Radius, FontFamily } from '@/lib/presentation';

export const toastStyles = {
  container: {
    position: 'fixed' as const,
    top: Spacing.Large,
    right: Spacing.Large,
    zIndex: 9999,
    maxWidth: ComponentSize.ToastMaxWidth,
    pointerEvents: 'none' as const,
  },

  toastStack: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: Spacing.Small,
    alignItems: 'flex-end',
  },

  toast: {
    position: 'relative' as const,
    padding: `${Spacing.Medium} ${Spacing.Large}`,
    borderRadius: Radius.Medium,
    boxShadow: '0 0.25rem 0.75rem rgba(0, 0, 0, 0.15)',
    fontSize: FontSizeRem.ToastBase,
    lineHeight: '1.4',
    maxWidth: '100%',
    minWidth: ComponentSize.ToastMinWidth,
    pointerEvents: 'auto' as const,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'translateX(0) scale(1)',
    opacity: 1,
    marginBottom: '0',
    fontWeight: '400',
  },

  toastEntering: {
    transform: 'translateX(100%) scale(0.95)',
    opacity: 0,
  },

  toastExiting: {
    transform: 'translateX(100%) scale(0.95)',
    opacity: 0,
    maxHeight: '0',
    padding: `0 ${Spacing.Large}`,
    marginBottom: `-${Spacing.Small}`,
  },

  // Collapsed state (stacked)
  toastCollapsed: {
    transform: 'translateX(0) scale(0.95)',
    opacity: 0.8,
    marginBottom: '-2.8125rem', // Overlap previous toasts
    filter: 'blur(0.03125rem)',
  },

  // Hover state expansion
  toastStackHovered: {
    // When container is hovered, all toasts expand
  },

  toastHoveredExpanded: {
    transform: 'translateX(0) scale(1)',
    opacity: 1,
    marginBottom: Spacing.Small,
    filter: 'none',
  },

  toastHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.XSmall,
  },

  toastTitle: {
    fontWeight: '700' as const,
    fontSize: FontSizeRem.ToastTitle,
    marginBottom: Spacing.XSmall,
    color: 'inherit',
    fontFamily: FontFamily.VarelaRound,
  },

  toastMessage: {
    color: 'inherit',
    opacity: 0.9,
    wordWrap: 'break-word' as const,
    paddingRight: Spacing.Small,
    fontFamily: FontFamily.VarelaRound,
    fontWeight: '400',
  },

  dismissButton: {
    background: 'none',
    border: 'none',
    color: 'inherit',
    cursor: 'pointer',
    padding: Spacing.XSmall,
    borderRadius: Spacing.XSmall,
    opacity: 0.7,
    fontSize: FontSizeRem.ToastIcon,
    lineHeight: '1',
    minWidth: ComponentSize.ToastButtonSize,
    height: ComponentSize.ToastButtonSize,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.2s',
    flexShrink: 0,
    marginLeft: Spacing.Small,
    fontFamily: FontFamily.VarelaRound,
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
    padding: `${Spacing.XSmall} ${Spacing.Medium}`,
    borderRadius: Spacing.XSmall,
    fontSize: FontSizeRem.ToastSmall,
    fontWeight: '600' as const,
    marginTop: Spacing.Small,
    marginLeft: 'auto',
    display: 'block',
    transition: 'background-color 0.2s',
    fontFamily: FontFamily.VarelaRound,
  },

  actionButtonHover: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },

  progressBar: {
    position: 'absolute' as const,
    bottom: '0',
    left: '0',
    height: ComponentSize.ToastProgressHeight,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: `0 0 ${Radius.Medium} ${Radius.Medium}`,
    transformOrigin: 'left',
    transition: 'transform linear',
  },
};

export const getToastTypeStyles = (type: ToastType): CSSProperties => {
  const baseStyles = {
    color: 'white',
    border: `${BorderWidth.Thin} solid`,
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