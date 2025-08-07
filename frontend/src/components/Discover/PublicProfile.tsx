"use client";

import React, { useEffect, useState } from 'react';
import { UserProfile } from '@/types/account';
import { PostsResponse } from '@/types/post';
import { ApiService } from '@/lib/api';
import ProfileSection from '@/components/account/ProfileSection';
import PostsGrid from '@/components/account/PostsGrid';
import { ArrowLeft } from 'lucide-react';
import { Color, FontFamily, FontSize, Spacing } from '@/lib/presentation';
import router from 'next/router';

interface PublicProfileProps {
  username: string;
}
const PublicProfileView: React.FC<PublicProfileProps> = ({ username }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | undefined>();
  const [posts, setPosts] = useState<PostsResponse | undefined>();
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [actorId, setActorId] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    const fetchUserData = async () => {
      const { data } = await ApiService.getUserByUsername(username);
      if (data) {
        let postRes;
        if(data.isLocal){
          postRes = await ApiService.getUserPosts(username);
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
    if (isFollowing) {
        const response = await ApiService.unfollowUser(actorId);
        const updatedIsFollowing = response.data?.following ?? false;
        setIsFollowing(updatedIsFollowing);
        setUserProfile({...userProfile, isFollowedByCurrentUser: updatedIsFollowing});
    } else {
        const response = await ApiService.followUser(actorId);
        const updatedIsFollowing = response.data?.following ?? false;
        setIsFollowing(updatedIsFollowing);
        setUserProfile({...userProfile, isFollowedByCurrentUser: updatedIsFollowing});
    }
    setLoading(false);
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