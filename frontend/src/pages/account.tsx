"use client";

import React, { useState, useEffect } from 'react';
import { styles } from '@/styles/account';
import { UserProfile, User, Actor } from '@/types/account';
import { PostsResponse, Post } from '@/types/post';
import  Header  from '@/components/Account/Header';
import ProfileSection from '@/components/Account/ProfileSection';
import PostsGrid from '@/components/Account/PostsGrid';
import Modal from '@/components/Account/Modal';
import UserListItem from '@/components/Account/UserListItem';
import SettingsModal from '@/components/Account/SettingsModal';
import Layout from '@/layouts/Main';
import { ApiService } from '@/lib/api';
import PostModal from '@/components/Account/PostModal';

const ProfilePage: React.FC = () => {
  const [activeTab] = useState<string>('posts');
  const [showFollowers, setShowFollowers] = useState<boolean>(false);
  const [showFollowing, setShowFollowing] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [isEditingBio, setIsEditingBio] = useState<boolean>(false);
  const [displayName, setDisplayName] = useState<string>('');
  const [userName, setUserName] = useState<string>('');

  const [userProfile, setUserProfile] = useState<UserProfile | undefined>(undefined);
  const [followers, setFollowers] = useState<Actor[]>([]);
  const [following, setFollowing] = useState<Actor[]>([]);
  const [posts, setPosts] = useState<PostsResponse | undefined>(undefined);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const [tempName, setTempName] = useState<string>(userName);
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

            const userPosts = (await ApiService.getUserPosts(data.username)).data;
            setPosts(userPosts);

            const userFollows = (await ApiService.getFollowers(data.username)).data;
            

            if(userFollows){
                const userFollowers = userFollows.followers || [];
                const userFollowing = userFollows.following || []; 
                
                const followers: Actor[] = userFollowers.map(user => user.actor);
                const following: Actor[] = userFollowing.map(user => user.object);
                setFollowing(following);
                setFollowers(followers);
            }


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
            setDisplayName(data.displayName);
            setUserName(data.username);
            setTempName(data.displayName);
            setBio(data.bio);
            setTempBio(data.bio);
        };

        fetchData();
    }, []);

  // Event handlers
  const handleNameCancel = (): void => {
    setTempName(userName);
    setIsEditingName(false);
  };

  const handleNameSave = async () => {
    if (!userProfile) return;

    // Make API Call
    const response = await ApiService.updateDisplayName(tempName);

    if(response.error){
        alert('Error updating display name');
        console.log(response.error);
    }else{
        alert('Updated Display Name');
        setDisplayName(tempName);
        setUserProfile({ ...userProfile, displayName: tempName });
        setIsEditingName(false);        
    }
  };

  const handleBioSave = async () => {
    if (!userProfile) return;

    const response = await ApiService.updateBio(tempBio);

    if(response.error){
        alert('Error updating bio name');
        console.log(response.error);
    }else{
        alert('Updated Bio');
        setBio(bio);
        setUserProfile({ ...userProfile, bio: bio });
        setIsEditingBio(false);        
    }

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
            onPostClick={(post) => setSelectedPost(post)}
        />

        {/* Modals */}
        <Modal 
            isOpen={showFollowers} 
            onClose={() => setShowFollowers(false)}
            title="Followers"
        >
            {followers.map((user) => (
            <UserListItem key={user._id} user={user} following />
            ))}
        </Modal>

        <Modal 
            isOpen={showFollowing} 
            onClose={() => setShowFollowing(false)}
            title="Following"
        >
            {following.map((user) => (
            <UserListItem key={user._id} user={user} />
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
        {selectedPost && (
        <PostModal
            post={selectedPost}
            onClose={() => setSelectedPost(null)}
            onPostDeleted={(id) => {
            setPosts((prev) => ({
                ...prev!,
                posts: prev!.posts.filter((post) => post.id !== id),
            }));
            }}
            onPostUpdated={(updatedPost) => {
            setPosts((prev) => ({
                ...prev!,
                posts: prev!.posts.map((post) => post.id === updatedPost.id ? updatedPost : post),
            }));
            setSelectedPost(updatedPost);
            }}
        />
        )}
        </section>
    </Layout>
  );
};

export default ProfilePage;