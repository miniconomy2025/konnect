"use client";

import React from 'react';
import { Heart } from 'lucide-react';
import { styles } from '@/styles/account';
import { Post } from '@/types/post';

interface PostItemProps {
  post: Post;
  onClick?: (post: Post) => void;
}

const PostItem: React.FC<PostItemProps> = ({ post, onClick }) => {
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
      {post.media.type === 'text' ? (
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
      ) : (
        <img
          src={post.media.url}
          alt={post.content.text}
          style={styles.postImage}
        />
      )}

      <section className="overlay" style={styles.postOverlay}>
        <section style={styles.overlayStats}>
          <section style={styles.overlayStat}>
            <Heart size={20} style={{ fill: 'currentColor' }} />
            <section style={{ fontWeight: '600' }}>
              {post.engagement.likesCount}
            </section>
          </section>
        </section>
      </section>
    </section>
  );
};

export default PostItem;
