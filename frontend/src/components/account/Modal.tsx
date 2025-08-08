"use client";

import { styles } from '@/styles/account';
import { X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string; // e.g., 'min(95vw, 720px)'
  fullScreenOnMobile?: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth, fullScreenOnMobile = true }) => {
  if (!isOpen) return null;

  const [isVisible, setIsVisible] = useState(false);
  const [isSmall, setIsSmall] = useState(false);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const titleId = useRef(`modal-title-${Math.random().toString(36).slice(2)}`).current;
  const onCloseRef = useRef(onClose);
  // Keep onClose ref up to date without retriggering effects
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    setIsVisible(true);
    previouslyFocusedRef.current = document.activeElement as HTMLElement;
    const onResize = () => setIsSmall(window.innerWidth < 480);
    onResize();
    window.addEventListener('resize', onResize);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current?.();
      if (e.key === 'Tab') {
        const root = containerRef.current;
        if (!root) return;
        const focusables = root.querySelectorAll<HTMLElement>(
          'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        const list = Array.from(focusables).filter(el => !el.hasAttribute('disabled'));
        if (list.length === 0) return;
        const first = list[0];
        const last = list[list.length - 1];
        const active = document.activeElement as HTMLElement;
        if (e.shiftKey) {
          if (active === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (active === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    // Focus the modal container
    setTimeout(() => {
      containerRef.current?.focus();
    }, 0);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKeyDown);
      setIsVisible(false);
      previouslyFocusedRef.current?.focus?.();
    };
  }, []);

  const overlayStyle: React.CSSProperties = {
    ...styles.modal,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    opacity: isVisible ? 1 : 0,
    transition: 'opacity 150ms ease-out',
    ...(isSmall && {
      alignItems: 'flex-end',
      padding: 0,
    }),
  };

  const contentBase = { ...styles.modalContent } as React.CSSProperties;
  if (maxWidth) contentBase.width = maxWidth;
  
  if (isSmall && fullScreenOnMobile) {
    Object.assign(contentBase, {
      width: '100vw',
      height: 'auto',
      maxHeight: '85vh',
      margin: 0,
      borderRadius: '16px 16px 0 0',
      position: 'relative',
    });
  }

  const contentStyle: React.CSSProperties = {
    ...contentBase,
    transform: isVisible 
      ? 'translateY(0)' 
      : isSmall && fullScreenOnMobile 
        ? 'translateY(100%)' 
        : 'scale(0.98)',
    transition: isSmall && fullScreenOnMobile 
      ? 'transform 250ms cubic-bezier(0.4, 0, 0.2, 1)' 
      : 'transform 150ms ease-out',
    outline: 'none',
  };

  return (
    <section
      style={overlayStyle}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCloseRef.current?.();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <section ref={containerRef as any} tabIndex={-1} style={contentStyle}>
        {isSmall && fullScreenOnMobile && (
          <div style={{
            width: 32,
            height: 4,
            backgroundColor: '#d1d5db',
            borderRadius: 2,
            margin: '8px auto',
            cursor: 'pointer',
          }} onClick={() => onCloseRef.current?.()} />
        )}
        <section style={styles.modalHeader}>
          <h3 id={titleId} style={styles.modalTitle}>{title}</h3>
          <button onClick={() => onCloseRef.current?.()} style={styles.iconButton} aria-label="Close">
            <X size={20} />
          </button>
        </section>
        <section style={styles.modalBody}>
          {children}
        </section>
      </section>
    </section>
  );
};

export default Modal;