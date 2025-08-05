import dotenv from 'dotenv';
import { Neo4jService } from '../services/neo4jService.ts';
import { User } from '../models/user.ts';
import { Post } from '../models/post.ts';
import { mongoConnect } from '../config/mongoose.js';
import { FollowModel } from '../models/follows.ts';

async function testRecommendations() {
  dotenv.config();
  console.log('Testing Neo4j recommendations...');

  // Connect to MongoDB
  await mongoConnect();
  console.log('Connected to MongoDB');

  const neo4jService = new Neo4jService();

  try {
    // Get a test user with the most follows (more likely to have interesting recommendations)
    const testUser = await User.aggregate([
      {
        $lookup: {
          from: 'follows',
          localField: '_id',
          foreignField: 'actor.ref',
          as: 'following'
        }
      },
      {
        $addFields: {
          followCount: { $size: '$following' }
        }
      },
      {
        $sort: { followCount: -1 }
      },
      {
        $limit: 1
      }
    ]);

    if (!testUser || testUser.length === 0) {
      console.error('No test user found');
      return;
    }

    const user = testUser[0];
    console.log(`\nTesting recommendations for user: ${user.username} (${user.actorId})`);
    
    // Get user's follows
    const follows = await FollowModel.find({ 'actor.ref': user._id }).populate('object.ref');
    const followedUsers = follows.map(f => (f.object.ref as any)?.username || f.object.id).filter(Boolean);
    console.log(`This user follows ${followedUsers.length} users: ${followedUsers.join(', ')}`);

    // Test posts liked by followed users
    console.log('\n1. Posts liked by users you follow:');
    const likedByFollowedPosts = await neo4jService.getPostsLikedByFollowed(user.actorId);
    console.log(`Found ${likedByFollowedPosts.length} posts`);
    
    if (likedByFollowedPosts.length > 0) {
      // Fetch full post details from MongoDB
      const likedPosts = await Post.find({ _id: { $in: likedByFollowedPosts } })
        .populate('author')
        .populate('likes');
      
      for (const post of likedPosts) {
        const likedBy = (post.likes as any[])
          .map(u => u.username)
          .filter(name => followedUsers.includes(name));
        console.log(`- Post by ${(post.author as any).username} (${post._id})`);
        console.log(`  Liked by followed users: ${likedBy.join(', ')}`);
      }
    } else {
      console.log('No posts found - this might mean none of the followed users have liked any posts');
    }

    // Test second-degree user posts
    console.log('\n2. Posts from users who follow the same people:');
    const secondDegreePostIds = await neo4jService.getSecondDegreeUserPosts(user.actorId);
    console.log(`Found ${secondDegreePostIds.length} posts`);
    
    if (secondDegreePostIds.length > 0) {
      const secondDegreePosts = await Post.find({ _id: { $in: secondDegreePostIds } })
        .populate('author')
        .sort({ createdAt: -1 });
      
      for (const post of secondDegreePosts) {
        const author = post.author as any;
        console.log(`- Post by ${author.username} (${post._id})`);
        console.log(`  Created at: ${new Date(post.createdAt).toLocaleString()}`);
      }
    } else {
      console.log('No posts found - this might mean no second-degree connections or they haven\'t posted');
    }

    // Test trending posts
    console.log('\n3. Trending posts (most liked in past 24 hours):');
    const trendingPostIds = await neo4jService.getTrendingPosts();
    console.log(`Found ${trendingPostIds.length} posts`);
    
    if (trendingPostIds.length > 0) {
      const trendingPosts = await Post.find({ _id: { $in: trendingPostIds } })
        .populate('author')
        .populate('likes')
        .sort({ likesCount: -1, createdAt: -1 });
      
      for (const post of trendingPosts) {
        console.log(`- Post by ${(post.author as any).username} (${post._id})`);
        console.log(`  ${post.likesCount} likes, created ${new Date(post.createdAt).toLocaleString()}`);
        const likers = (post.likes as any[]).map(u => u.username).join(', ');
        console.log(`  Liked by: ${likers}`);
      }
    } else {
      console.log('No trending posts found in the last 24 hours');
    }

  } catch (error) {
    if (error instanceof Error) {
      console.error('Error testing recommendations:', error.message);
    } else {
      console.error('Error testing recommendations:', error);
    }
  } finally {
    await neo4jService.close();
    await (await import('mongoose')).disconnect();
  }
}

// Run the test
testRecommendations(); 