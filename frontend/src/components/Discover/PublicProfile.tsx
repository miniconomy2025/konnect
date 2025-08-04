"use client";

import React, { useEffect, useState } from 'react';
import { UserProfile } from '@/types/account';
import { PostsResponse } from '@/types/post';
import { ApiService } from '@/lib/api';
import ProfileSection from '@/components/Account/ProfileSection';
import PostsGrid from '@/components/Account/PostsGrid';
import { ArrowLeft } from 'lucide-react';
import { Color, FontFamily, FontSize, Spacing } from '@/lib/presentation';

interface PublicProfileProps {
  username: string;
  onBack: () => void;
}
const PublicProfileView: React.FC<PublicProfileProps> = ({ username, onBack }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | undefined>();
  const [posts, setPosts] = useState<PostsResponse | undefined>();
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [actorId, setActorId] = useState<string>();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data } = await ApiService.getUserByUsername(username);
      const postRes = await ApiService.getUserPosts(username);
      if (data) {
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
        setIsFollowing(data.isFollowing);
        setPosts(postRes.data);
        setActorId(data.activityPubId);
      }
    };

    fetchUserData();
  }, [username]);

  const toggleFollow = async () => {
    if (!userProfile || !actorId) return;
    if (isFollowing) {
        const response = await ApiService.unfollowUser(actorId);
        setIsFollowing(response.data.following);
    } else {
        const response = await ApiService.followUser(actorId);
        setIsFollowing(response.data.following);
    }
  };

  if (!userProfile) return <p>Loading...</p>;

  return (
    <section style={{ marginTop: 24 }}>
      <button
        onClick={onBack}
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
          marginBottom: Spacing.Small,
        }}
      >
        <ArrowLeft size={18} />
        Back to Discover
      </button>

      <ProfileSection
        userProfile={{ ...userProfile, isFollowing }}
        onFollowersClick={() => {}}
        onFollowingClick={() => {}}
        showFollowButton    
        onFollowToggle={toggleFollow}
      />
      <PostsGrid posts={posts?.posts || []} />
    </section>
  );
};

export default PublicProfileView;