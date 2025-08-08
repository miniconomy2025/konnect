"use client";

import { styles } from '@/styles/account';
import { Post } from '@/types/post';
import { Heart } from 'lucide-react';
import Image from 'next/image';
import React, { useRef } from 'react';

interface PostItemProps {
  post: Post;
  onClick?: (post: Post) => void;
}

const PostItem: React.FC<PostItemProps> = ({ post, onClick }) => {
    const lastTapRef = useRef(0);
    const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const overlay = e.currentTarget.querySelector('.overlay') as HTMLElement;
    if (overlay) overlay.style.opacity = '1';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const overlay = e.currentTarget.querySelector('.overlay') as HTMLElement;
    if (overlay) overlay.style.opacity = '0';
  };

  const handleClick = () => {
    if (onClick) onClick(post);
  };

  return (
    <section
      style={styles.postItem}
        onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >

      {post.media && post.media.type === 'image' ? (
        <Image
          src={post.media.url || '/assets/images/placeholder.webp'}
          alt={post.content.text}
          width={300}
          height={200}
          style={styles.postImage}
          loading="lazy"
          decoding="async"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 200px"
          // Use blur placeholder only when supported (secure contexts)
          {...(typeof window === 'undefined' || (typeof window !== 'undefined' && window.isSecureContext)
            ? { placeholder: 'blur' as const, blurDataURL: '/assets/images/placeholder.webp' }
            : {})}
          onError={(e) => {
            e.currentTarget.src = '/assets/images/placeholder.webp';
          }}
        />
      ):(
        <section
          style={{
            ...styles.postImage,
            display: 'flex',    
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.9rem',
            fontWeight: '300',
            textAlign: 'center',
            backgroundColor: '#f5f5f5',
            color: '#333',
            padding: '0.75rem',
            lineHeight: 1.3,
            overflow: 'hidden',
          }}
        >
          {post.content.text}
        </section>       
      )}

      <section className="overlay" style={styles.postOverlay} aria-hidden={!onClick}>
        <section style={styles.overlayStats}>
          <section style={styles.overlayStat}>
            
            <section style={{ fontWeight: '600', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div><Heart size={20} style={{ fill: 'currentColor', verticalAlign: 'middle' }} /> {post.engagement.likesCount}</div>
              <div>{post.content.text}</div>
            </section>
          </section>
        </section>
      </section>
    </section>
  );
};

export default PostItem;
