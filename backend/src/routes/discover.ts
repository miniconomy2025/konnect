import express from 'express';
import { getLogger } from '@logtape/logtape';
import { requireAuth } from '../middlewares/auth.ts';
import { PostService } from '../services/postserivce.ts';
import { Neo4jService } from '../services/neo4jService.ts';
import { RecommendationService } from '../services/recommendationService.ts';
import type { Document } from 'mongoose';
import { PostNormalizationService } from '../services/postNormalizationService.ts';

const router = express.Router();
const logger = getLogger('discover');

const neo4jService = new Neo4jService();
const postService = new PostService();
const recommendationService = new RecommendationService(postService, neo4jService);

function transformPost(mongoosePost: Document & { author: Document }) {
  const post = mongoosePost.toObject();
  const author = post.author;

  return {
    id: post._id.toString(),
    type: 'local',
    author: {
      id: author._id.toString(),
      username: author.username,
      domain: 'local',
      displayName: author.displayName || author.username,
      avatarUrl: author.avatarUrl || '/assets/images/missingAvatar.jpg',
      isLocal: true
    },
    content: {
      text: post.caption,
      hasMedia: !!post.mediaUrl,
      mediaType: post.mediaType || null
    },
    media: post.mediaUrl ? {
      type: post.mediaType.startsWith('image/') ? 'image' : 'video',
      url: post.mediaUrl
    } : undefined,
    engagement: {
      likesCount: post.likesCount,
      isLiked: post.isLiked || false,
      canInteract: true
    },
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    isReply: false
  };
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    logger.info('Getting discover feed', { page, limit, userId: req.user!.actorId });
    
    const { posts, externalPosts } = await recommendationService.getDiscoverFeed(
      req.user!.actorId,
      page,
      limit
    );

    logger.info('Got discover feed posts', { count: posts.length });

    // Transform posts to match frontend expectations
    const transformedPosts = posts.map(post => transformPost(post as Document & { author: Document }));

    const unifiedPosts = await PostNormalizationService.localPostsToUnifiedWithLikes(posts, req.user?.id);
    const unifiedExternalPosts = await PostNormalizationService.externalPostsToUnifiedWithLikes(externalPosts, req.user?.id);

    const response = {
      posts: [...unifiedPosts, ...unifiedExternalPosts],
      hasMore: posts.length === limit,
      page,
      limit,
      sources: {
        external: 0,  // All posts are local for now
        local: posts.length
      },
      type: 'local'  // All posts are local for now
    };

    logger.info('Sending discover feed response', { 
      postCount: posts.length,
      hasMore: response.hasMore
    });

    res.json(response);
  } catch (error) {
    logger.error('Failed to get discover feed', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(500).json({ error: 'Failed to get discover feed' });
  }
});

router.get('/liked-by-followed', requireAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const posts = await recommendationService.getLikedByFollowedPosts(
      req.user!.actorId,
      page,
      limit
    );

    res.json({
      posts,
      page,
      limit
    });
  } catch (error) {
    logger.error('Failed to get posts liked by followed users', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to get posts liked by followed users' });
  }
});

router.get('/second-degree', requireAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const posts = await recommendationService.getSecondDegreeUserPosts(
      req.user!.actorId,
      page,
      limit
    );

    res.json({
      posts,
      page,
      limit
    });
  } catch (error) {
    logger.error('Failed to get second degree posts', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to get second degree posts' });
  }
});

router.get('/trending', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const posts = await recommendationService.getTrendingPosts(page, limit);

    res.json({
      posts,
      page,
      limit
    });
  } catch (error) {
    logger.error('Failed to get trending posts', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to get trending posts' });
  }
});

export default router; 