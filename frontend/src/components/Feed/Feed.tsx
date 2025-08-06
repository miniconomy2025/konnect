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
  const [posts, setPosts] = useState<{
    discover: Post[];
    following: Post[];
  }>({
    discover: [],
    following: [],
  });
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState({
    discover: true,
    following: true,
  });
  const [pages, setPages] = useState({
    discover: 1,
    following: 1,
  });
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState({
    discover: false,
    following: false,
  });

  // Fetch posts from API or fallback to mock data
  const fetchPosts = useCallback(async (pageNum: number, isInitial = false) => {
    setLoading(true);
    setError(null);
    
    try {
      let apiResponse: ApiResponse<GetPostsResponse>;
      
      if (mode === 'discover') {
        apiResponse = await ApiService.getPosts('discover', pageNum, 5);
      } else {
        apiResponse = await ApiService.getPosts('following', pageNum, 5);
      }
      
      if (apiResponse.error) {
        console.warn('API failed, using mock data:', apiResponse.error);
        setError(`Failed to load posts: ${apiResponse.error}`);
      } else if (apiResponse.data) {
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
          setPosts(prev => ({
            ...prev,
            [mode]: transformedPosts,
          }));
        } else {
          setPosts(prev => {
            const existingIds = new Set(prev[mode].map(post => post.id));
            const newPosts = transformedPosts.filter(post => !existingIds.has(post.id));
            
            return {
              ...prev,
              [mode]: [...prev[mode], ...newPosts],
            };
          });
        }
        
        setHasMore(prev => ({
          ...prev,
          [mode]: apiResponse.data?.hasMore || false,
        }));
      }
    } catch {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
      setPages(prev => ({
        ...prev,
        [mode]: pageNum,
      }));
    }
  }, [mode]);

  useEffect(() => {
    if (!initialized[mode]) {
      setPages(prev => ({
        ...prev,
        [mode]: 1,
      }));
      setHasMore(prev => ({
        ...prev,
        [mode]: true,
      }));
      setError(null);
      setInitialized(prev => ({
        ...prev,
        [mode]: true,
      }));
      fetchPosts(1, true);
    }
  }, [mode, initialized, fetchPosts]);

  useEffect(() => {
    setInitialized(prev => ({
      ...prev,
      [mode]: false,
    }));
  }, [mode]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (loading || !hasMore[mode]) return;
    
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    if (scrollTop + windowHeight >= documentHeight - 100) {
      fetchPosts(pages[mode] + 1);
    }
  }, [loading, hasMore, pages, mode, fetchPosts]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const renderPost = (post: Post) => {
    switch (post.media.type) {
      case 'text':
        return <TextPost post={post} />;
      case 'image':
        return <ImagePost post={post} />;
      case 'video':
        return <VideoPost post={post} />;
      default:
        return <TextPost post={post} />;
    }
  };

  return (
    <main style={{ 
      padding: Spacing.Medium,
      background: 'transparent',
    }}>
             {error && (
                   <section style={{
            textAlign: 'center',
            padding: Spacing.Medium,
            color: Color.Error,
            fontSize: FontSize.Base,
            marginBottom: Spacing.Medium,
            background: 'rgba(255, 255, 255, 0.6)',
            borderRadius: '0.5rem',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}>
           <strong>{error}</strong>
         </section>
       )}
      
             {posts[mode].length === 0 && !loading && mode === 'following' && (
         <section style={{
           textAlign: 'center',
           padding: Spacing.XLarge,
           color: Color.Muted,
           fontSize: FontSize.Base,
           background: 'rgba(255, 255, 255, 0.6)',
           borderRadius: '1rem',
           backdropFilter: 'blur(12px)',
           WebkitBackdropFilter: 'blur(12px)',
         }}>
           <strong style={{ fontSize: 48, marginBottom: Spacing.Medium }}>👥</strong>
           <h3 style={{ margin: '0 0 1rem 0', color: Color.Text }}>No posts yet</h3>
           <p style={{ margin: 0, lineHeight: 1.5 }}>
             Start following people to see their posts here!
           </p>
         </section>
       )}
      
      {posts[mode].map((post) => (
        <article key={`${post.id}-${mode}`}>
          {renderPost(post)}
        </article>
      ))}
      
             {loading && (
         <section style={{
           textAlign: 'center',
           padding: Spacing.Large,
           color: Color.Muted,
           fontSize: FontSize.Base,
           background: 'rgba(255, 255, 255, 0.6)',
           borderRadius: '0.5rem',
           backdropFilter: 'blur(12px)',
           WebkitBackdropFilter: 'blur(12px)',
         }}>
           <strong>Loading more posts...</strong>
         </section>
       )}
      
             {!hasMore[mode] && posts[mode].length > 0 && (
         <section style={{
           textAlign: 'center',
           padding: Spacing.Large,
           color: Color.Muted,
           fontSize: FontSize.Base,
           background: 'rgba(255, 255, 255, 0.6)',
           borderRadius: '0.5rem',
           backdropFilter: 'blur(12px)',
           WebkitBackdropFilter: 'blur(12px)',
         }}>
           <strong>You&apos;ve reached the end! 🎉</strong>
         </section>
       )}
    </main>
  );
} 