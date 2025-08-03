import { Color, Spacing } from '@/lib/presentation';
import { Forms, Layout, StyleHelpers, Typography, Utils } from '@/lib/sharedStyles';
import React, { useRef } from 'react';

interface MediaUploadProps {
  imageFile: File | null;
  validMediaTypes: string[];
  maxSizeMB: number;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  imageFile,
  validMediaTypes,
  maxSizeMB,
  onFileSelect,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      style={StyleHelpers.combine(
        Layout.card,
        Utils.textCenter,
        {
          border: `2px dashed ${Color.Border}`,
          cursor: 'pointer',
        }
      )}
      onClick={handleClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = Color.Primary;
        e.currentTarget.style.background = Color.Background;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = Color.Border;
        e.currentTarget.style.background = Color.Surface;
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onFileSelect}
        style={Forms.fileInput}
      />
      
      <div style={StyleHelpers.combine(
        Typography.muted,
        {
          fontSize: '1.75rem',
          marginBottom: Spacing.Small,
        }
      )}>
        📷
      </div>
      
      <p style={StyleHelpers.createText('body', { fontWeight: 500 })}>
        {imageFile ? 'Change image' : 'Add photo'}
      </p>
      
      <p style={Typography.caption}>
        {validMediaTypes?.map(type => type.split('/')[1]).join(', ')} up to {maxSizeMB}MB
      </p>
    </div>
  );
}; 