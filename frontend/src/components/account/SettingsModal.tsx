"use client";

import React from 'react';
import { Check, X, Edit2 } from 'lucide-react';
import { styles } from '@/styles/account';

interface SettingsModalProps {
  displayName: string;
  isEditingName: boolean;
  tempName: string;
  setTempName: (value: string) => void;
  onEditName: () => void;
  onSaveName: () => void;
  onCancelName: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  displayName, 
  isEditingName, 
  tempName, 
  setTempName, 
  onEditName, 
  onSaveName, 
  onCancelName 
}) => {

    const logOut = () => {
        localStorage.clear();
        window.location.href = '/Login';
    };
  return (
    <section style={styles.settingsContent}>
      <section style={styles.settingItem}>
        <label style={styles.settingLabel}>User Name</label>
        {isEditingName ? (
          <section style={styles.settingInputGroup}>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              style={styles.settingInput}
              placeholder="Enter user name"
            />
            <button onClick={onSaveName} style={styles.saveButton}>
              <Check size={16} />
            </button>
            <button onClick={onCancelName} style={styles.cancelButton}>
              <X size={16} />
            </button>
          </section>
        ) : (
          <section style={styles.settingRow}>
            <section style={styles.settingText}>{displayName}</section>
            <button onClick={onEditName} style={styles.editButton}>
              <Edit2 size={16} />
            </button>
          </section>
        )}
      </section>
      
      <section style={styles.settingsMenu}>
        <button 
            onClick={logOut}
            style={{...styles.settingMenuButton, ...styles.settingMenuButtonDanger}}>
          Sign Out
        </button>
      </section>
    </section>
  );
};

export default SettingsModal;