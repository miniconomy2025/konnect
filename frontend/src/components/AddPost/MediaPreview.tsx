import { Color, Spacing } from '@/lib/presentation';
import { Buttons, Layout, Media, StyleHelpers, Utils } from '@/lib/sharedStyles';
import React from 'react';

interface MediaPreviewProps {
  mediaPreview: string | null;
  imageFile: File | null;
  onRemove: () => void;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({
  mediaPreview,
  imageFile,
  onRemove,
}) => {
  if (!mediaPreview) return null;

  return (
    <div style={StyleHelpers.combine(Layout.card, Utils.relative)}>
      {imageFile?.type.startsWith('image/') ? (
        <img
          src={mediaPreview}
          alt="Media preview"
          style={Media.image}
        />
      ) : (
        <video
          src={mediaPreview}
          controls
          style={Media.video}
        />
      )}
      
      <button
        type="button"
        onClick={onRemove}
        style={StyleHelpers.combine(
          Buttons.icon,
          Utils.absolute,
          {
            top: Spacing.Small,
            right: Spacing.Small,
            background: 'rgba(0, 0, 0, 0.7)',
            color: Color.Surface,
            width: '2rem',
            height: '2rem',
            fontSize: '1.25rem',
          }
        )}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 59, 48, 0.9)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
        }}
      >
        ×
      </button>
    </div>
  );
}; 