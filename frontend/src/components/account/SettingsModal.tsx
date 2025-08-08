"use client";

import { styles } from '@/styles/account';
import { Check, Edit2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface SettingsModalProps {
  displayName: string;
  isEditingName: boolean;
  tempName: string;
  setTempName: (value: string) => void;
  onEditName: () => void;
  onSaveName: () => void;
  onCancelName: () => void;
  isLoadingName?: boolean;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  displayName, 
  isEditingName, 
  tempName, 
  setTempName, 
  onEditName, 
  onSaveName, 
  onCancelName,
  isLoadingName = false
}) => {
  const [isSmall, setIsSmall] = useState(false);

  useEffect(() => {
    const onResize = () => setIsSmall(window.innerWidth < 480);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const logOut = () => {
    sessionStorage.clear();
    window.location.href = '/Login';
  };
  return (
    <section style={styles.settingsContent}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <section style={styles.settingItem}>
        <label style={styles.settingLabel}>Display Name</label>
        {isEditingName ? (
          <section style={{
            ...styles.settingInputGroup,
            flexDirection: isSmall ? 'column' : 'row',
            gap: isSmall ? '0.75rem' : '0.5rem',
            alignItems: isSmall ? 'stretch' : 'center',
          }}>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              style={{
                ...styles.settingInput,
                flex: isSmall ? 'none' : 1,
                marginBottom: isSmall ? 0 : 'unset',
              }}
              placeholder="Enter Display name"
              disabled={isLoadingName}
            />
            <section style={{
              display: 'flex',
              gap: '0.5rem',
              justifyContent: isSmall ? 'stretch' : 'flex-start',
            }}>
              <button 
                onClick={onSaveName} 
                disabled={isLoadingName}
                style={{
                  ...styles.saveButton,
                  backgroundColor: isLoadingName ? '#9ca3af' : '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: isSmall ? '0.75rem 1rem' : '6px 12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  cursor: isLoadingName ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  opacity: isLoadingName ? 0.7 : 1,
                  flex: isSmall ? 1 : 'none',
                }}
              >
                {isLoadingName ? (
                  <>
                    <div style={{
                      width: 14,
                      height: 14,
                      border: '2px solid #fff',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={14} /> Save
                  </>
                )}
              </button>
              <button 
                onClick={onCancelName} 
                disabled={isLoadingName}
                style={{
                  ...styles.cancelButton,
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  border: `1px solid #ef4444`,
                  borderRadius: 6,
                  padding: isSmall ? '0.75rem 1rem' : '6px 12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  cursor: isLoadingName ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  opacity: isLoadingName ? 0.5 : 1,
                  flex: isSmall ? 1 : 'none',
                }}
              >
                <X size={14} /> Cancel
              </button>
            </section>
          </section>
        ) : (
          <section style={styles.settingRow}>
            <section style={styles.settingText}>{displayName}</section>
            <button 
              onClick={onEditName} 
              disabled={isLoadingName}
              style={{
                ...styles.editButton,
                cursor: isLoadingName ? 'not-allowed' : 'pointer',
                opacity: isLoadingName ? 0.5 : 1,
              }}
            >
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