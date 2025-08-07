"use client";

import React from 'react';
import Image from 'next/image';
import { styles } from '@/styles/account';
import type { UserProfile } from '@/types/account';
import ProfileStats from '@/components/account/ProfileStats';
import BioSection from '@/components/account/BioSection';
import { Color, FontFamily, FontSize } from '@/lib/presentation';
import { generateAvatarColor, generateAvatarTextColor } from '@/lib/avatarUtils';

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
  disableFollowButton
}) => {

  const user = userProfile.handle.split('@');
  return (
    <section style={styles.profileSection}>
      <section style={styles.profileHeader}>
        {userProfile.avatarUrl ? (
          <Image 
            src={userProfile.avatarUrl} 
            alt={userProfile.displayName}
            width={80}
            height={80}
            style={styles.avatar}
            onError={(e) => {
              e.currentTarget.src = '/assets/images/missingAvatar.jpg';
            }}
          />
        ) : (
          <abbr
            title={userProfile.displayName}
            style={{
              ...styles.avatar,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
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

        <section style={styles.profileInfo}>
          <section style={styles.profileTopRow}>
            <h2 style={styles.username}>{`${user[1]}`}</h2>
            <h6 style={styles.domain}>{`@${user[2]}`}</h6>
            {/* Follow/Unfollow Button */}
            {showFollowButton && (
              <button
                onClick={onFollowToggle}
                style={{
                    padding: '6px 12px',
                    fontSize: FontSize.Large,
                    fontFamily: FontFamily.Nunito,
                    maxWidth: '10rem',
                    backgroundColor: userProfile.isFollowedByCurrentUser ? Color.Surface : Color.Primary,
                    color: userProfile.isFollowedByCurrentUser ? Color.Text : '#fff',
                    border: `1px solid ${userProfile.isFollowedByCurrentUser ? Color.Border : Color.Primary}`,
                    borderRadius: 8,
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
          </section>

          <ProfileStats 
            postsCount={undefined}
            followersCount={userProfile.followersCount ?? 0}
            followingCount={userProfile.followingCount ?? 0}
            onFollowersClick={onFollowersClick}
            onFollowingClick={onFollowingClick}
          />
        </section>
      </section>

      {/* Bio section: editable if props are passed, read-only otherwise */}
      <BioSection 
        displayName={userProfile.displayName}
        bio={userProfile.bio}
        isEditingBio={isEditingBio ?? false}
        tempBio={tempBio ?? ''}
        setTempBio={setTempBio ?? (() => {})}
        onEditBio={onEditBio ?? (() => {})}
        onSaveBio={onSaveBio ?? (() => {})}
        onCancelBio={onCancelBio ?? (() => {})}
        isEditable={!showFollowButton} // new prop if you want to explicitly show edit icons
      />
    </section>
  );
};

export default ProfileSection;