"use client";

import React from 'react';
import { styles } from '@/styles/account';
import { Post } from '@/types/post';
import PostItem from './PostItem';
import { ImagePost } from '../Post/ImagePost';
import { TextPost } from '../Post/TextPost';

interface PostsGridProps {
  posts: Post[];
}

  const renderPost = (post: Post) => {
    switch (post.media.type) {
      case 'text':
        return <TextPost key={post.id} post={post} />;
      case 'image':
        return <ImagePost key={post.id} post={post} />;
      default:
        return <TextPost key={post.id} post={post} />;
    }
  };

const PostsGrid: React.FC<PostsGridProps> = ({ posts }) => {
  return (
    <section style={styles.postsGrid}>
        {posts.map(renderPost)}
    </section>
  );
};

export default PostsGrid;