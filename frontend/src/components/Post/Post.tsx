import React, { useState, useRef } from 'react';
import Image from 'next/image';
import type { Post } from '@/types/post';
import { Color, Spacing, FontSize, Radius, FontFamily } from '@/lib/presentation';
import { ApiService } from '@/lib/api';
import router from 'next/router';

interface PostProps {
  post: Post;
  children: React.ReactNode;
}

export function Post({ post, children }: PostProps) {
  const [isLiked, setIsLiked] = useState(post.engagement.isLiked);
  const [likesCount, setLikesCount] = useState(post.engagement.likesCount);
  const [isLiking, setIsLiking] = useState(false);
  const [tiltStyle, setTiltStyle] = useState({});
  const postRef = useRef<HTMLElement>(null);

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    
    try {
      const response = await ApiService.likePost(post.id);
      
      if (response.error) {
        console.error('Failed to like post:', response.error);
        // Revert the UI state if API call fails
        setIsLiked(!isLiked);
        setLikesCount(isLiked ? likesCount + 1 : likesCount - 1);
      } else {
        // Update the state based on the API response
        setIsLiked(!isLiked);
        setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
      }
    } catch (error) {
      console.error('Error liking post:', error);
      // Revert the UI state if API call fails
      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount + 1 : likesCount - 1);
    } finally {
      setIsLiking(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!postRef.current) return;
    
    const rect = postRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / centerY * -5;
    const rotateY = (x - centerX) / centerX * 5;
    
    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      boxShadow: `0 ${Math.abs(rotateX) * 2}px ${Math.abs(rotateX) * 4}px rgba(0, 0, 0, 0.1)`,
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
      boxShadow: 'none',
    });
  };

  // Utility: consistent color from domain string
  function stringToColor(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Simple HSL color for better contrast
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 60%, 55%)`;
  }

  const maxLen = 10;
  const displayDomain = post.author.domain.length > maxLen ? post.author.domain.slice(0, maxLen) + "…" : post.author.domain;
  const domainColor = stringToColor(post.author.domain);

  return (
    <article
      ref={postRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        border: `1px solid ${Color.Border}`,
        borderRadius: Radius.Medium,
        background: Color.Surface,
        marginBottom: Spacing.Large,
        overflow: 'hidden',
        maxWidth: 480,
        margin: '0 auto 1.5rem auto',
        transition: 'transform 0.1s ease, box-shadow 0.1s ease',
        cursor: 'pointer',
        ...tiltStyle,
      }}>
      <header style={{
        background: Color.Surface,
        padding: `${Spacing.Medium} ${Spacing.Large}`,
        borderBottom: `1px solid ${Color.Border}`,
        display: 'flex',
        alignItems: 'center',
        gap: Spacing.Small,
        cursor: 'pointer',
      }}
        onClick={() => {
          router.push(`/Discover?user=${post.author.username}`);
        }}
      >
        <figure style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: Color.Background,
          border: `1px solid ${Color.Border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          margin: 0,
          flexShrink: 0,
        }}>
          {post.author.avatarUrl ? (
            <Image
              width={40}
              height={40} 
              src={post.author.avatarUrl} 
              alt={post.author.displayName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Image
              width={40}
              height={40} 
              src="/assets/images/missingAvatar.jpg" 
              alt={post.author.displayName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </figure>
        <section style={{ flex: 1 }}>
          <strong style={{ 
            color: Color.Text, 
            fontSize: FontSize.Base, 
            fontFamily: FontFamily.Nunito,
            display: 'block',
          }}>
            {post.author.displayName}
          </strong>
          <time style={{ 
            color: Color.Muted, 
            fontSize: FontSize.Small,
            fontFamily: FontFamily.Nunito,
          }}>
            @{post.author.username} • {formatTimeAgo(post.createdAt)}
          </time>
        </section>
        <mark
          style={{
            backgroundColor: domainColor,
            color: "#fff",
            borderRadius: "0.75em",
            padding: "0.2em 0.7em",
            fontSize: "0.85em",
            marginLeft: "0.5em",
            cursor: "pointer",
            whiteSpace: "nowrap",
            display: "inline-block",
          }}
          title={post.author.domain}
          aria-label={`Domain: ${post.author.domain}`}
        >
          {displayDomain}
        </mark>
      </header>
      
      <main style={{ background: Color.Background, padding: 0, textAlign: 'center' }}>
        {children}
      </main>
      
      {post.content.text && post.media.type !== 'text' && (
        <section style={{
          padding: `${Spacing.Medium} ${Spacing.Large}`,
          background: Color.Surface,
          borderTop: `1px solid ${Color.Border}`,
        }}>
          <p style={{ 
            margin: 0, 
            fontSize: FontSize.Base,
            lineHeight: 1.5,
            color: Color.Text,
          }}>
            {post.content.text}
          </p>
        </section>
      )}
      
      {post.engagement.canInteract && (
      <footer style={{
        padding: `${Spacing.Medium} ${Spacing.Large}`,
        background: Color.Surface,
        borderTop: `1px solid ${Color.Border}`,
        display: 'flex',
        alignItems: 'center',
      }}>
        <button
          onClick={handleLike}
          disabled={isLiking}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: Spacing.Small,
            background: 'none',
            border: 'none',
            cursor: isLiking ? 'not-allowed' : 'pointer',
            fontSize: FontSize.Base,
            transition: 'opacity 0.2s ease',
            fontFamily: 'inherit',
            opacity: isLiking ? 0.6 : 1,
          }}
        >
          <Image 
            src={isLiked ? "/assets/images/liked.png" : "/assets/images/notLiked.png"}
            alt={isLiked ? "Liked" : "Not liked"}
            width={20}
            height={20}
            style={{ width: 20, height: 20 }}
          />
          <strong>{likesCount}</strong>
          </button>
        </footer>
      )}
    </article>
  );
}