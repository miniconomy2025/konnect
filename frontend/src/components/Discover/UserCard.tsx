import React, { useState } from 'react';
import Image from 'next/image';
import { Color, FontFamily, FontSize, Spacing, Gradient, ComponentSize, BorderWidth } from '@/lib/presentation';
import { useRouter } from 'next/router';
import { UserProfile } from '@/types/account';
import { generateAvatarColor, generateAvatarTextColor } from '@/lib/avatarUtils';

interface UserCardProps {
  user: UserProfile;
}

export const UserCard: React.FC<UserCardProps> = ({ user }) => {
    const router = useRouter();
    const [isHovered, setIsHovered] = useState(false);
  return (
    <section
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: isHovered ? '0.0625rem' : '0',
        marginLeft: Spacing.Medium,
        marginRight: Spacing.Medium,
        marginBottom: Spacing.Small,
        background: isHovered 
          ? `${Gradient.Brand}` 
          : Color.Background,
        borderRadius: Spacing.MediumSmall,
        boxShadow: 'none',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'translateY(-0.0625rem) scale(1.01)' : 'translateY(0) scale(1)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        router.push(`/Discover?user=${user.handle}`);
      }}
    >
      <section
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          background: Color.Surface,
          borderRadius: isHovered 
            ? `calc(${Spacing.MediumSmall} - 0.0625rem)` 
            : Spacing.MediumSmall,
          padding: Spacing.Small,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: isHovered 
            ? '0 0.25rem 0.75rem rgba(0, 0, 0, 0.08)' 
            : '0 0.125rem 0.375rem rgba(0, 0, 0, 0.05)',
        }}
      >
        {user.avatarUrl ? (
          <Image
            width={48}
            height={48}
            src={user.avatarUrl}
            alt={`${user.username}'s avatar`}
            style={{
              width: ComponentSize.AvatarSmall,
              height: ComponentSize.AvatarSmall,
              borderRadius: '50%',
              objectFit: 'cover',
              marginRight: Spacing.Small,
            }}
            onError={(e) => {
              e.currentTarget.src = '/assets/images/missingAvatar.jpg';
            }}
          />
        ) : (
          <abbr
            title={user.displayName}
            style={{
              width: ComponentSize.AvatarSmall,
              height: ComponentSize.AvatarSmall,
              borderRadius: '50%',
              marginRight: Spacing.Small,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: FontSize.Base,
              fontWeight: '600',
              fontFamily: FontFamily.VarelaRound,
              color: generateAvatarTextColor(user.handle),
              background: generateAvatarColor(user.handle),
              textDecoration: 'none',
              textTransform: 'uppercase',
              border: `${BorderWidth.Thin} solid ${Color.Border}`,
              flexShrink: 0,
            }}
          >
            {user.displayName.charAt(0)}
          </abbr>
        )}
        <section>
          <section style={{
            fontSize: FontSize.Large,
            fontFamily: FontFamily.VarelaRound,
            fontWeight: 600,
            color: Color.Text,
          }}>{user.displayName}</section>
          <section style={{
            fontSize: FontSize.Small,
            fontFamily: FontFamily.VarelaRound,
            color: Color.Muted,
          }}>{user.handle}</section>
        </section>
      </section>
    </section>
  );
};
