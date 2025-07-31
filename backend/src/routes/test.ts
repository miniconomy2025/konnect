import express from 'express';
import type { Request, Response } from 'express';
import { RedisService } from '../services/redisService.js';

const router = express.Router();
const redisService = new RedisService();

router.get('/redis-test', async (req: Request, res: Response) => {
  try {
    // Test Redis by caching and retrieving a post
    const testPostId = 'test123';
    const testPost = {
      _id: testPostId,
      caption: 'Test Post',
      mediaUrl: 'https://example.com/test.jpg',
      mediaType: 'image/jpeg',
      likesCount: 0
    };

    await redisService.cachePost(testPostId, testPost);
    const cachedPost = await redisService.getCachedPost(testPostId);
    
    res.json({ 
      success: true, 
      message: 'Redis is working!',
      post: cachedPost 
    });
  } catch (error) {
    console.error('Redis test error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Redis connection failed',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router; 