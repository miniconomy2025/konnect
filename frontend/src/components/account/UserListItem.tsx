"use client";

import React from 'react';
import Image from 'next/image';
import { styles } from '@/styles/account';
import { Actor } from '@/types/account';
import { generateAvatarColor, generateAvatarTextColor } from '@/lib/avatarUtils';
import router from 'next/router';

interface UserListItemProps {
  user: Actor;
  following?: boolean;
}

const UserListItem: React.FC<UserListItemProps> = ({ user, following = false }) => {
  return (
    <section style={styles.userListItem}
        onClick={() => {
          router.push(`/Discover?user=${user.username}`);
        }}>
      <section style={styles.userInfo}>
        {user.avatarUrl ? (
          <Image 
            src={user.avatarUrl} 
            alt={user.displayName} 
            width={48} 
            height={48} 
            style={styles.userAvatar}
            onError={(e) => {
              e.currentTarget.src = '/assets/images/missingAvatar.jpg';
            }}
          />
        ) : (
          <abbr
            title={user.displayName}
            style={{
              ...styles.userAvatar,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: '600',
              fontFamily: 'Nunito, sans-serif',
              color: '#333',
              background: 'linear-gradient(135deg, #007bff22, #007bff44)',
              textDecoration: 'none',
              textTransform: 'uppercase',
              border: '1px solid #e5e7eb',
            }}
          >
            {user.displayName.charAt(0)}
          </abbr>
        )}
        <section style={styles.userDetails}>
          <p style={styles.userUsername}>{user.username}</p>
          <p style={styles.userDisplayName}>{user.displayName}</p>
        </section>
      </section>
    </section>
  );
};

export default UserListItem;