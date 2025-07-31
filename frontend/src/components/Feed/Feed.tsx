import React, { useState, useEffect, useCallback } from 'react';
import { TextPost } from '../Post/TextPost';
import { ImagePost } from '../Post/ImagePost';
import { VideoPost } from '../Post/VideoPost';
import type { Post } from '@/types/post';
import { Color, Spacing, FontSize } from '@/lib/presentation';
import { ApiService } from '@/lib/api';

interface FeedProps {
  mode: 'discover' | 'following';
}

// Mock data for Discover mode - all posts
const discoverPosts: Post[] = [
  {
    id: '1',
    author: { id: 'u1', username: 'alice', displayName: 'Alice Johnson', avatarUrl: '/assets/images/missingAvatar.jpg' },
    caption: 'Just finished my morning workout! 💪 Feeling energized and ready to tackle the day. What\'s everyone up to today?',
    mediaType: 'text',
    likesCount: 24,
    isLiked: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: '2',
    author: { id: 'u2', username: 'bob', displayName: 'Bob Smith', avatarUrl: '/assets/images/missingAvatar.jpg' },
    caption: 'Amazing sunset at the beach today! 🌅',
    mediaUrl: '/assets/images/placeholder.webp',
    mediaType: 'image',
    likesCount: 156,
    isLiked: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '3',
    author: { id: 'u3', username: 'charlie', displayName: 'Charlie Brown', avatarUrl: '/assets/images/missingAvatar.jpg' },
    caption: 'Check out this cool trick! 🎯',
    mediaUrl: '/sample.mp4',
    mediaType: 'video',
    likesCount: 89,
    isLiked: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: '4',
    author: { id: 'u4', username: 'diana', displayName: 'Diana Prince', avatarUrl: '/assets/images/missingAvatar.jpg' },
    caption: 'Sometimes you just need to take a moment and appreciate the little things in life. Today I found this beautiful flower growing in the most unexpected place. It reminded me that beauty can be found anywhere if you look hard enough. 🌸',
    mediaType: 'text',
    likesCount: 42,
    isLiked: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: '5',
    author: { id: 'u5', username: 'edward', displayName: 'Edward Norton', avatarUrl: '/assets/images/missingAvatar.jpg' },
    caption: 'Perfect timing! 📸',
    mediaUrl: '/assets/images/placeholder.webp',
    mediaType: 'image',
    likesCount: 203,
    isLiked: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: '6',
    author: { id: 'u6', username: 'fiona', displayName: 'Fiona Gallagher', avatarUrl: '/assets/images/missingAvatar.jpg' },
    caption: 'New recipe I tried today! 🍝',
    mediaUrl: '/assets/images/placeholder.webp',
    mediaType: 'image',
    likesCount: 78,
    isLiked: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
  },
  {
    id: '7',
    author: { id: 'u7', username: 'george', displayName: 'George Washington', avatarUrl: '/assets/images/missingAvatar.jpg' },
    caption: 'Thought of the day: The best way to predict the future is to create it. What are you creating today? 🤔',
    mediaType: 'text',
    likesCount: 95,
    isLiked: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
];

// Mock data for Following mode - only posts from followed users
const followingPosts: Post[] = [
  {
    id: '2',
    author: { id: 'u2', username: 'bob', displayName: 'Bob Smith', avatarUrl: '/assets/images/missingAvatar.jpg' },
    caption: 'Amazing sunset at the beach today! 🌅',
    mediaUrl: '/assets/images/placeholder.webp',
    mediaType: 'image',
    likesCount: 156,
    isLiked: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '5',
    author: { id: 'u5', username: 'edward', displayName: 'Edward Norton', avatarUrl: '/assets/images/missingAvatar.jpg' },
    caption: 'Perfect timing! 📸',
    mediaUrl: '/assets/images/placeholder.webp',
    mediaType: 'image',
    likesCount: 203,
    isLiked: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: '7',
    author: { id: 'u7', username: 'george', displayName: 'George Washington', avatarUrl: '/assets/images/missingAvatar.jpg' },
    caption: 'Thought of the day: The best way to predict the future is to create it. What are you creating today? 🤔',
    mediaType: 'text',
    likesCount: 95,
    isLiked: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
];

export function Feed({ mode }: FeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Get the appropriate data source based on mode
  const getDataSource = () => {
    return mode === 'discover' ? discoverPosts : followingPosts;
  };

  // Fetch posts from API or fallback to mock data
  const fetchPosts = useCallback(async (pageNum: number, isInitial = false) => {
    setLoading(true);
    setError(null);
    
    try {
      let apiResponse;
      
      if (mode === 'discover') {
        apiResponse = await ApiService.getPosts(pageNum, 3);
      } else {
        apiResponse = await ApiService.getFollowingPosts(pageNum, 3);
      }
      
      if (apiResponse.error) {
        // Fallback to mock data if API fails
        console.warn('API failed, using mock data:', apiResponse.error);
        const dataSource = getDataSource();
        const startIndex = (pageNum - 1) * 3;
        const newPosts = dataSource.slice(startIndex, startIndex + 3);
        
        if (isInitial) {
          setPosts(newPosts);
        } else {
          setPosts(prev => [...prev, ...newPosts]);
        }
        
        setHasMore(newPosts.length === 3 && startIndex + 3 < dataSource.length);
      } else if (apiResponse.data) {
        // Transform API data to match Post interface
        const transformedPosts = apiResponse.data.map((apiPost: any) => ({
          id: apiPost._id || apiPost.id,
          author: {
            id: apiPost.author._id || apiPost.author.id,
            username: apiPost.author.username,
            displayName: apiPost.author.displayName,
            avatarUrl: apiPost.author.avatarUrl || '/assets/images/missingAvatar.jpg',
          },
          caption: apiPost.caption,
          mediaUrl: apiPost.mediaUrl,
          mediaType: apiPost.mediaType || 'text',
          likesCount: apiPost.likesCount || 0,
          isLiked: apiPost.isLiked || false,
          createdAt: apiPost.createdAt,
          updatedAt: apiPost.updatedAt,
        }));
        
        if (isInitial) {
          setPosts(transformedPosts);
        } else {
          setPosts(prev => [...prev, ...transformedPosts]);
        }
        
        setHasMore(transformedPosts.length === 3);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts');
      
      // Fallback to mock data
      const dataSource = getDataSource();
      const startIndex = (pageNum - 1) * 3;
      const newPosts = dataSource.slice(startIndex, startIndex + 3);
      
      if (isInitial) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }
      
      setHasMore(newPosts.length === 3 && startIndex + 3 < dataSource.length);
    } finally {
      setLoading(false);
      setPage(pageNum);
    }
  }, [mode]);

  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    fetchPosts(1, true);
  }, [mode, fetchPosts]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (loading || !hasMore) return;
    
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    if (scrollTop + windowHeight >= documentHeight - 100) {
      fetchPosts(page + 1);
    }
  }, [loading, hasMore, page, fetchPosts]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const renderPost = (post: Post) => {
    switch (post.mediaType) {
      case 'text':
        return <TextPost key={post.id} post={post} />;
      case 'image':
        return <ImagePost key={post.id} post={post} />;
      case 'video':
        return <VideoPost key={post.id} post={post} />;
      default:
        return <TextPost key={post.id} post={post} />;
    }
  };

  return (
    <main style={{ padding: Spacing.Medium }}>
      {error && (
        <section style={{
          textAlign: 'center',
          padding: Spacing.Medium,
          color: Color.Error,
          fontSize: FontSize.Base,
          marginBottom: Spacing.Medium,
        }}>
          <strong>{error}</strong>
        </section>
      )}
      
      {posts.length === 0 && !loading && mode === 'following' && (
        <section style={{
          textAlign: 'center',
          padding: Spacing.XLarge,
          color: Color.Muted,
          fontSize: FontSize.Base,
        }}>
          <strong style={{ fontSize: 48, marginBottom: Spacing.Medium }}>👥</strong>
          <h3 style={{ margin: '0 0 1rem 0', color: Color.Text }}>No posts yet</h3>
          <p style={{ margin: 0, lineHeight: 1.5 }}>
            Start following people to see their posts here!
          </p>
        </section>
      )}
      
      {posts.map(renderPost)}
      
      {loading && (
        <section style={{
          textAlign: 'center',
          padding: Spacing.Large,
          color: Color.Muted,
          fontSize: FontSize.Base,
        }}>
          <strong>Loading more posts...</strong>
        </section>
      )}
      
      {!hasMore && posts.length > 0 && (
        <section style={{
          textAlign: 'center',
          padding: Spacing.Large,
          color: Color.Muted,
          fontSize: FontSize.Base,
        }}>
          <strong>You've reached the end! 🎉</strong>
        </section>
      )}
    </main>
  );
} 