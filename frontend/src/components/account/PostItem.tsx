"use client";

import React from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { styles } from '@/styles/account';
import { Post } from '@/types/account';

interface PostItemProps {
  post: Post;
}

const PostItem: React.FC<PostItemProps> = ({ post }) => {
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const overlay = e.currentTarget.querySelector('.overlay') as HTMLElement;
    if (overlay) {
      overlay.style.opacity = '1';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const overlay = e.currentTarget.querySelector('.overlay') as HTMLElement;
    if (overlay) {
      overlay.style.opacity = '0';
    }
  };

  return (
    <div 
      style={styles.postItem}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <img 
        src={post.image} 
        alt={`Post ${post.id}`}
        style={styles.postImage}
      />
      <div className="overlay" style={styles.postOverlay}>
        <div style={styles.overlayStats}>
          <div style={styles.overlayStat}>
            <Heart size={20} style={{ fill: 'currentColor' }} />
            <span style={{ fontWeight: '600' }}>{post.likes}</span>
          </div>
          <div style={styles.overlayStat}>
            <MessageCircle size={20} style={{ fill: 'currentColor' }} />
            <span style={{ fontWeight: '600' }}>{post.comments}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostItem;