'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; // or 'next/router' if using pages/
import Layout from '@/layouts/Main';
import { ApiService } from '@/lib/api';
import { UserProfile, User } from '@/types/account';
import { PostsResponse } from '@/types/post';
import Header from '@/components/Account/Header';
import ProfileSection from '@/components/Account/ProfileSection';
import PostsGrid from '@/components/Account/PostsGrid';
import Modal from '@/components/Account/Modal';
import UserListItem from '@/components/Account/UserListItem';
import SettingsModal from '@/components/Account/SettingsModal';
import { styles } from '@/styles/account';
import { useSearchParams } from 'next/navigation'; // At the top


const ProfilePage: React.FC = () => {
  const params = useParams();
  const profileUsername = params?.username as string | undefined;

  const [userProfile, setUserProfile] = useState<UserProfile>();
  const [posts, setPosts] = useState<PostsResponse>();
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempBio, setTempBio] = useState('');
  const [bio, setBio] = useState('');
  const [userName, setUserName] = useState('');
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [viewingOwnProfile, setViewingOwnProfile] = useState(true);


  let isOwnProfile = profileUsername === currentUsername;

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      alert('Please log in first!');
      window.location.href = '/Login';
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const user = params.get("user");

    const fetchProfile = async () => {
      const currentUser = (await ApiService.getCurrentUser()).data;
      if (!currentUser) return;

        const usernameToLoad = user || currentUser.username;
        isOwnProfile = usernameToLoad === currentUser.username;
        setUserName(currentUser.username);

      const { data, error } = await ApiService.getUserByUsername(usernameToLoad);
      if (!data || error) {
        console.error('Failed to fetch user:', error);
        return;
      }

      const userPosts = (await ApiService.getUserPosts(usernameToLoad)).data;

      setUserProfile({
        username: data.username,
        displayName: data.displayName,
        bio: data.bio,
        avatar: data.avatarUrl,
        postsCount: data.postsCount,
        followersCount: data.followersCount,
        followingCount: data.followingCount,
        isFollowing: data.isFollowing,
      });

      setPosts(userPosts);
      setUserName(data.username);
      setTempName(data.username);
      setBio(data.bio);
      setTempBio(data.bio);

        setCurrentUsername(currentUser.username);
        setViewingOwnProfile(isOwnProfile);
    };

    fetchProfile();
  }, [profileUsername]);

  const handleFollowToggle = async () => {
    if (!userProfile) return;
    // const isNowFollowing = !userProfile.isFollowing;
    // await ApiService.toggleFollow(userProfile.username, isNowFollowing);
    // setUserProfile({ ...userProfile, isFollowing: isNowFollowing });
    console.log('Follow')
  };

  const handleNameCancel = () => {
    setTempName(userName);
    setIsEditingName(false);
  };

  const handleNameSave = async () => {
    if (!userProfile) return;
    const response = await ApiService.updateUsername(tempName);
    if (response.error) {
      alert('Error updating username');
    } else {
      alert('Username updated');
      setUserName(tempName);
      setUserProfile({ ...userProfile, username: tempName });
      setIsEditingName(false);
    }
  };

  const handleBioSave = () => {
    if (!userProfile) return;
    setUserProfile({ ...userProfile, bio: tempBio });
    setIsEditingBio(false);
  };

  const handleBioCancel = () => {
    setTempBio(bio);
    setIsEditingBio(false);
  };

  if (!userProfile) return <p>Loading...</p>;

  return (
    <Layout>
      <section style={styles.container}>
        <Header
          username={userProfile.username}
          onSettingsClick={() => {
            if (isOwnProfile) setShowSettings(true);
          }}
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
          isOwnProfile={isOwnProfile}
          onFollowClick={handleFollowToggle}
        />

        <PostsGrid posts={posts?.posts || []} />

        <Modal isOpen={showFollowers} onClose={() => setShowFollowers(false)} title="Followers">
          {followers.map((user) => (
            <UserListItem key={user.id} user={user} showFollowButton />
          ))}
        </Modal>

        <Modal isOpen={showFollowing} onClose={() => setShowFollowing(false)} title="Following">
          {following.map((user) => (
            <UserListItem key={user.id} user={user} />
          ))}
        </Modal>

        <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="Settings">
          <SettingsModal
            displayName={userName}
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
