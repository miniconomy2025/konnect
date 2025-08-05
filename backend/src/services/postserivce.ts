import mongoose from 'mongoose';
import { S3Service } from './s3Service.js';
import { ActivityService } from './activityservice.js';
import { RedisService } from './redisService.js';
import { Post, type IPost } from '../models/post.js';
import { User, type IUser} from '../models/user.js';
import type { CreatePostData } from '../types/post.js';

export class PostService {
  private s3Service = new S3Service();
  private activityService = new ActivityService();
  private redisService = new RedisService();

  private async transformCachedPost(cached: Record<string, any>): Promise<IPost> {
    return {
      _id: new mongoose.Types.ObjectId(cached._id),
      author: typeof cached.author === 'string' && cached.author.startsWith('{')
        ? JSON.parse(cached.author)
        : new mongoose.Types.ObjectId(cached.author),
      caption: cached.caption,
      mediaUrl: cached.mediaUrl,
      mediaType: cached.mediaType,
      activityId: cached.activityId,
      likes: JSON.parse(cached.likes).map((id: string) => new mongoose.Types.ObjectId(id)),
      likesCount: parseInt(cached.likesCount),
      createdAt: new Date(cached.createdAt),
      updatedAt: new Date(cached.updatedAt)
    } as IPost;
  }

  private postToCache(post: IPost): Record<string, any> {
    // Handle both Mongoose documents and plain objects
    const postObj = post.toObject ? post.toObject() : post;
    
    return {
      _id: postObj._id.toString(),
      author: postObj.author instanceof mongoose.Types.ObjectId 
        ? postObj.author.toString()
        : JSON.stringify(postObj.author),
      caption: postObj.caption,
      mediaUrl: postObj.mediaUrl,
      mediaType: postObj.mediaType,
      activityId: postObj.activityId,
      likes: JSON.stringify(postObj.likes.map((id: mongoose.Types.ObjectId) => id.toString())),
      likesCount: postObj.likesCount.toString(),
      createdAt: postObj.createdAt.toISOString(),
      updatedAt: postObj.updatedAt.toISOString()
    };
  }

  async createPost(postData: CreatePostData, federationContext?: any): Promise<IPost> {
    const domain = process.env.DOMAIN || 'localhost:8000';
    const protocol = domain.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${domain}`;
    
    const postId = new mongoose.Types.ObjectId();
    const activityId = `${baseUrl}/posts/${postId}`;

    const post = new Post({
      _id: postId,
      author: postData.authorId,
      caption: postData.caption,
      mediaUrl: postData.mediaUrl,
      mediaType: postData.mediaType,
      activityId,
      likes: [],
      likesCount: 0,
    });

    const savedPost = await post.save();
    
    const author = await User.findById(postData.authorId);
    if (author && federationContext) {
      await this.activityService.queueCreateActivity(savedPost, author, federationContext);
    }

    const populatedPost = await savedPost.populate('author', 'username displayName avatarUrl');
    
    // Cache the new post
    await this.redisService.cachePost(postId.toString(), this.postToCache(populatedPost));

    // Get current feed posts for the user
    const currentFeedPosts = await this.redisService.getFeedPosts(postData.authorId);
    
    // Add new post to the beginning of the feed
    await this.redisService.cacheFeedPosts(
      postData.authorId,
      [postId.toString(), ...currentFeedPosts]
    );

    // Also update public feed cache if it exists
    const currentPublicFeed = await this.redisService.getFeedPosts('public');
    if (currentPublicFeed.length > 0) {
      await this.redisService.cacheFeedPosts(
        'public',
        [postId.toString(), ...currentPublicFeed]
      );
    }

    return populatedPost;
  }

  async getPostById(id: string): Promise<IPost | null> {
    // Try to get from cache first
    const cached = await this.redisService.getCachedPost(id);
    if (cached) {
      return this.transformCachedPost(cached);
    }

    // If not in cache, get from DB and cache it
    const post = await Post.findById(id).populate('author', 'username displayName avatarUrl');
    if (post) {
      await this.redisService.cachePost(id, this.postToCache(post));
    }
    
    return post;
  }

  async getPostByActivityId(activityId: string): Promise<IPost | null> {
    return await Post.findOne({ activityId }).populate('author', 'username displayName avatarUrl');
  }

  async getUserPosts(userId: string, page = 1, limit = 20): Promise<IPost[]> {
    const skip = (page - 1) * limit;
    
    // Try to get from cache first
    const cachedPostIds = await this.redisService.getFeedPosts(userId, page, limit);
    if (cachedPostIds.length > 0) {
      const posts = await Promise.all(
        cachedPostIds.map(async (id: string) => {
          const cached = await this.redisService.getCachedPost(id);
          if (cached) {
            return this.transformCachedPost(cached);
          }
          return null;
        })
      );

      // If we got all posts from cache, return them
      if (posts.every(post => post !== null)) {
        return posts.filter((post): post is IPost => post !== null);
      }
    }

    // If not in cache or incomplete, fetch from DB
    const posts = await Post.find({ author: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username displayName avatarUrl');

    // Cache the results
    const postsToCache = posts as (IPost & { _id: mongoose.Types.ObjectId })[];
    await Promise.all([
      this.redisService.cacheFeedPosts(
        userId,
        postsToCache.map(p => p._id.toString())
      ),
      ...postsToCache.map(post => 
        this.redisService.cachePost(post._id.toString(), this.postToCache(post))
      )
    ]);

    return posts;
  }

  async getFeedPosts(userId: string, page = 1, limit = 20): Promise<IPost[]> {
    if (!userId) {
      return this.getPublicFeedPosts(page, limit);
    }

    const skip = (page - 1) * limit;
    
    // Try to get from cache first
    const cachedPostIds = await this.redisService.getFeedPosts(`feed:${userId}`, page, limit);
    if (cachedPostIds.length > 0) {
      const posts = await Promise.all(
        cachedPostIds.map(async (id: string) => {
          const cached = await this.redisService.getCachedPost(id);
          if (cached) {
            return this.transformCachedPost(cached);
          }
          return null;
        })
      );

      // If we got all posts from cache, return them
      if (posts.every(post => post !== null)) {
        return posts.filter((post): post is IPost => post !== null);
      }
    }

    // If not in cache or incomplete, fetch from DB
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username displayName avatarUrl');

    // Cache the results
    const postsToCache = posts as (IPost & { _id: mongoose.Types.ObjectId })[];
    await Promise.all([
      this.redisService.cacheFeedPosts(
        `feed:${userId}`,
        postsToCache.map(p => p._id.toString())
      ),
      ...postsToCache.map(post => 
        this.redisService.cachePost(post._id.toString(), this.postToCache(post))
      )
    ]);

    return posts;
  }

  async getPublicFeedPosts(page = 1, limit = 20): Promise<IPost[]> {
    const skip = (page - 1) * limit;
    
    // Try to get from cache first
    const cachedPostIds = await this.redisService.getFeedPosts('public', page, limit);
    if (cachedPostIds.length > 0) {
      const posts = await Promise.all(
        cachedPostIds.map(async (id: string) => {
          const cached = await this.redisService.getCachedPost(id);
          if (cached) {
            return this.transformCachedPost(cached);
          }
          return null;
        })
      );

      // If we got all posts from cache, return them
      if (posts.every(post => post !== null)) {
        return posts.filter((post): post is IPost => post !== null);
      }
    }

    // If not in cache or incomplete, fetch from DB
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username displayName avatarUrl');

    // Cache the results
    const postsToCache = posts as (IPost & { _id: mongoose.Types.ObjectId })[];
    await Promise.all([
      this.redisService.cacheFeedPosts(
        'public',
        postsToCache.map(p => p._id.toString())
      ),
      ...postsToCache.map(post => 
        this.redisService.cachePost(post._id.toString(), this.postToCache(post))
      )
    ]);

    return posts;
  }

  async likePost(postId: string, userId: string): Promise<{ success: boolean; likesCount: number; isLiked: boolean }> {
    const post = await Post.findById(postId).populate('author', 'username displayName avatarUrl');
    if (!post) {
      throw new Error('Post not found');
    }

    const userIdObj = new mongoose.Types.ObjectId(userId);
    const likeIndex = post.likes.indexOf(userIdObj);
    let isLiked = false;

    if (likeIndex === -1) {
      post.likes.push(userIdObj);
      post.likesCount++;
      isLiked = true;
      // Increment like count in Redis
      await this.redisService.incrementLikes(postId);
    } else {
      post.likes.splice(likeIndex, 1);
      post.likesCount--;
      // Decrement like count in Redis
      await this.redisService.decrementLikes(postId);
    }

    await post.save();
    
    const user = await User.findById(userId);
    if (user) {
      await this.activityService.publishLikeActivity(post, user, isLiked);
    }

    // Update post cache with new like status
    const postObj = post.toObject();
    const postToCache: Partial<IPost> = {
      _id: post._id as mongoose.Types.ObjectId,
      author: postObj.author,
      caption: postObj.caption,
      mediaUrl: postObj.mediaUrl,
      mediaType: postObj.mediaType,
      activityId: postObj.activityId,
      likes: postObj.likes,
      likesCount: postObj.likesCount,
      createdAt: postObj.createdAt,
      updatedAt: postObj.updatedAt,
      isLiked
    };
    await this.redisService.cachePost(postId, this.postToCache(postToCache as IPost));

    // Update the post in all relevant feed caches
    const feedCaches = [
      'public', // Public feed
      postObj.author.toString(), // Author's feed
    ];

    // Update the post in each feed cache if it exists
    await Promise.all(
      feedCaches.map(async (feedId) => {
        const feedPosts = await this.redisService.getFeedPosts(feedId);
        if (feedPosts.includes(postId)) {
          // If the post is in this feed cache, update the cache with the same post order
          await this.redisService.cacheFeedPosts(
            feedId,
            feedPosts
          );
        }
      })
    );

    return {
      success: true,
      likesCount: post.likesCount,
      isLiked
    };
  }

  private async updatePostInFeedCaches(post: IPost & { _id: mongoose.Types.ObjectId }): Promise<void> {
    // Get all feed caches that might contain this post
    const feedCaches = [
      'public', // Public feed
      post.author.toString(), // Author's feed
    ];

    // Update the post in each feed cache if it exists
    await Promise.all(
      feedCaches.map(async (feedId) => {
        const feedPosts = await this.redisService.getFeedPosts(feedId);
        if (feedPosts.includes(post._id.toString())) {
          // If the post is in this feed cache, update the cache with the same post order
          await this.redisService.cacheFeedPosts(
            feedId,
            feedPosts
          );
        }
      })
    );
  }

  async deletePost(postId: string, userId: string, federationContext?: any): Promise<boolean> {
    const post = await Post.findOne({ _id: postId, author: userId });
    if (!post) {
      return false;
    }

    const author = await User.findById(userId);

    if (author && federationContext) {
      await this.activityService.publishDeleteActivity(post, author, federationContext);
    }

    try {
      await this.s3Service.deleteImage(post.mediaUrl);
    } catch (error) {
      console.error('Failed to delete image from S3:', error);
    }

    await Post.findByIdAndDelete(postId);
    return true;
  }

  async updatePost(postId: string, caption: string, userId: string, federationContext?: any): Promise<IPost | null> {
    const post = await Post.findOne({ _id: postId, author: userId });
    if (!post) {
      return null;
    }

    post.caption = caption;
    post.updatedAt = new Date();
    
    const updatedPost = await post.save();

    const author = await User.findById(userId);

    if (author && federationContext) {
      await this.activityService.publishPostUpdateActivity(updatedPost, author, federationContext);
    }

    await this.redisService.invalidatePost(postId);

    const populatedPost = await Post.findById(postId).populate('author', 'username displayName avatarUrl');
    return populatedPost;
  }

  async uploadImage(file: Buffer, mimeType: string, userId: string): Promise<string> {
    if (!this.s3Service.validateImageType(mimeType)) {
      throw new Error('Invalid image type. Only JPEG, PNG, and WebP are allowed.');
    }

    if (!this.s3Service.validateImageSize(file.length)) {
      throw new Error('Image size too large. Maximum size is 10MB.');
    }

    return await this.s3Service.uploadImage(file, mimeType, userId);
  }

  async getPresignedUploadUrl(mimeType: string, userId: string): Promise<{ uploadUrl: string; imageUrl: string }> {
    if (!this.s3Service.validateImageType(mimeType)) {
      throw new Error('Invalid image type. Only JPEG, PNG, and WebP are allowed.');
    }

    return await this.s3Service.getPresignedUploadUrl(mimeType, userId);
  }
}