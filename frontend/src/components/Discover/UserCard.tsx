import React from 'react';
import { Color, FontFamily, FontSize, Spacing } from '@/lib/presentation';
import { DiscoverUser } from '@/types/discover';
import { useRouter } from 'next/router';

interface UserCardProps {
  user: DiscoverUser;
}

export const UserCard: React.FC<UserCardProps> = ({ user }) => {
    const router = useRouter();
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
        router.push(`/Discover?user=${user.username}`);
      }}
    >
      <img
        src={user.avatarUrl || '/assets/images/default-profile.png'}
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
        }}>{user.displayName}</section>
        <section style={{
          fontSize: FontSize.Small,
          fontFamily: FontFamily.Nunito,
          color: Color.Muted,
        }}>@{user.username}</section>
      </section>
    </section>
  );
};
