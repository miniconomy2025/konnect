"use client";

import React from 'react';
import { X } from 'lucide-react';
import { styles } from '@/styles/account';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <section style={styles.modal}>
      <section style={styles.modalContent}>
        <section style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>{title}</h3>
          <button onClick={onClose} style={styles.iconButton}>
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