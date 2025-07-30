"use client";

import React, { useState } from 'react';
import { styles } from '@/styles/account';
import { UserProfile, User, Post } from '@/types/account';
import  Header  from '@/components/account/Header';
import ProfileSection from '@/components/account/ProfileSection';
// import TabNavigation from '../components/TabNavigation';
// import PostsGrid from '../components/PostsGrid';
// import Modal from '../components/Modal';
// import UserListItem from '../components/UserListItem';
// import SettingsModalContent from '../components/SettingsModalContent';

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('posts');
  const [showFollowers, setShowFollowers] = useState<boolean>(false);
  const [showFollowing, setShowFollowing] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [isEditingBio, setIsEditingBio] = useState<boolean>(false);
  const [displayName, setDisplayName] = useState<string>('John Doe');
  const [tempName, setTempName] = useState<string>(displayName);
  const [bio, setBio] = useState<string>('Digital creator • Photography enthusiast 📸\nLiving life one moment at a time ✨');
  const [tempBio, setTempBio] = useState<string>(bio);

  // Mock data
  const userProfile: UserProfile = {
    username: 'johndoe',
    displayName: displayName,
    bio: bio,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
    postsCount: 127,
    followersCount: 2543,
    followingCount: 189,
    isFollowing: false
  };

  const posts: Post[] = [
    { id: 1, image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop', likes: 234, comments: 12 },
    { id: 2, image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=300&fit=crop', likes: 156, comments: 8 },
    { id: 3, image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop', likes: 389, comments: 23 },
    { id: 4, image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=300&h=300&fit=crop', likes: 412, comments: 19 },
    { id: 5, image: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=300&h=300&fit=crop', likes: 298, comments: 15 },
    { id: 6, image: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=300&h=300&fit=crop', likes: 567, comments: 31 }
  ];

  const followers: User[] = [
    { id: 1, username: 'alice_photo', displayName: 'Alice Johnson', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e0?w=50&h=50&fit=crop&crop=face' },
    { id: 2, username: 'mike_travels', displayName: 'Mike Wilson', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face' },
    { id: 3, username: 'sarah_art', displayName: 'Sarah Davis', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face' }
  ];

  const following: User[] = [
    { id: 1, username: 'nature_shots', displayName: 'Nature Photography', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face' },
    { id: 2, username: 'urban_explorer', displayName: 'Urban Explorer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face' }
  ];

  // Event handlers
  const handleNameSave = (): void => {
    setDisplayName(tempName);
    setIsEditingName(false);
  };

  const handleNameCancel = (): void => {
    setTempName(displayName);
    setIsEditingName(false);
  };

  const handleBioSave = (): void => {
    setBio(tempBio);
    setIsEditingBio(false);
  };

  const handleBioCancel = (): void => {
    setTempBio(bio);
    setIsEditingBio(false);
  };

  return (
    <div style={styles.container}>
      <Header 
        username={"Konnect"} 
        onSettingsClick={() => setShowSettings(true)} 
      />

      <ProfileSection 
        userProfile={userProfile}
        isEditingBio={isEditingBio}
        tempBio={tempBio}
        setTempBio={setTempBio}
        onEditBio={() => setIsEditingBio(true)}
        onSaveBio={handleBioSave}
        onCancelBio={handleBioCancel}
        onFollowersClick={() => setShowFollowers(true)}
        onFollowingClick={() => setShowFollowing(true)}
      />

      {/* <TabNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      /> */}

      {/* <PostsGrid 
        activeTab={activeTab} 
        posts={posts} 
      /> */}

      {/* Modals */}
      {/* <Modal 
        isOpen={showFollowers} 
        onClose={() => setShowFollowers(false)}
        title="Followers"
      >
        {followers.map((user) => (
          <UserListItem key={user.id} user={user} showFollowButton />
        ))}
      </Modal>

      <Modal 
        isOpen={showFollowing} 
        onClose={() => setShowFollowing(false)}
        title="Following"
      >
        {following.map((user) => (
          <UserListItem key={user.id} user={user} />
        ))}
      </Modal>

      <Modal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)}
        title="Settings"
      >
        <SettingsModalContent 
          displayName={displayName}
          isEditingName={isEditingName}
          tempName={tempName}
          setTempName={setTempName}
          onEditName={() => setIsEditingName(true)}
          onSaveName={handleNameSave}
          onCancelName={handleNameCancel}
        />
      </Modal> */}
    </div>
  );
};

export default ProfilePage;