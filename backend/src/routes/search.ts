import { Router } from 'express';
import { SearchService } from '../services/searchService.js';
import { optionalAuth } from '../middlewares/auth.js';

const router = Router();
const searchService = new SearchService();

// Search for users (local and external)
router.get('/users', optionalAuth, async (req, res) => {
  try {
    const { q: query, page = '1', limit = '20' } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    if (query.length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
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


export default router;