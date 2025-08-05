import express from 'express';
import { getLogger } from '@logtape/logtape';
import { requireAuth } from '../middlewares/auth.ts';
import { PostService } from '../services/postserivce.ts';
import { Neo4jService } from '../services/neo4jService.ts';
import { RecommendationService } from '../services/recommendationService.ts';

const router = express.Router();
const logger = getLogger('discover');

const neo4jService = new Neo4jService();
const postService = new PostService();
const recommendationService = new RecommendationService(postService, neo4jService);

router.get('/', requireAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const posts = await recommendationService.getDiscoverFeed(
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
    logger.error('Failed to get discover feed', { error: error instanceof Error ? error.message : String(error) });
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