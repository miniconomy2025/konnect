"use client";

import React from 'react';
import { Settings } from 'lucide-react';
import { SettingsHeader } from '@/components/UI';

interface HeaderProps {
  username: string;
  onSettingsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ username, onSettingsClick }) => {
  return (
    <SettingsHeader 
      title={username}
      onSettings={onSettingsClick}
    />
  );
};

export default Header;