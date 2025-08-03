import { Color } from '@/lib/presentation';
import { Buttons, Layout, StyleHelpers, Typography } from '@/lib/sharedStyles';
import React from 'react';

interface AddPostHeaderProps {
  isSubmitting: boolean;
  canSubmit: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

export const AddPostHeader: React.FC<AddPostHeaderProps> = ({
  isSubmitting,
  canSubmit,
  onSubmit,
  onCancel,
}) => {
  return (
    <div style={Layout.header}>
      <button
        onClick={onCancel}
        style={StyleHelpers.createButton('ghost')}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = Color.Text;
          e.currentTarget.style.background = Color.Border;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = Color.Muted;
          e.currentTarget.style.background = 'transparent';
        }}
      >
        Cancel
      </button>
      
      <h1 style={Typography.h1}>
        Create Post
      </h1>
      
      <button
        onClick={onSubmit}
        disabled={isSubmitting || !canSubmit}
        style={StyleHelpers.combine(
          StyleHelpers.createButton('primary'),
          isSubmitting || !canSubmit ? Buttons.disabled : {}
        )}
        onMouseEnter={(e) => {
          if (!isSubmitting && canSubmit) {
            e.currentTarget.style.transform = 'scale(1.05)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {isSubmitting ? 'Posting...' : 'Post'}
      </button>
    </div>
  );
}; 