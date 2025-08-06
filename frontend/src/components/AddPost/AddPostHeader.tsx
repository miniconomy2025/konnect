import { Color } from '@/lib/presentation';
import { Buttons, StyleHelpers } from '@/lib/sharedStyles';
import { Header } from '@/components/UI';
import { X } from 'lucide-react';
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
  const submitButtonStyle = StyleHelpers.combine(
    StyleHelpers.createButton('primary'),
    {
      fontSize: '0.875rem',
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
    },
    isSubmitting || !canSubmit ? Buttons.disabled : {}
  );

  return (
    <Header
      title="Create Post"
      leftAction={{
        icon: <X size={20} />,
        onClick: onCancel,
        label: "Cancel post creation",
      }}
      rightAction={{
        icon: (
          <button
            onClick={onSubmit}
            disabled={isSubmitting || !canSubmit}
            style={submitButtonStyle}
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
        ),
        onClick: () => {}, // Handled by the button itself
        label: "Submit post",
      }}
      showBorder={true}
    />
  );
}; 