import { Forms } from '@/lib/sharedStyles';
import React from 'react';

interface ErrorMessageProps {
  error: string | null;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
  if (!error) return null;

  return (
    <div style={Forms.error}>
      {error}
    </div>
  );
}; 