"use client";

import React from 'react';
import { styles } from '@/styles/account';
import { Post } from '@/types/post';
import PostItem from './PostItem';

interface PostsGridProps {
  posts: Post[];
  onPostClick?: (post: Post) => void;
}

const PostsGrid: React.FC<PostsGridProps> = ({ posts, onPostClick }) => {
  return (
    <section style={styles.postsGrid}>
      {posts.map((post) => (
        <PostItem key={post.id} post={post} onClick={onPostClick} />
      ))}
    </section>
  );
};

export default PostsGrid;
