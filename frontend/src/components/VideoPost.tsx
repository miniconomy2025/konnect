import React from 'react';
import type { Post } from '@/types/post';
import { Post as PostContainer } from './Post';
import { Spacing } from '@/lib/presentation';

interface VideoPostProps {
  post: Post;
}

export function VideoPost({ post }: VideoPostProps) {
  return (
    <PostContainer post={post}>
      <figure style={{ margin: 0 }}>
        <video controls style={{ width: '100%', maxHeight: 480, display: 'block', background: '#000', marginBottom: Spacing.Small }}>
          <source src={post.mediaUrl} type="video/mp4" />
          Sorry, your browser does not support embedded videos.
        </video>
      </figure>
    </PostContainer>
  );
}