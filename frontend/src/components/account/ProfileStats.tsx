"use client";

import React from 'react';
import { styles } from '@/styles/account';

interface ProfileStatsProps {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  onFollowersClick: () => void;
  onFollowingClick: () => void;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ 
  postsCount, 
  followersCount, 
  followingCount, 
  onFollowersClick, 
  onFollowingClick 
}) => {
  return (
    <div style={styles.stats}>
      <span>
        <strong>{postsCount}</strong> posts
      </span>
      <button onClick={onFollowersClick} style={styles.statButton}>
        <strong>{followersCount}</strong> followers
      </button>
      <button onClick={onFollowingClick} style={styles.statButton}>
        <strong>{followingCount}</strong> following
      </button>
    </div>
  );
};

export default ProfileStats;