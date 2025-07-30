import React from 'react';
import { Settings } from 'lucide-react';
import styles from '@/styles/account';

interface HeaderProps {
  username: string;
  onSettingsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ username, onSettingsClick }) => (
  <section style={styles.header}>
    <section style={styles.headerContent}>
      <h1 style={styles.headerTitle}>{username}</h1>
      <button onClick={onSettingsClick} style={styles.iconButton}>
        <Settings size={24} />
      </button>
    </section>
  </section>
);

export default Header;