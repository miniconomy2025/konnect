"use client";

import PostsGrid from '@/components/account/PostsGrid';
import ProfileSection from '@/components/account/ProfileSection';
import { useToastHelpers } from '@/contexts/ToastContext';
import { ApiService } from '@/lib/api';
import { Color, FontFamily, FontSize, Spacing } from '@/lib/presentation';
import Image from 'next/image';
import { UserProfile } from '@/types/account';
import { PostsResponse } from '@/types/post';
import { ArrowLeft } from 'lucide-react';
import router from 'next/router';
import React, { useEffect, useState } from 'react';

interface PublicProfileProps {
  username: string;
}
const PublicProfileView: React.FC<PublicProfileProps> = ({ username }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | undefined>();
  const [posts, setPosts] = useState<PostsResponse | undefined>();
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [actorId, setActorId] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const { success, error: showError } = useToastHelpers();
  useEffect(() => {
    const fetchUserData = async () => {
      const { data } = await ApiService.getUserByUsername(username);
      if (data) {
        let postRes;
        if(data.isLocal){
          postRes = await ApiService.getUserPosts(data.username);
        }else{
          postRes = await ApiService.getExternalUserPosts(data.username, data.hostServer);
        }

        setUserProfile(data);
        setIsFollowing(data.isFollowedByCurrentUser ?? false);
        setPosts(postRes.data);
        setActorId(data.activityPubId);
      }
    };

    fetchUserData();
  }, [username]);

  const toggleFollow = async () => {
    setLoading(true);
    if (!userProfile || !actorId) return;
    
    try {
      if (isFollowing) {
        const response = await ApiService.unfollowUser(actorId);
        if (response.error) {
          showError('Failed to unfollow user. Please try again.');
        } else {
          const updatedIsFollowing = response.data?.following ?? false;
          setIsFollowing(updatedIsFollowing);
          setUserProfile({...userProfile, isFollowedByCurrentUser: updatedIsFollowing});
          success(`You have unfollowed ${userProfile.displayName}`);
        }
      } else {
        const response = await ApiService.followUser(actorId);
        if (response.error) {
          showError('Failed to follow user. Please try again.');
        } else {
          const updatedIsFollowing = response.data?.following ?? false;
          setIsFollowing(updatedIsFollowing);
          setUserProfile({...userProfile, isFollowedByCurrentUser: updatedIsFollowing});
          success(`You are now following ${userProfile.displayName}!`);
        }
      }
    } catch (error) {
      showError('Unable to process follow request. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  if (!userProfile) return (
    <section style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: Color.Background,
      zIndex: 1000,
    }}>
      <Image
        src="/load.svg"
        alt="Loading..."
        width={120}
        height={120}
        style={{
          filter: 'drop-shadow(0 0.25rem 0.5rem rgba(0, 0, 0, 0.1))',
        }}
      />
    </section>
  );

  return (
    <section style={{ marginTop: 24 }}>
      <button
        onClick={() => {
          router.back();
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'none',
          border: 'none',
          color: Color.Muted,
          cursor: 'pointer',
          fontFamily: FontFamily.Nunito,
          fontSize: FontSize.Large,
          marginTop: Spacing.Small,
          marginBottom: Spacing.Small,
        }}
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <ProfileSection
        userProfile={userProfile}
        onFollowersClick={() => {}}
        onFollowingClick={() => {}}
        showFollowButton    
        onFollowToggle={toggleFollow}
        disableFollowButton={loading}
      />
      <PostsGrid posts={posts?.posts || []} />
    </section>
  );
};

export default PublicProfileView;