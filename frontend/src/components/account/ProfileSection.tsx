"use client";

import React from 'react';
import { styles } from '@/styles/account';
import { UserProfile } from '@/types/account';
import ProfileStats from './ProfileStats';
import BioSection from './BioSection';

interface ProfileSectionProps {
  userProfile: UserProfile;
  isOwnProfile: boolean;
  isEditingBio: boolean;
  tempBio: string;
  setTempBio: (bio: string) => void;
  onEditBio: () => void;
  onSaveBio: () => void;
  onCancelBio: () => void;
  onFollowersClick: () => void;
  onFollowingClick: () => void;
  onFollowClick?: () => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ 
  userProfile, 
  isOwnProfile,
  isEditingBio, 
  tempBio, 
  setTempBio, 
  onEditBio, 
  onSaveBio, 
  onCancelBio,
  onFollowersClick,
  onFollowingClick,
  onFollowClick
}) => {
  return (
    <section style={styles.profileSection}>
      <section style={styles.profileHeader}>
        <img 
          src={userProfile.avatar} 
          alt={userProfile.displayName}
          style={styles.avatar}
        />
        
        <section style={styles.profileInfo}>
          <section style={styles.profileTopRow}>
            <h2 style={styles.username}>{userProfile.username}</h2>
          </section>
          {!isOwnProfile && (
            <button onClick={onFollowClick}>
                {userProfile.isFollowing ? 'Unfollow' : 'Follow'}
            </button>
            )}
          <ProfileStats 
            postsCount={userProfile.postsCount}
            followersCount={userProfile.followersCount}
            followingCount={userProfile.followingCount}
            onFollowersClick={onFollowersClick}
            onFollowingClick={onFollowingClick}
          />
        </section>
      </section>

      <BioSection 
        displayName={userProfile.displayName}
        bio={userProfile.bio}
        isEditingBio={isEditingBio}
        tempBio={tempBio}
        setTempBio={setTempBio}
        onEditBio={onEditBio}
        onSaveBio={onSaveBio}
        onCancelBio={onCancelBio}
      />
    </section>
  );
};

export default ProfileSection;