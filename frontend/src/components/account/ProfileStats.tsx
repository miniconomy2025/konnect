"use client";

import React from 'react';
import { styles } from '@/styles/account';

interface ProfileStatsProps {
  postsCount: number | undefined;
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
    <section style={styles.stats}>
      {postsCount && (
        <section>
          <strong>{postsCount}</strong> posts
        </section>
      )}
      <button onClick={onFollowersClick} style={styles.statButton}>
        <strong>{followersCount}</strong> followers
      </button>
      <button onClick={onFollowingClick} style={styles.statButton}>
        <strong>{followingCount}</strong> following
      </button>
    </section>
  );
};

export default ProfileStats;