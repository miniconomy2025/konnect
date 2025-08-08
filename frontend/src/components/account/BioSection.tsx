"use client";

import { Color, FontFamily, FontSize, Spacing } from '@/lib/presentation';
import { styles } from '@/styles/account';
import { Check, Edit2, X } from 'lucide-react';
import React from 'react';

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
  isLoading?: boolean;
}

const BioSection: React.FC<BioSectionProps> = ({ 
  displayName, 
  bio, 
  isEditingBio, 
  tempBio, 
  isEditable,
  isLoading = false,
  setTempBio, 
  onEditBio, 
  onSaveBio, 
  onCancelBio 
}) => {
  return (
    <section style={{
      ...styles.bioSection,
      marginTop: Spacing.Medium,
    }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      {isEditingBio ? (
        <section style={{
          display: 'flex',
          flexDirection: 'column',
          gap: Spacing.Small,
        }}>
          <textarea
            value={tempBio}
            onChange={(e) => setTempBio(e.target.value)}
            placeholder="Tell us about yourself..."
            style={{
              ...styles.bioTextarea,
              border: `1px solid ${Color.Border}`,
              borderRadius: 8,
              padding: Spacing.Small,
              fontFamily: FontFamily.Nunito,
              fontSize: FontSize.Base,
              resize: 'vertical',
              minHeight: 80,
              backgroundColor: Color.Surface,
            }}
          />
          <section style={{
            display: 'flex',
            gap: Spacing.XSmall,
            justifyContent: 'flex-end',
          }}>
            <button 
              onClick={onSaveBio} 
              disabled={isLoading}
              style={{
                ...styles.saveButton,
                backgroundColor: isLoading ? '#9ca3af' : Color.Primary,
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '6px 12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: FontSize.Small,
                fontWeight: 500,
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? (
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
              onClick={onCancelBio} 
              style={{
                ...styles.cancelButton,
                backgroundColor: Color.Surface,
                color: Color.Text,
                border: `1px solid ${Color.Border}`,
                borderRadius: 6,
                padding: '6px 12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                cursor: 'pointer',
                fontSize: FontSize.Small,
                fontWeight: 500,
              }}
            >
              <X size={14} /> Cancel
            </button>
          </section>
        </section>
      ) : (
        <section style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: Spacing.Small,
        }}>
          <div style={{ flex: 1 }}>
            {bio ? (
              <p style={{
                ...styles.bioText,
                margin: 0,
                lineHeight: 1.5,
                fontSize: FontSize.Base,
                color: Color.Text,
              }}>{bio}</p>
            ) : (
              <p style={{
                margin: 0,
                fontStyle: 'italic',
                color: '#9ca3af',
                fontSize: FontSize.Base,
              }}>No bio yet</p>
            )}
          </div>

          {isEditable && (
            <button 
              onClick={onEditBio} 
              disabled={isLoading}
              aria-label="Edit bio"
              style={{
                ...styles.editButton,
                backgroundColor: '#f8fafc',
                border: `1px solid ${Color.Border}`,
                borderRadius: 8,
                padding: '8px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                color: isLoading ? '#9ca3af' : '#374151',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                opacity: isLoading ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.borderColor = Color.Border;
                }
              }}
            >
              <Edit2 size={16} />
            </button>
          )}
        </section>
      )}
    </section>
  );
};

export default BioSection;