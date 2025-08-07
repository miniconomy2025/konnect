import { Driver, Session, driver, auth, Integer } from 'neo4j-driver';
import { getLogger } from '@logtape/logtape';

const logger = getLogger('neo4j');

export class Neo4jService {
  private driver: Driver;

  constructor() {
    const uri = process.env.NEO4J_URI;
    const username = process.env.NEO4J_USERNAME;
    const password = process.env.NEO4J_PASSWORD;

    if (!uri || !username || !password) {
      throw new Error('Missing required Neo4j environment variables');
    }

    this.driver = driver(
      uri,
      auth.basic(username, password)
    );
  }

  getSession(): Session {
    return this.driver.session();
  }

  async initializeSchema(): Promise<void> {
    const session = this.getSession();
    try {
      // Drop existing constraints and indexes
      await session.run('DROP CONSTRAINT user_id IF EXISTS');
      await session.run('DROP CONSTRAINT user_actor_id IF EXISTS');
      await session.run('DROP CONSTRAINT user_composite IF EXISTS');
      await session.run('DROP CONSTRAINT post_id IF EXISTS');
      await session.run('DROP INDEX post_timestamp IF EXISTS');
      await session.run('DROP INDEX post_likes IF EXISTS');
      await session.run('DROP INDEX user_id IF EXISTS');

      // Create new constraints
      await session.run('CREATE CONSTRAINT user_actor_id IF NOT EXISTS FOR (u:User) REQUIRE u.actorId IS UNIQUE');
      await session.run('CREATE CONSTRAINT post_id IF NOT EXISTS FOR (p:Post) REQUIRE p.postId IS UNIQUE');
      
      // Create indexes
      await session.run('CREATE INDEX post_timestamp IF NOT EXISTS FOR (p:Post) ON (p.timestamp)');
      await session.run('CREATE INDEX post_likes IF NOT EXISTS FOR (p:Post) ON (p.likesCount)');
      await session.run('CREATE INDEX user_mongo_id IF NOT EXISTS FOR (u:User) ON (u.mongoId)');
    } finally {
      await session.close();
    }
  }

  async createOrUpdateUser(actorId: string, username: string, mongoId?: string): Promise<void> {
    const session = this.getSession();
    try {
      if (mongoId) {
        // Local user
        await session.run(
          `MERGE (u:User {actorId: $actorId})
           SET u.username = $username,
               u.mongoId = $mongoId,
               u.isLocal = true`,
          { actorId, username, mongoId }
        );
      } else {
        // External user
        await session.run(
          `MERGE (u:User {actorId: $actorId})
           SET u.username = $username,
               u.isLocal = false`,
          { actorId, username }
        );
      }
    } finally {
      await session.close();
    }
  }

  async createPost(postId: string, authorActorId: string, timestamp: number): Promise<void> {
    const session = this.getSession();
    try {
      await session.run(
        `MATCH (u:User {actorId: $authorActorId})
         CREATE (p:Post {
           postId: $postId,
           timestamp: $timestamp,
           likesCount: 0
         })
         CREATE (u)-[:AUTHORED]->(p)`,
        { postId, authorActorId, timestamp }
      );
    } finally {
      await session.close();
    }
  }

  async createFollowRelationship(followerActorId: string, followedActorId: string): Promise<void> {
    const session = this.getSession();
    try {
      await session.run(
        `MATCH (follower:User {actorId: $followerActorId})
         MATCH (followed:User {actorId: $followedActorId})
         MERGE (follower)-[:FOLLOWS]->(followed)`,
        { followerActorId, followedActorId }
      );
    } finally {
      await session.close();
    }
  }

  async removeFollowRelationship(followerActorId: string, followedActorId: string): Promise<void> {
    const session = this.getSession();
    try {
      await session.run(
        `MATCH (follower:User {actorId: $followerActorId})-[r:FOLLOWS]->(followed:User {actorId: $followedActorId})
         DELETE r`,
        { followerActorId, followedActorId }
      );
    } finally {
      await session.close();
    }
  }

  async likePost(userActorId: string, postId: string): Promise<void> {
    const session = this.getSession();
    try {
      const result = await session.run(
        `MATCH (u:User {actorId: $userActorId})
         MATCH (p:Post {postId: $postId})
         MERGE (u)-[r:LIKED]->(p)
         ON CREATE SET p.likesCount = COALESCE(p.likesCount, 0) + 1
         RETURN p`,
        { userActorId, postId }
      );
      
      if (result.records.length === 0) {
        logger.warn('User or Post not found for like', { userActorId, postId });
      }
    } catch (error) {
      logger.error('Error creating like relationship', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    } finally {
      await session.close();
    }
  }

  async unlikePost(userActorId: string, postId: string): Promise<void> {
    const session = this.getSession();
    try {
      const result = await session.run(
        `MATCH (u:User {actorId: $userActorId})-[r:LIKED]->(p:Post {postId: $postId})
         DELETE r
         SET p.likesCount = COALESCE(p.likesCount - 1, 0)
         RETURN p`,
        { userActorId, postId }
      );

      if (result.records.length === 0) {
        logger.warn('Like relationship not found', { userActorId, postId });
      }
    } catch (error) {
      logger.error('Error removing like relationship', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    } finally {
      await session.close();
    }
  }

  async getPostsLikedByFollowed(userId: string, limit: number = 10): Promise<string[]> {
    const session = this.getSession();
    try {
      const result = await session.run(
        `MATCH (u:User {actorId: $userId})-[:FOLLOWS]->(followed:User)-[:LIKED]->(p:Post)
         WHERE NOT (u)-[:LIKED]->(p)
         RETURN p.postId AS postId
         ORDER BY p.timestamp DESC
         LIMIT toInteger($limit)`,
        { userId, limit }
      );
      return result.records.map(record => record.get('postId'));
    } finally {
      await session.close();
    }
  }

  async getSecondDegreeUserPosts(userId: string, limit: number = 10): Promise<string[]> {
    const session = this.getSession();
    try {
      const result = await session.run(
        `MATCH (u:User {actorId: $userId})-[:FOLLOWS]->(:User)-[:FOLLOWS]->(author:User)-[:AUTHORED]->(p:Post)
         WHERE NOT (u)-[:FOLLOWS]->(author)
         AND NOT author.actorId = $userId
         RETURN DISTINCT p.postId AS postId, p.timestamp AS timestamp
         ORDER BY timestamp DESC
         LIMIT toInteger($limit)`,
        { userId, limit }
      );
      return result.records.map(record => record.get('postId'));
    } finally {
      await session.close();
    }
  }

  async getTrendingPosts(hours: number = 24, limit: number = 10): Promise<string[]> {
    const session = this.getSession();
    try {
      const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
      const result = await session.run(
        `MATCH (p:Post)
         WHERE p.timestamp >= $cutoffTime
         RETURN p.postId AS postId
         ORDER BY p.likesCount DESC, p.timestamp DESC
         LIMIT toInteger($limit)`,
        { cutoffTime, limit }
      );
      return result.records.map(record => record.get('postId'));
    } finally {
      await session.close();
    }
  }

  async close(): Promise<void> {
    await this.driver.close();
  }
} 