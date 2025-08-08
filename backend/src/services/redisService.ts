import { Redis } from 'ioredis';

export class RedisService {
  private client: Redis;
  private static instance: RedisService;

  private constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3
    });

    this.client.on('error', (err: Error) => console.error('Redis Client Error:', err));
    this.client.on('connect', () => console.log('Redis Client Connected'));
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }
  
  private isCacheEnabled(): boolean {
    return process.env.ENABLE_REDIS_CACHE === 'true';
  }

  // Following/Followers caching methods
  async cacheFollowingList(userId: string, followingIds: string[]): Promise<void> {
    if (!this.isCacheEnabled()) return;
    const key = `following:${userId}`;
    await this.client.del(key); // Clear existing list
    if (followingIds.length > 0) {
      await this.client.sadd(key, ...followingIds);
      await this.client.expire(key, 60); // 1 minutes cache
    }
  }

  async cacheFollowersList(userId: string, followerIds: string[]): Promise<void> {
    if (!this.isCacheEnabled()) return;
    const key = `followers:${userId}`;
    await this.client.del(key); // Clear existing list
    if (followerIds.length > 0) {
      await this.client.sadd(key, ...followerIds);
      await this.client.expire(key, 60); // 1 minutes cache
    }
  }

  async getCachedFollowingList(userId: string): Promise<string[]> {
    if (!this.isCacheEnabled()) return [];
    return await this.client.smembers(`following:${userId}`);
  }

  async getCachedFollowersList(userId: string): Promise<string[]> {
    if (!this.isCacheEnabled()) return [];
    return await this.client.smembers(`followers:${userId}`);
  }

  async cacheFollowCounts(userId: string, followingCount: number, followersCount: number): Promise<void> {
    if (!this.isCacheEnabled()) return;
    const pipeline = this.client.pipeline();
    pipeline.set(`following:count:${userId}`, followingCount.toString(), 'EX', 60); // 1 minutes cache
    pipeline.set(`followers:count:${userId}`, followersCount.toString(), 'EX', 60); // 1 minutes cache
    await pipeline.exec();
  }

  async getCachedFollowCounts(userId: string): Promise<{ following: number; followers: number } | null> {
    if (!this.isCacheEnabled()) return null;
    const [followingCount, followersCount] = await Promise.all([
      this.client.get(`following:count:${userId}`),
      this.client.get(`followers:count:${userId}`)
    ]);

    if (!followingCount || !followersCount) return null;

    return {
      following: parseInt(followingCount),
      followers: parseInt(followersCount)
    };
  }

  async invalidateFollowCaches(userId: string, targetUserId: string): Promise<void> {
    if (!this.isCacheEnabled()) return;
    const pipeline = this.client.pipeline();
    // Invalidate following/followers lists
    pipeline.del(`following:${userId}`);
    pipeline.del(`followers:${targetUserId}`);
    // Invalidate counts
    pipeline.del(`following:count:${userId}`);
    pipeline.del(`followers:count:${targetUserId}`);
    await pipeline.exec();
  }

  // Post caching methods
  async cachePost(postId: string, postData: Record<string, any>): Promise<void> {
    if (!this.isCacheEnabled()) return;
    await this.client.hset(`post:${postId}`, postData);
    await this.client.expire(`post:${postId}`, 60); // 1 min cache
  }

  async getCachedPost(postId: string): Promise<Record<string, any> | null> {
    if (!this.isCacheEnabled()) return null;
    const post = await this.client.hgetall(`post:${postId}`);
    return Object.keys(post).length > 0 ? post : null;
  }

  async invalidatePost(postId: string): Promise<void> {
    if (!this.isCacheEnabled()) return;
    await this.client.del(`post:${postId}`);
  }

  // Feed caching methods
  async cacheFeedPosts(userId: string, postIds: string[]): Promise<void> {
    if (!this.isCacheEnabled()) return;
    const key = `feed:${userId}`;
    const now = Date.now();
    
    const pipeline = this.client.pipeline();
    postIds.forEach((postId, index) => {
      pipeline.zadd(key, now - index, postId); // Sort by timestamp
    });
    pipeline.expire(key, 300); // 5 minutes cache
    await pipeline.exec();
  }

  async getFeedPosts(userId: string, page: number = 1, limit: number = 20): Promise<string[]> {
    if (!this.isCacheEnabled()) return [];
    const start = (page - 1) * limit;
    const stop = start + limit - 1;
    return await this.client.zrange(`feed:${userId}`, start, stop);
  }

  // Like counter methods
  async incrementLikes(postId: string): Promise<number> {
    if (!this.isCacheEnabled()) return 0;
    const key = `post:likes:${postId}`;
    const count = await this.client.incr(key);
    await this.client.expire(key, 60); // 1 min cache
    return count;
  }

  async decrementLikes(postId: string): Promise<number> {
    if (!this.isCacheEnabled()) return 0;
    const key = `post:likes:${postId}`;
    const count = await this.client.decr(key);
    await this.client.expire(key, 60); //1 min cache
    return count;
  }

  async getLikes(postId: string): Promise<number> {
    if (!this.isCacheEnabled()) return 0;
    const count = await this.client.get(`post:likes:${postId}`);
    return parseInt(count || '0');
  }
} 