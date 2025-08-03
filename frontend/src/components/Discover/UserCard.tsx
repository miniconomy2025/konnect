import React from 'react';
import { Color, FontFamily, FontSize, Spacing } from '@/lib/presentation';

interface UserCardProps {
  user: {
    id: string;
    username: string;
    fullName: string;
    profileImage?: string;
  };
}

export const UserCard: React.FC<UserCardProps> = ({ user }) => {
  return (
    <section
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: Spacing.Small,
        marginBottom: Spacing.Small,
        background: Color.Surface,
        borderRadius: 10,
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
      }}
      onClick={() => {
        window.location.href = `/profile/${user.username}`;
      }}
    >
      <img
        src={user.profileImage || '/assets/images/default-profile.png'}
        alt={`${user.username}'s avatar`}
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          objectFit: 'cover',
          marginRight: Spacing.Small,
        }}
      />
      <section>
        <section style={{
          fontSize: FontSize.Large,
          fontFamily: FontFamily.Nunito,
          fontWeight: 600,
          color: Color.Text,
        }}>{user.fullName}</section>
        <section style={{
          fontSize: FontSize.Small,
          fontFamily: FontFamily.Nunito,
          color: Color.Muted,
        }}>@{user.username}</section>
      </section>
    </section>
  );
};
