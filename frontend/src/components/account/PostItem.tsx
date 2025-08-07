"use client";

import React, { useRef } from 'react';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { styles } from '@/styles/account';
import { Post } from '@/types/post';

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

  const handleDoubleTap = () => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;
    
    if (timeSinceLastTap < 200 && timeSinceLastTap > 0) {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;
      }
    //   handleLike();
    } else {
      lastTapRef.current = now;
      tapTimeoutRef.current = setTimeout(() => {
        handleClick();
        tapTimeoutRef.current = null;
      }, 200);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleDoubleTap();
  };

  return (
    <section
      style={styles.postItem}
        onMouseDown={handleMouseDown}
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
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: '500',
            textAlign: 'center',
            backgroundColor: '#f5f5f5',
            color: '#333',
          }}
        >
          {post.content.text}
        </section>       
      )}

      <section className="overlay" style={styles.postOverlay}>
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
