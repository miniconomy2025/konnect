"use client";

import React from 'react';
import { styles } from '@/styles/account';
import { Post } from '@/types/post';
import PostItem from './PostItem';

interface PostsGridProps {
  posts: Post[];
}


const PostsGrid: React.FC<PostsGridProps> = ({ posts }) => {
  return (
    <section style={styles.postsGrid}>
        {posts.map((post) =>
            <PostItem key={post.id} post={post} />
        )}
    </section>
  );
};

export default PostsGrid;