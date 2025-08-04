"use client";

import React from 'react';
import { styles } from '@/styles/account';
import { Actor } from '@/types/account';

interface UserListItemProps {
  user: Actor;
  showFollowButton?: boolean;
}

const UserListItem: React.FC<UserListItemProps> = ({ user, showFollowButton = false }) => {
  return (
    <section style={styles.userListItem}>
      <section style={styles.userInfo}>
        <img src={user.avatarUrl} alt={user.displayName} style={styles.userAvatar} />
        <section style={styles.userDetails}>
          <p style={styles.userUsername}>{user.username}</p>
          <p style={styles.userDisplayName}>{user.displayName}</p>
        </section>
      </section>
      {showFollowButton && (
        <button style={styles.followButton}>Follow</button>
      )}
    </section>
  );
};

export default UserListItem;