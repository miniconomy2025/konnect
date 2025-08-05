import { getLogger } from '@logtape/logtape';
import type { IPost } from '../models/post.ts';
import { PostService } from './postserivce.ts';
import { Neo4jService } from './neo4jService.ts';

const logger = getLogger('recommendation');

export class RecommendationService {
  constructor(
    private readonly postService: PostService,
    private readonly neo4jService: Neo4jService
  ) {}

  async getDiscoverFeed(userActorId: string, page: number = 1, limit: number = 20): Promise<IPost[]> {
    try {
      // Get post IDs from Neo4j in parallel
      const [
        likedByFollowedIds,
        secondDegreeIds,
        trendingIds
      ] = await Promise.all([
        this.neo4jService.getPostsLikedByFollowed(userActorId, limit),
        this.neo4jService.getSecondDegreeUserPosts(userActorId, limit),
        this.neo4jService.getTrendingPosts(limit)
      ]);

      // Combine and deduplicate post IDs
      const uniquePostIds = Array.from(new Set([
        ...likedByFollowedIds,
        ...secondDegreeIds,
        ...trendingIds
      ]));

      // Get actual post data from MongoDB
      const posts = await Promise.all(
        uniquePostIds.map(postId => this.postService.getPostById(postId))
      );

      // Remove nulls and sort by creation date
      const validPosts = posts
        .filter((post): post is IPost => post !== null)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      // Apply pagination
      const start = (page - 1) * limit;
      const end = start + limit;
      return validPosts.slice(start, end);

    } catch (error) {
      logger.error('Failed to get discover feed', { error: error instanceof Error ? error.message : String(error) });
      return [];
    }
  }

  async getLikedByFollowedPosts(userActorId: string, page: number = 1, limit: number = 20): Promise<IPost[]> {
    try {
      const postIds = await this.neo4jService.getPostsLikedByFollowed(userActorId, limit);
      const posts = await Promise.all(
        postIds.map(postId => this.postService.getPostById(postId))
      );
      return posts.filter((post): post is IPost => post !== null);
    } catch (error) {
      logger.error('Failed to get posts liked by followed users', { error: error instanceof Error ? error.message : String(error) });
      return [];
    }
  }

  async getSecondDegreeUserPosts(userActorId: string, page: number = 1, limit: number = 20): Promise<IPost[]> {
    try {
      const postIds = await this.neo4jService.getSecondDegreeUserPosts(userActorId, limit);
      const posts = await Promise.all(
        postIds.map(postId => this.postService.getPostById(postId))
      );
      return posts.filter((post): post is IPost => post !== null);
    } catch (error) {
      logger.error('Failed to get second degree user posts', { error: error instanceof Error ? error.message : String(error) });
      return [];
    }
  }

  async getTrendingPosts(page: number = 1, limit: number = 20): Promise<IPost[]> {
    try {
      const postIds = await this.neo4jService.getTrendingPosts(limit);
      const posts = await Promise.all(
        postIds.map(postId => this.postService.getPostById(postId))
      );
      return posts.filter((post): post is IPost => post !== null);
    } catch (error) {
      logger.error('Failed to get trending posts', { error: error instanceof Error ? error.message : String(error) });
      return [];
    }
  }
} 