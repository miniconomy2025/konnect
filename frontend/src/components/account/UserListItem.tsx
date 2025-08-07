"use client";

import React from 'react';
import Image from 'next/image';
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
        <Image 
          src={user.avatarUrl || '/assets/images/missingAvatar.jpg'} 
          alt={user.displayName} 
          width={48} 
          height={48} 
          style={styles.userAvatar}
          onError={(e) => {
            e.currentTarget.src = '/assets/images/missingAvatar.jpg';
          }}
          />
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