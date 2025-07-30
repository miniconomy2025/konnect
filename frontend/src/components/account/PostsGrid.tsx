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
    <section style={styles.postsGrid}>
      {activeTab === 'posts' && posts.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}
      {activeTab === 'reels' && (
        <section style={styles.emptyState}>
          No reels yet
        </section>
      )}
    </section>
  );
};

export default PostsGrid;