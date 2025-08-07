import { Router } from 'express';
import { optionalAuth } from '../middlewares/auth.js';
import { attachFederationContext } from '../middlewares/federation.ts';
import { ExternalPostService } from '../services/externalPostService.js';
import { PostNormalizationService } from '../services/postNormalizationService.js';
import { SearchService } from '../services/searchService.js';

const router = Router();
const searchService = new SearchService();
const externalPostService = new ExternalPostService();

router.get('/users', optionalAuth, async (req, res) => {
  try {
    const { q: query, page = '1', limit = '20' } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const pageNum = parseInt(page as string) || 1;
    const limitNum = Math.min(parseInt(limit as string) || 20, 50); // Max 50 results

    const results = await searchService.searchUsers(query, pageNum, limitNum);

    res.json({
      query,
      results: results.users,
      page: pageNum,
      limit: limitNum,
      hasMore: results.hasMore
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

router.get('/users/federated', optionalAuth, attachFederationContext, async (req, res) => {
  try {
    const { q: query, page = '1', limit = '20' } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    if (!req.federationContext) {
      return res.status(500).json({ error: 'Federation context not available' });
    }

    const pageNum = parseInt(page as string) || 1;
    const limitNum = Math.min(parseInt(limit as string) || 20, 50);

    const currentUserActorId = req.user?.actorId;

    const results = await searchService.searchAllUsers(query, pageNum, limitNum, req.federationContext, currentUserActorId);

    res.json({
      query,
      results: results.users,
      page: pageNum,
      limit: limitNum,
      hasMore: results.hasMore
    });
  } catch (error) {
    console.error('Federated search error:', error);
    res.status(500).json({ error: 'Federated search failed' });
  }
});

router.get('/external/:username/:domain', optionalAuth, async (req, res) => {
  try {
    const { username, domain } = req.params;
    
    if (!username || !domain) {
      return res.status(400).json({ error: 'Username and domain are required' });
    }

    const user = await searchService.lookupExternalUser(username, domain);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('External lookup error:', error);
    res.status(500).json({ error: 'Lookup failed' });
  }
});

// Get external user's posts (unified format)
router.get('/posts/:username/:domain', optionalAuth, async (req, res) => {
  try {
    const { username, domain } = req.params;
    const { limit = '20' } = req.query;
    const currentUserId = req.user?._id.toString();
    
    if (!username || !domain) {
      return res.status(400).json({ error: 'Username and domain are required' });
    }

    const limitNum = Math.min(parseInt(limit as string) || 20, 50);
    
    const externalPosts = await externalPostService.getUserPosts(username, domain, limitNum);
    
    let unifiedPosts = await PostNormalizationService.externalPostsToUnifiedWithLikes(externalPosts, currentUserId, true);
    
    res.json({
      user: `${username}@${domain}`,
      posts: unifiedPosts,
      count: unifiedPosts.length,
      originalCount: externalPosts.length
    });
  } catch (error) {
    console.error('External posts error:', error);
    if (error instanceof Error && error.message === 'User not found') {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(500).json({ error: 'Failed to fetch external posts' });
    }
  }
});

// Get a specific external post (unified format)
router.get('/post', optionalAuth, async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Post URL is required' });
    }

    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const externalPost = await externalPostService.getPost(url);
    
    if (!externalPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const unifiedPost = await PostNormalizationService.externalPostToUnifiedWithLikes(externalPost);

    res.json({ post: unifiedPost });
  } catch (error) {
    console.error('External post fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

export default router;