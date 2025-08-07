import type { Post } from '@/types/post';
import Image from 'next/image';
import { useState } from 'react';
import { Post as PostContainer } from './Post';

interface ImagePostProps {
  post: Post;
}

export function ImagePost({ post }: ImagePostProps) {
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(post.media.url || '/assets/images/placeholder.webp');

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      setImageSrc('/assets/images/placeholder.webp');
    }
  };

  return (
    <PostContainer post={post}>
      <figure style={{ margin: 0 }}>
        <Image
          src={imageSrc}
          alt={post.content.text || 'Image post'}
          width={800}
          height={480}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            maxHeight: 'none',
            objectFit: 'contain',
          }}
          onError={handleImageError}
        />
      </figure>
    </PostContainer>
  );
}