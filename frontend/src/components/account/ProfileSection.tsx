"use client";

import React from 'react';
import { styles } from '@/styles/account';
import { UserProfile } from '@/types/account';
import ProfileStats from './ProfileStats';
import BioSection from './BioSection';

interface ProfileSectionProps {
  userProfile: UserProfile;
  isEditingBio: boolean;
  tempBio: string;
  setTempBio: (value: string) => void;
  onEditBio: () => void;
  onSaveBio: () => void;
  onCancelBio: () => void;
  onFollowersClick: () => void;
  onFollowingClick: () => void;
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
  onFollowingClick
}) => {
  return (
    <div style={styles.profileSection}>
      <div style={styles.profileHeader}>
        <img 
          src={userProfile.avatar} 
          alt={userProfile.displayName}
          style={styles.avatar}
        />
        
        <div style={styles.profileInfo}>
          <div style={styles.profileTopRow}>
            <h2 style={styles.username}>{userProfile.username}</h2>
          </div>
          
          <ProfileStats 
            postsCount={userProfile.postsCount}
            followersCount={userProfile.followersCount}
            followingCount={userProfile.followingCount}
            onFollowersClick={onFollowersClick}
            onFollowingClick={onFollowingClick}
          />
        </div>
      </div>

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
    </div>
  );
};

export default ProfileSection;