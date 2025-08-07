import { Skeleton } from '@/components/Skeleton/Skeleton';
import type { Post } from '@/types/post';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Post as PostContainer } from './Post';

interface ImagePostProps {
  post: Post;
}

export function ImagePost({ post }: ImagePostProps) {
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(post.media?.url ?? '/assets/images/placeholder.webp');
  const [isLoading, setIsLoading] = useState(true);

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      setImageSrc('/assets/images/placeholder.webp');
    }
  };

  useEffect(() => {
    setIsLoading(true);
  }, [imageSrc]);

  return (
    <PostContainer post={post}>
      <figure style={{ margin: 0, position: 'relative' }}>
        {isLoading && (
          <div style={{ position: 'absolute', inset: 0 }}>
            <Skeleton width="100%" height={480} borderRadius={0} />
          </div>
        )}
        <Image
          src={imageSrc}
          alt={post.content.text || 'Image post'}
          width={800}
          height={480}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.2s ease-in-out',
            maxHeight: 'none',
            objectFit: 'contain',
          }}
          onError={handleImageError}
          onLoadingComplete={() => setIsLoading(false)}
        />
      </figure>
    </PostContainer>
  );
}