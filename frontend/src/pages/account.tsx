"use client";

import React, { useState, useEffect } from 'react';
import { styles } from '@/styles/account';
import { UserProfile, User } from '@/types/account';
import { PostsResponse } from '@/types/post';
import  Header  from '@/components/Account/Header';
import ProfileSection from '@/components/Account/ProfileSection';
import PostsGrid from '@/components/Account/PostsGrid';
import Modal from '@/components/Account/Modal';
import UserListItem from '@/components/Account/UserListItem';
import SettingsModal from '@/components/Account/SettingsModal';
import Layout from '@/layouts/Main';
import { ApiService } from '@/lib/api';

const ProfilePage: React.FC = () => {
  const [activeTab] = useState<string>('posts');
  const [showFollowers, setShowFollowers] = useState<boolean>(false);
  const [showFollowing, setShowFollowing] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [isEditingBio, setIsEditingBio] = useState<boolean>(false);
  const [displayName, setDisplayName] = useState<string>('');

  const [userProfile, setUserProfile] = useState<UserProfile | undefined>(undefined);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [posts, setPosts] = useState<PostsResponse | undefined>(undefined);


  const [tempName, setTempName] = useState<string>(displayName);
  const [bio, setBio] = useState<string>('');
  const [tempBio, setTempBio] = useState<string>(bio);


    useEffect(() => {
        if(!localStorage.getItem('auth_token')){
            alert('Please Login first!') // TODO: Make nice toast
            window.location.href = '/Login';
        }

        const fetchData = async () => {
            const { data, error } = await ApiService.getCurrentUser();

            if (error || !data) {
                console.error('Failed to fetch user data:', error);
                return;
            }

            const userPosts = (await ApiService.getUserPosts(data.username)).data; // adapt based on actual API
            console.log(userPosts);
            setPosts(userPosts);

            // const userFollowers = data.followers || [];
            // const userFollowing = data.following || [];

            setUserProfile({
                username: data.username,
                displayName: data.displayName,
                bio: data.bio,
                avatar: data.avatarUrl,
                postsCount: data.postsCount,
                followersCount: data.followersCount,
                followingCount: data.followingCount,
                isFollowing: false, // server might give this too
            });

            // setFollowers(userFollowers);
            // setFollowing(userFollowing);
            // setPosts(userPosts);
            setDisplayName(data.displayName);
            setTempName(data.displayName);
            setBio(data.bio);
            setTempBio(data.bio);
        };

        fetchData();
    }, []);

//   const followers: User[] = [
//     { id: 1, username: 'alice_photo', displayName: 'Alice Johnson', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e0?w=50&h=50&fit=crop&crop=face' },
//     { id: 2, username: 'mike_travels', displayName: 'Mike Wilson', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face' },
//     { id: 3, username: 'sarah_art', displayName: 'Sarah Davis', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face' }
//   ];

//   const following: User[] = [
//     { id: 1, username: 'nature_shots', displayName: 'Nature Photography', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face' },
//     { id: 2, username: 'urban_explorer', displayName: 'Urban Explorer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face' }
//   ];

  // Event handlers
  const handleNameCancel = (): void => {
    setTempName(displayName);
    setIsEditingName(false);
  };

  const handleNameSave = () => {
    if (!userProfile) return;
    setDisplayName(tempName);
    setUserProfile({ ...userProfile, displayName: tempName });
    setIsEditingName(false);
  };

  const handleBioSave = () => {
    if (!userProfile) return;
    setUserProfile({ ...userProfile, bio: tempBio });
    setIsEditingBio(false);
  };

  const handleBioCancel = (): void => {
    setTempBio(bio);
    setIsEditingBio(false);
  };

  if (!userProfile) return <p>Loading...</p>;

  return (
    <Layout>
        <section style={styles.container}>
        <Header 
            username={''}
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

        <PostsGrid 
            posts={posts?.posts || []} 
        />

        {/* Modals */}
        <Modal 
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
            <SettingsModal 
            displayName={displayName}
            isEditingName={isEditingName}
            tempName={tempName}
            setTempName={setTempName}
            onEditName={() => setIsEditingName(true)}
            onSaveName={handleNameSave}
            onCancelName={handleNameCancel}
            />
        </Modal>
        </section>
    </Layout>
  );
};

export default ProfilePage;