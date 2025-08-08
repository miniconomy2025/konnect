"use client";

import BioSection from '@/components/account/BioSection';
import ProfileStats from '@/components/account/ProfileStats';
import { useToastHelpers } from '@/contexts/ToastContext';
import { generateAvatarColor, generateAvatarTextColor } from '@/lib/avatarUtils';
import { Color, FontFamily, FontSize, Spacing } from '@/lib/presentation';
import { styles } from '@/styles/account';
import type { UserProfile } from '@/types/account';
import { Calendar, Copy, Lock, MapPin, Users } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

interface ProfileSectionProps {
  userProfile: UserProfile;
  isEditingBio?: boolean;
  tempBio?: string;
  setTempBio?: (bio: string) => void;
  onEditBio?: () => void;
  onSaveBio?: () => void;
  onCancelBio?: () => void;
  onFollowersClick: () => void;
  onFollowingClick: () => void;
  showFollowButton?: boolean;
  onFollowToggle?: () => void;
  disableFollowButton?: boolean;
  onEditProfileClick?: () => void;
  isLoadingBio?: boolean;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  userProfile,
  isEditingBio,
  tempBio,
  setTempBio,
  onEditBio,
  onSaveBio,
  onCancelBio,
  onFollowersClick,
  onFollowingClick,
  showFollowButton,
  onFollowToggle,
  disableFollowButton,
  onEditProfileClick,
  isLoadingBio,
}) => {

  const { success } = useToastHelpers();
  const [isSmall, setIsSmall] = React.useState(false);
  React.useEffect(() => {
    const onResize = () => setIsSmall(window.innerWidth < 480);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const parts = userProfile.handle.split('@');
  const username = parts[1] ?? userProfile.username;
  const domain = parts[2] ?? userProfile.hostServer ?? '';

  const formatJoinDate = (joinDate: Date | string) => {
    try {
      const date = new Date(joinDate);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch {
      return null;
    }
  };

  const copyHandleToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(userProfile.handle.startsWith('@') ? userProfile.handle : `@${userProfile.handle}`);
      success('Handle copied');
    } catch {
      // ignore
    }
  };

  return (
    <section style={{
      ...styles.profileSection,
      paddingTop: Spacing.Medium,
      paddingBottom: Spacing.Medium,
      background: Color.Surface,
      border: `1px solid ${Color.Border}`,
      borderRadius: 12,
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <section style={{
        display: 'grid',
        gridTemplateColumns: isSmall ? '1fr' : 'auto 1fr',
        alignItems: isSmall ? 'center' : 'center',
        gap: Spacing.Medium,
        position: 'relative',
        zIndex: 1,
      }}>
        {userProfile.avatarUrl ? (
          <Image
            src={userProfile.avatarUrl}
            alt={userProfile.displayName}
            width={isSmall ? 72 : 96}
            height={isSmall ? 72 : 96}
            style={{
              ...styles.avatar,
              width: isSmall ? 72 : 96,
              height: isSmall ? 72 : 96,
              border: `1px solid ${Color.Border}`,
            }}
            priority={false}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.src = '/assets/images/missingAvatar.jpg';
            }}
          />
        ) : (
          <abbr
            title={userProfile.displayName}
            style={{
              ...styles.avatar,
              width: isSmall ? 72 : 96,
              height: isSmall ? 72 : 96,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isSmall ? '24px' : '32px',
              fontWeight: '600',
              fontFamily: FontFamily.Nunito,
              color: generateAvatarTextColor(userProfile.handle),
              background: generateAvatarColor(userProfile.handle),
              textDecoration: 'none',
              textTransform: 'uppercase',
              border: `1px solid ${Color.Border}`,
            }}
          >
            {userProfile.displayName.charAt(0)}
          </abbr>
        )}

        <section style={{ 
          ...styles.profileInfo, 
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: Spacing.Medium,
        }}>
          {/* Name row */}
          <section>
            <h2 title={userProfile.displayName} style={{
              ...styles.username,
              margin: 0,
              fontWeight: 700,
              fontSize: FontSize.XLarge,
            }}>{userProfile.displayName}</h2>
          </section>

          {/* Handle and domain row */}
          <section style={{
            display: 'flex',
            alignItems: 'center',
            gap: Spacing.XSmall,
            flexWrap: 'wrap',
          }}>
            <span title={`@${username}`} style={{
              fontFamily: FontFamily.Nunito,
              color: '#6b7280',
              fontSize: isSmall ? FontSize.Small : FontSize.Base,
              fontWeight: 500,
            }}>@{username}</span>
            {domain && (
              <span title={domain} style={{
                backgroundColor: '#f3f4f6',
                padding: '2px 6px',
                borderRadius: 999,
                fontSize: isSmall ? 10 : 12,
                color: '#374151',
                fontWeight: 500,
              }}>{domain}</span>
            )}
            {userProfile.isPrivate && (
              <span title="Private account" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                backgroundColor: '#fef3c7',
                padding: '2px 6px',
                borderRadius: 999,
                fontSize: isSmall ? 10 : 12,
                color: '#92400e',
                fontWeight: 500,
              }}>
                <Lock size={12} /> Private
              </span>
            )}
          </section>

          {/* Meta info row */}
          <section style={{
            display: 'flex',
            alignItems: 'center',
            gap: Spacing.Small,
            flexWrap: 'wrap',
            color: '#6b7280',
            fontSize: FontSize.Small,
          }}>
            {formatJoinDate(userProfile.joinDate) && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}>
                <Calendar size={14} />
                Joined {formatJoinDate(userProfile.joinDate)}
              </span>
            )}
            {userProfile.hostServer && userProfile.hostServer !== 'localhost' && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}>
                <MapPin size={14} />
                {userProfile.hostServer}
              </span>
            )}
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}>
              <Users size={14} />
              {userProfile.isLocal ? 'Local user' : 'Federated user'}
            </span>
          </section>

          {/* Actions row */}
          <section style={{
            display: 'flex',
            alignItems: 'center',
            gap: Spacing.Small,
            flexWrap: 'wrap',
          }}>
            <button
              type="button"
              onClick={copyHandleToClipboard}
              aria-label="Copy handle"
              style={{
                backgroundColor: '#f9fafb',
                border: `1px solid ${Color.Border}`,
                color: '#374151',
                borderRadius: 6,
                padding: isSmall ? '2px 6px' : '4px 8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                cursor: 'pointer',
                fontSize: FontSize.Small,
                fontWeight: 500,
              }}
            >
              <Copy size={12} /> Copy Handle
            </button>

            {showFollowButton && (
              <button
                onClick={onFollowToggle}
                style={{
                  padding: isSmall ? '6px 12px' : '8px 14px',
                  fontSize: isSmall ? FontSize.Small : FontSize.Base,
                  fontFamily: FontFamily.Nunito,
                  backgroundColor: userProfile.isFollowedByCurrentUser ? Color.Surface : Color.Primary,
                  color: userProfile.isFollowedByCurrentUser ? Color.Text : '#fff',
                  border: `1px solid ${userProfile.isFollowedByCurrentUser ? Color.Border : Color.Primary}`,
                  borderRadius: 999,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  opacity: disableFollowButton ? 0.5 : 1,
                  pointerEvents: disableFollowButton ? 'none' : 'auto',
                }}
                disabled={disableFollowButton}
              >
                {userProfile.isFollowedByCurrentUser ? 'Unfollow' : 'Follow'}
              </button>
            )}

            {!showFollowButton && onEditProfileClick && (
              <button
                onClick={onEditProfileClick}
                style={{
                  padding: isSmall ? '6px 10px' : '8px 12px',
                  fontSize: isSmall ? FontSize.Small : FontSize.Base,
                  fontFamily: FontFamily.Nunito,
                  backgroundColor: Color.Surface,
                  color: Color.Text,
                  border: `1px solid ${Color.Border}`,
                  borderRadius: 999,
                  cursor: 'pointer',
                }}
              >
                Edit Profile
              </button>
            )}
          </section>

          {/* Stats */}
          <ProfileStats
            postsCount={undefined}
            followersCount={userProfile.followersCount ?? 0}
            followingCount={userProfile.followingCount ?? 0}
            onFollowersClick={onFollowersClick}
            onFollowingClick={onFollowingClick}
          />
        </section>
      </section>

      {/* Bio section */}
      <BioSection
        displayName={userProfile.displayName}
        bio={userProfile.bio}
        isEditingBio={isEditingBio ?? false}
        tempBio={tempBio ?? ''}
        setTempBio={setTempBio ?? (() => {})}
        onEditBio={onEditBio ?? (() => {})}
        onSaveBio={onSaveBio ?? (() => {})}
        onCancelBio={onCancelBio ?? (() => {})}
        isEditable={!showFollowButton}
        isLoading={isLoadingBio}
      />
    </section>
  );
};

export default ProfileSection;