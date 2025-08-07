import dotenv from 'dotenv';
import { Neo4jService } from '../services/neo4jService.ts';
import { User } from '../models/user.ts';
import { Post, type IPost } from '../models/post.ts';
import { FollowModel, type IFollowObject } from '../models/follows.ts';
import { mongoConnect } from '../config/mongoose.js';
import type { Types } from 'mongoose';
import type { UriIdentifierWithOptionalReference } from '../types/shared.ts';

interface PopulatedFollow extends Omit<IFollowObject, 'actor' | 'object'> {
  actor: UriIdentifierWithOptionalReference & {
    ref?: { _id: Types.ObjectId; username: string; actorId: string };
  };
  object: UriIdentifierWithOptionalReference & {
    ref?: { _id: Types.ObjectId; username: string; actorId: string };
  };
}

interface PopulatedPost extends Omit<IPost, 'author' | 'likes'> {
  _id: Types.ObjectId;
  author: {
    _id: Types.ObjectId;
    username: string;
    actorId: string;
  };
  likes: Types.ObjectId[];
}

interface PopulatedUser {
  _id: Types.ObjectId;
  username: string;
  actorId: string;
}

async function syncNeo4j() {
  dotenv.config();
  console.log('Starting Neo4j sync...');

  // Connect to MongoDB
  await mongoConnect();
  console.log('Connected to MongoDB');

  const neo4jService = new Neo4jService();
  const session = neo4jService.getSession();

  try {
    // First clear existing data
    console.log('Clearing existing Neo4j data...');
    await session.run('MATCH (n) DETACH DELETE n');
    console.log('Cleared existing data');

    // Sync Users
    console.log('Syncing users...');
    const users = await User.find({}) as PopulatedUser[];
    const userMap = new Map<string, string>(); // Map MongoDB ID to actorId
    
    for (const user of users) {
      try {
        await neo4jService.createOrUpdateUser(
          user.actorId,
          user.username,
          user._id.toString()
        );
        userMap.set(user._id.toString(), user.actorId);
        console.log(`Synced user: ${user.username} (${user.actorId})`);
      } catch (error) {
        console.error(`Failed to sync user ${user.username}:`, error);
      }
    }
    console.log(`Synced ${users.length} users`);

    // Verify users were created
    const userCount = await session.run('MATCH (u:User) RETURN count(u) as count');
    console.log(`Neo4j user count: ${userCount.records[0].get('count')}`);

    // Sync Posts
    console.log('Syncing posts...');
    const posts = await Post.find({}).populate('author') as PopulatedPost[];
    for (const post of posts) {
      try {
        const authorActorId = userMap.get(post.author._id.toString());
        if (!authorActorId) {
          console.error(`Author not found for post ${post._id}, mongoId: ${post.author._id}`);
          continue;
        }

        // First verify the author exists
        const authorExists = await session.run(
          'MATCH (u:User {actorId: $actorId}) RETURN u',
          { actorId: authorActorId }
        );
        
        if (authorExists.records.length === 0) {
          console.error(`Author node not found for post ${post._id}, actorId: ${authorActorId}`);
          continue;
        }

        await neo4jService.createPost(
          post._id.toString(),
          authorActorId,
          post.createdAt.getTime()
        );
        console.log(`Synced post: ${post._id} by ${post.author.username}`);

        // Verify post was created
        const postExists = await session.run(
          'MATCH (p:Post {postId: $postId}) RETURN p',
          { postId: post._id.toString() }
        );
        if (postExists.records.length === 0) {
          console.error(`Post ${post._id} was not created successfully`);
        }
      } catch (error) {
        console.error(`Failed to sync post ${post._id}:`, error);
      }
    }
    console.log(`Synced ${posts.length} posts`);

    // Verify posts were created
    const postCount = await session.run('MATCH (p:Post) RETURN count(p) as count');
    console.log(`Neo4j post count: ${postCount.records[0].get('count')}`);

    // Sync Follows
    console.log('Syncing follows...');
    const follows = await FollowModel.find({}).populate({
      path: 'actor.ref object.ref',
      model: 'User'
    }) as unknown as PopulatedFollow[];

    for (const follow of follows) {
      try {
        // For both local and external users, use their actorId
        const followerActorId = follow.actor.ref?.actorId || follow.actor.id;
        const followedActorId = follow.object.ref?.actorId || follow.object.id;
        
        // Create nodes for external users if needed
        if (!follow.actor.ref) {
          await neo4jService.createOrUpdateUser(
            followerActorId,
            followerActorId.split('/').pop() || 'unknown'
          );
        }
        if (!follow.object.ref) {
          await neo4jService.createOrUpdateUser(
            followedActorId,
            followedActorId.split('/').pop() || 'unknown'
          );
        }

        await neo4jService.createFollowRelationship(followerActorId, followedActorId);
        
        const followerName = follow.actor.ref?.username || followerActorId.split('/').pop() || 'unknown';
        const followedName = follow.object.ref?.username || followedActorId.split('/').pop() || 'unknown';
        console.log(`Synced follow: ${followerName} -> ${followedName}`);
      } catch (error) {
        console.error(`Failed to sync follow:`, error);
      }
    }
    console.log(`Synced ${follows.length} follows`);

    // Verify follows were created
    const followCount = await session.run('MATCH ()-[r:FOLLOWS]->() RETURN count(r) as count');
    console.log(`Neo4j follow count: ${followCount.records[0].get('count')}`);

    // Sync Likes
    console.log('Syncing likes...');
    let totalLikes = 0;
    for (const post of posts) {
      // Populate the likes array with full user objects
      const populatedPost = await Post.findById(post._id).populate('likes');
      if (!populatedPost) continue;

      const likeUsers = populatedPost.likes as unknown as PopulatedUser[];
      for (const likeUser of likeUsers) {
        try {
          // Get the user's actorId from either the map (for local users) or directly (for external users)
          const userActorId = userMap.get(likeUser._id.toString()) || likeUser.actorId;
          if (!userActorId) {
            console.error(`Cannot determine actorId for like user: ${likeUser._id}`);
            continue;
          }

          const postId = post._id.toString();

          try {
            await neo4jService.likePost(userActorId, postId);
            totalLikes++;
            console.log(`Synced like: ${likeUser.username} -> ${postId} (using actorId: ${userActorId})`);
          } catch (error) {
            if (error instanceof Error) {
              console.error(`Failed to create like relationship: ${error.message}`);
            } else {
              console.error(`Failed to create like relationship:`, error);
            }
          }
        } catch (error) {
          if (error instanceof Error) {
            console.error(`Failed to process like: ${error.message}`);
          } else {
            console.error(`Failed to process like:`, error);
          }
        }
      }
    }
    console.log(`Synced ${totalLikes} likes`);

    // Verify likes were created
    const likeCount = await session.run('MATCH ()-[r:LIKED]->() RETURN count(r) as count');
    console.log(`Neo4j like count: ${likeCount.records[0].get('count')}`);

    // Final verification
    console.log('\nFinal Neo4j Graph State:');
    const finalState = await session.run(`
      CALL {
        MATCH (u:User) RETURN count(u) as users
      }
      CALL {
        MATCH (p:Post) RETURN count(p) as posts
      }
      CALL {
        MATCH ()-[r:FOLLOWS]->() RETURN count(r) as follows
      }
      CALL {
        MATCH ()-[r:LIKED]->() RETURN count(r) as likes
      }
      RETURN users, posts, follows, likes
    `);
    const counts = finalState.records[0];
    console.log({
      users: counts.get('users').toNumber(),
      posts: counts.get('posts').toNumber(),
      follows: counts.get('follows').toNumber(),
      likes: counts.get('likes').toNumber()
    });

    console.log('Neo4j sync completed successfully');
  } catch (error) {
    console.error('Failed to sync Neo4j:', error);
    process.exit(1);
  } finally {
    await session.close();
    await neo4jService.close();
    // Disconnect from MongoDB
    await (await import('mongoose')).disconnect();
  }
}

// Run the sync
syncNeo4j();