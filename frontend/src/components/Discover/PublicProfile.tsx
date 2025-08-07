"use client";

import PostsGrid from '@/components/account/PostsGrid';
import ProfileSection from '@/components/account/ProfileSection';
import { useToastHelpers } from '@/contexts/ToastContext';
import { ApiService } from '@/lib/api';
import { Color, FontFamily, FontSize, Spacing } from '@/lib/presentation';
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

  if (!userProfile) return <p>Loading...</p>;

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