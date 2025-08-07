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
        padding: Spacing.Small,
        marginLeft: Spacing.Medium,
        marginRight: Spacing.Medium,
        marginBottom: Spacing.Small,
        background: Color.Surface,
        borderRadius: Spacing.MediumSmall,
        boxShadow: '0 0.125rem 0.375rem rgba(0, 0, 0, 0.05)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        border: isHovered ? `${BorderWidth.Medium} solid transparent` : `${BorderWidth.Medium} solid transparent`,
        backgroundImage: isHovered ? `${Gradient.Brand}, ${Color.Surface}` : 'none',
        backgroundOrigin: isHovered ? 'border-box' : 'padding-box',
        backgroundClip: isHovered ? 'padding-box, border-box' : 'padding-box',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        router.push(`/Discover?user=${user.handle}`);
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
  );
};
