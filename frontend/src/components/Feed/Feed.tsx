import { ApiResponse, ApiService } from '@/lib/api';
import { Color, FontSize, Spacing } from '@/lib/presentation';
import type { GetPostsResponse, Post, UnifiedPostResponse } from '@/types/post';
import { useCallback, useEffect, useState } from 'react';
import { ImagePost } from '../Post/ImagePost';
import { TextPost } from '../Post/TextPost';
import { VideoPost } from '../Post/VideoPost';

interface FeedProps {
  mode: 'discover' | 'following';
}

export function Feed({ mode }: FeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Fetch posts from API or fallback to mock data
  const fetchPosts = useCallback(async (pageNum: number, isInitial = false) => {
    setLoading(true);
    setError(null);
    
    try {
      let apiResponse: ApiResponse<GetPostsResponse>;
      
      if (mode === 'discover') {
        apiResponse = await ApiService.getPosts(pageNum, 3);
      } else {
        apiResponse = await ApiService.getFollowingPosts(pageNum, 3);
      }
      
      if (apiResponse.error) {
        console.warn('API failed, using mock data:', apiResponse.error);
        setError(`Failed to load posts: ${apiResponse.error}`);
      } else if (apiResponse.data) {
        console.log(apiResponse.data);
        const transformedPosts: Post[] = apiResponse.data.posts.map((apiPost: UnifiedPostResponse) => ({
          id: apiPost.id,
          content: {
            text: apiPost.content.text,
            hasMedia: apiPost.content.hasMedia,
            mediaType: apiPost.content.mediaType || 'none',
          },
          createdAt: apiPost.createdAt,
          updatedAt: apiPost.updatedAt || apiPost.createdAt,
          author: {
            id: apiPost.author.id,
            username: apiPost.author.username,
            displayName: apiPost.author.displayName,
            avatarUrl: apiPost.author.avatarUrl || '/assets/images/missingAvatar.jpg',
          },
          engagement: {
            canInteract: apiPost.engagement.canInteract,
            isLiked: apiPost.engagement.isLiked,
            likesCount: apiPost.engagement.likesCount,
          },
          type: apiPost.type,
          url: apiPost.url || '',
          isReply: apiPost.isReply,
          media: {
            type: apiPost.media?.type || 'text',
            url: apiPost.media?.url || '',
          },
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
    switch (post.media.type) {
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