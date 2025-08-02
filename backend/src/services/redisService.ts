import { Redis } from 'ioredis';

export class RedisService {
  private client: Redis;

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

    this.client.on('error', (err: Error) => console.error('Redis Client Error:', err));
    this.client.on('connect', () => console.log('Redis Client Connected'));
  }

  // Post caching methods
  async cachePost(postId: string, postData: Record<string, any>): Promise<void> {
    await this.client.hset(`post:${postId}`, postData);
    await this.client.expire(`post:${postId}`, 1800); // 30 min cache
  }

  async getCachedPost(postId: string): Promise<Record<string, any> | null> {
    const post = await this.client.hgetall(`post:${postId}`);
    return Object.keys(post).length > 0 ? post : null;
  }

  async invalidatePost(postId: string): Promise<void> {
    await this.client.del(`post:${postId}`);
  }

  // Feed caching methods
  async cacheFeedPosts(userId: string, postIds: string[]): Promise<void> {
    const key = `feed:${userId}`;
    const now = Date.now();
    
    const pipeline = this.client.pipeline();
    postIds.forEach((postId, index) => {
      pipeline.zadd(key, now - index, postId); // Sort by timestamp
    });
    pipeline.expire(key, 900); // 15 minutes cache
    await pipeline.exec();
  }

  async getFeedPosts(userId: string, page: number = 1, limit: number = 20): Promise<string[]> {
    const start = (page - 1) * limit;
    const stop = start + limit - 1;
    return await this.client.zrange(`feed:${userId}`, start, stop);
  }

  // Like counter methods
  async incrementLikes(postId: string): Promise<number> {
    const key = `post:likes:${postId}`;
    const count = await this.client.incr(key);
    await this.client.expire(key, 300); // 5 min cache
    return count;
  }

  async decrementLikes(postId: string): Promise<number> {
    const key = `post:likes:${postId}`;
    const count = await this.client.decr(key);
    await this.client.expire(key, 300); //5 min cache
    return count;
  }

  async getLikes(postId: string): Promise<number> {
    const count = await this.client.get(`post:likes:${postId}`);
    return parseInt(count || '0');
  }
} 