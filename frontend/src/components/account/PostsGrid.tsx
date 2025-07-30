"use client";

import React from 'react';
import { styles } from '@/styles/account';
import { Post } from '@/types/account';
import PostItem from './PostItem';

interface PostsGridProps {
  activeTab: string;
  posts: Post[];
}

const PostsGrid: React.FC<PostsGridProps> = ({ activeTab, posts }) => {
  return (
    <div style={styles.postsGrid}>
      {activeTab === 'posts' && posts.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}
      {activeTab === 'reels' && (
        <div style={styles.emptyState}>
          No reels yet
        </div>
      )}
    </div>
  );
};

export default PostsGrid;