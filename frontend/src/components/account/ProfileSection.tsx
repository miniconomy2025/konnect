"use client";

import React from 'react';
import Image from 'next/image';
import { styles } from '@/styles/account';
import type { UserProfile } from '@/types/account';
import ProfileStats from '@/components/account/ProfileStats';
import BioSection from '@/components/account/BioSection';
import { Color, FontFamily, FontSize } from '@/lib/presentation';

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
  onFollowToggle
}) => {
  return (
    <section style={styles.profileSection}>
      <section style={styles.profileHeader}>
        <Image 
          src={userProfile.avatar} 
          alt={userProfile.displayName}
          width={80}
          height={80}
          style={styles.avatar}
        />

        <section style={styles.profileInfo}>
          <section style={styles.profileTopRow}>
            <h2 style={styles.username}>{userProfile.username}</h2>

            {/* Follow/Unfollow Button */}
            {showFollowButton && (
              <button
                onClick={onFollowToggle}
                style={{
                    padding: '6px 12px',
                    fontSize: FontSize.Large,
                    fontFamily: FontFamily.Nunito,
                    maxWidth: '10rem',
                    backgroundColor: userProfile.isFollowing ? Color.Surface : Color.Primary,
                    color: userProfile.isFollowing ? Color.Text : '#fff',
                    border: `1px solid ${userProfile.isFollowing ? Color.Border : Color.Primary}`,
                    borderRadius: 8,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                }}
              >
                {userProfile.isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </section>

          <ProfileStats 
            postsCount={userProfile.postsCount}
            followersCount={userProfile.followersCount}
            followingCount={userProfile.followingCount}
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