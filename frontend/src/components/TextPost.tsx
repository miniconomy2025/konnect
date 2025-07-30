import React from 'react';
import type { Post } from '@/types/post';
import { Post as PostContainer } from './Post';

interface TextPostProps {
  post: Post;
}

export function TextPost({ post }: TextPostProps) {
  return (
    <PostContainer post={post}>
      <p style={{ padding: '2rem 1rem', fontSize: '1.1rem', color: '#222', margin: 0 }}>{post.caption}</p>
    </PostContainer>
  );
}