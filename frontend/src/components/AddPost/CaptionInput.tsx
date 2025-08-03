import { Color } from '@/lib/presentation';
import { Forms, Layout, StyleHelpers, Typography, Utils } from '@/lib/sharedStyles';
import React, { useEffect, useRef } from 'react';

interface CaptionInputProps {
  caption: string;
  charCount: number;
  maxCharacters: number;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const CaptionInput: React.FC<CaptionInputProps> = ({
  caption,
  charCount,
  maxCharacters,
  onChange,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [caption]);

  return (
    <div style={Layout.card}>
      <textarea
        ref={textareaRef}
        value={caption}
        onChange={onChange}
        placeholder="What's on your mind?"
        style={StyleHelpers.combine(
          Forms.textarea,
          { border: 'none', background: 'transparent' }
        )}
      />
      
      {/* Character Count */}
      <div style={Utils.textRight}>
        <span style={StyleHelpers.combine(
          Typography.muted,
          { color: charCount > maxCharacters * 0.8 ? Color.Error : Color.Muted }
        )}>
          {charCount}/{maxCharacters}
        </span>
      </div>
    </div>
  );
}; 