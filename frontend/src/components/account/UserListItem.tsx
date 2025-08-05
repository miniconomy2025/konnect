"use client";

import React from 'react';
import { styles } from '@/styles/account';
import { Actor } from '@/types/account';

interface UserListItemProps {
  user: Actor;
  following?: boolean;
}

const UserListItem: React.FC<UserListItemProps> = ({ user, following = false }) => {
  return (
    <section style={styles.userListItem}>
      <section style={styles.userInfo}>
        <img src={user.avatarUrl} alt={user.displayName} style={styles.userAvatar} />
        <section style={styles.userDetails}>
          <p style={styles.userUsername}>{user.username}</p>
          <p style={styles.userDisplayName}>{user.displayName}</p>
        </section>
      </section>
        <button style={styles.followButton}>{following ? 'Follow' : 'Unfollow'}</button>
    </section>
  );
};

export default UserListItem;