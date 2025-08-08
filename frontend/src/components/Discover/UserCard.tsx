import { generateAvatarColor, generateAvatarTextColor } from '@/lib/avatarUtils';
import { Color, FontFamily, FontSize, Spacing } from '@/lib/presentation';
import type { RecentUser } from '@/lib/sessionCache';
import { addRecentlyViewedUser } from '@/lib/sessionCache';
import { UserProfile } from '@/types/account';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React from 'react';

type UserCardUser = UserProfile | RecentUser;

interface UserCardProps {
  user: UserCardUser;
}

export const UserCard: React.FC<UserCardProps> = ({ user }) => {
    const router = useRouter();
  return (
    <section
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: Spacing.Medium,
        background: Color.Surface,
        border: `1px solid ${Color.Border}`,
        borderRadius: 12,
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
        cursor: 'pointer',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        minHeight: 72,
      }}
      tabIndex={0}
      role="button"
      aria-label={`View ${user.displayName} profile`}
      onClick={() => {
        addRecentlyViewedUser({
          activityPubId: user.activityPubId,
          displayName: user.displayName,
          handle: user.handle,
          avatarUrl: user.avatarUrl,
          username: user.username,
          hostServer: user.hostServer,
          isLocal: user.isLocal,
        });
        router.push(`/Discover?user=${user.handle}`);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          addRecentlyViewedUser({
            activityPubId: user.activityPubId,
            displayName: user.displayName,
            handle: user.handle,
            avatarUrl: user.avatarUrl,
            username: user.username,
            hostServer: user.hostServer,
            isLocal: user.isLocal,
          });
          router.push(`/Discover?user=${user.handle}`);
        }
      }}
    >
      {user.avatarUrl ? (
        <Image
          width={48}
          height={48}
          src={user.avatarUrl}
          alt={`${user.username}'s avatar`}
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            objectFit: 'cover',
            marginRight: Spacing.Medium,
          }}
          onError={(e) => {
            e.currentTarget.src = '/assets/images/missingAvatar.jpg';
          }}
        />
      ) : (
        <abbr
          title={user.displayName}
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            marginRight: Spacing.Medium,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: '600',
            fontFamily: FontFamily.Nunito,
            color: generateAvatarTextColor(user.handle),
            background: generateAvatarColor(user.handle),
            textDecoration: 'none',
            textTransform: 'uppercase',
            border: `1px solid ${Color.Border}`,
            flexShrink: 0,
          }}
        >
          {user.displayName.charAt(0)}
        </abbr>
      )}
      <section style={{ minWidth: 0 }}>
        <section title={user.displayName} style={{
          fontSize: FontSize.Large,
          fontFamily: FontFamily.Nunito,
          fontWeight: 700,
          color: Color.Text,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>{user.displayName}</section>
        <section title={user.handle} style={{
          fontSize: FontSize.Base,
          fontFamily: FontFamily.Nunito,
          color: Color.Muted,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>{user.handle}</section>
      </section>
    </section>
  );
};
