"use client";

import React from 'react';
import { Check, X, Edit2 } from 'lucide-react';
import { styles } from '@/styles/account';

interface BioSectionProps {
  displayName: string;
  bio: string;
  isEditingBio: boolean;
  tempBio: string;
  setTempBio: (value: string) => void;
  onEditBio: () => void;
  onSaveBio: () => void;
  onCancelBio: () => void;
  isEditable?: boolean;
}

const BioSection: React.FC<BioSectionProps> = ({ 
  displayName, 
  bio, 
  isEditingBio, 
  tempBio, 
  isEditable,
  setTempBio, 
  onEditBio, 
  onSaveBio, 
  onCancelBio 
}) => {
  return (
    <section style={styles.bioSection}>
      <h3 style={styles.bioName}>{displayName}</h3>

      {isEditingBio ? (
        <section style={styles.bioEditContainer}>
          <textarea
            value={tempBio}
            onChange={(e) => setTempBio(e.target.value)}
            style={styles.bioTextarea}
            placeholder="Write a bio..."
          />
          <section>
            <button onClick={onSaveBio} style={styles.saveButton}>
              <Check size={16} />
            </button>
            <button onClick={onCancelBio} style={styles.cancelButton}>
              <X size={16} />
            </button>
          </section>
        </section>
      ) : (
        <section style={styles.bioEditContainer}>
          <p style={styles.bioText}>{bio}</p>

          {isEditable && (
            <button onClick={onEditBio} style={styles.editButton}>
              <Edit2 size={16} />
            </button>
          )}
        </section>
      )}
    </section>
  );
};

export default BioSection;