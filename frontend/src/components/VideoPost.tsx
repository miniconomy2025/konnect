import React from 'react';
import type { Post } from '@/types/post';
import { Post as PostContainer } from './Post';

interface VideoPostProps {
  post: Post;
}

export function VideoPost({ post }: VideoPostProps) {
  return (
    <PostContainer post={post}>
      <figure style={{ margin: 0 }}>
        <video controls style={{ width: '100%', maxHeight: 480, display: 'block', background: '#000' }}>
          <source src={post.mediaUrl} type="video/mp4" />
          <p>Sorry, your browser does not support embedded videos.</p>
        </video>
      </figure>
    </PostContainer>
  );
}