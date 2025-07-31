import React from 'react';
import Image from 'next/image';
import type { Post } from '@/types/post';
import { Post as PostContainer } from './Post';

interface ImagePostProps {
  post: Post;
}

export function ImagePost({ post }: ImagePostProps) {
  return (
    <PostContainer post={post}>
      <figure style={{ margin: 0 }}>
        <Image
          src={post.mediaUrl || '/placeholder.png'}
          alt={post.caption || 'Image post'}
          width={800}
          height={480}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            maxHeight: 'none',
            objectFit: 'contain',
          }}
        />
      </figure>
    </PostContainer>
  );
}