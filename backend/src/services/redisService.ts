import Redis from 'ioredis';
import { config } from '../config.js';

export class RedisService {
  private client: Redis;

  constructor() {
    this.client = new Redis({
      host: config.redis.host || 'localhost',
      port: config.redis.port || 6379,
      password: config.redis.password,
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
    await this.client.expire(`post:${postId}`, 3600); // 1 hour cache
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
    await this.client.expire(key, 3600); // 1 hour cache
    return count;
  }

  async decrementLikes(postId: string): Promise<number> {
    const key = `post:likes:${postId}`;
    const count = await this.client.decr(key);
    await this.client.expire(key, 3600);
    return count;
  }

  async getLikes(postId: string): Promise<number> {
    const count = await this.client.get(`post:likes:${postId}`);
    return parseInt(count || '0');
  }

  // Following cache methods
  async cacheFollowing(userId: string, followingIds: string[]): Promise<void> {
    const key = `following:${userId}`;
    if (followingIds.length > 0) {
      await this.client.sadd(key, ...followingIds);
      await this.client.expire(key, 3600); // 1 hour cache
    }
  }

  async getFollowing(userId: string): Promise<string[]> {
    return await this.client.smembers(`following:${userId}`);
  }

  async addFollowing(userId: string, followingId: string): Promise<void> {
    await this.client.sadd(`following:${userId}`, followingId);
  }

  async removeFollowing(userId: string, followingId: string): Promise<void> {
    await this.client.srem(`following:${userId}`, followingId);
  }
} 