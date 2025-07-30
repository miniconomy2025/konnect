"use client";
import React, { useState } from 'react';
import {
  Header
} from '@/components/account';
import styles from '@/styles/account';
import { userProfileMock, postsMock, followersMock, followingMock } from '../lib/mockData';

const AccountPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'posts' | 'followers' | 'following'>('posts');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTabClick = (tab: 'posts' | 'followers' | 'following') => setActiveTab(tab);
  const handleSettingsClick = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div style={styles.container}>
      <Header username={userProfileMock.username} onSettingsClick={handleSettingsClick} />
      {/* <ProfileSection profile={userProfileMock} />
      <TabNavigation activeTab={activeTab} onTabClick={handleTabClick} />

      <div style={styles.contentSection}>
        {activeTab === 'posts' && <PostsGrid posts={postsMock} />}
        {activeTab === 'followers' && (
          <div>
            {followersMock.map(user => <UserListItem key={user.username} user={user} />)}
          </div>
        )}
        {activeTab === 'following' && (
          <div>
            {followingMock.map(user => <UserListItem key={user.username} user={user} />)}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <SettingsModalContent />
      </Modal> */}
    </div>
  );
};

export default AccountPage;
