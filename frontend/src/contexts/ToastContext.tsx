"use client";

import { Toast, ToastContextType, ToastOptions } from '@/types/toast';
import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const generateId = () => `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addToast = useCallback((toastOptions: Omit<Toast, 'id' | 'createdAt'>): string => {
    const id = generateId();
    const newToast: Toast = {
      id,
      createdAt: Date.now(),
      duration: 5000, // Default 5 seconds
      dismissible: true, // Default dismissible
      ...toastOptions,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast if duration is set
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const value: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Convenience hook for common toast types
export const useToastHelpers = () => {
  const { addToast } = useToast();

  const success = useCallback((message: string, options?: ToastOptions) => {
    return addToast({
      type: 'success',
      message,
      ...options,
    });
  }, [addToast]);

  const error = useCallback((message: string, options?: ToastOptions) => {
    return addToast({
      type: 'error',
      message,
      duration: 7000, // Errors stay longer
      ...options,
    });
  }, [addToast]);

  const info = useCallback((message: string, options?: ToastOptions) => {
    return addToast({
      type: 'info',
      message,
      ...options,
    });
  }, [addToast]);

  const warning = useCallback((message: string, options?: ToastOptions) => {
    return addToast({
      type: 'warning',
      message,
      duration: 6000,
      ...options,
    });
  }, [addToast]);

  return { success, error, info, warning };
};