import mongoose from 'mongoose';
import { S3Service } from './s3Service.js';
import { ActivityService } from './activityservice.js';
import { RedisService } from './redisService.ts';
import { Post, type IPost } from '../models/post.js';
import { User, type IUser} from '../models/user.js';
import type { CreatePostData } from '../types/post.js';

export class PostService {
  private s3Service = new S3Service();
  private activityService = new ActivityService();
  private redisService = RedisService.getInstance();

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

  async likePost(postId: string, userId: string, federationContext?: any): Promise<{ success: boolean; likesCount: number; isLiked: boolean }> {
    const post = await Post.findById(postId).populate('author', 'username displayName avatarUrl');
    if (!post) {
      throw new Error('Post not found');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const userIdObj = new mongoose.Types.ObjectId(userId);
    const likeIndex = post.likes.indexOf(userIdObj);
    let isLiked = false;

    if (likeIndex === -1) {
      post.likes.push(userIdObj);
      post.likesCount++;
      isLiked = true;
      
      const domain = process.env.DOMAIN || 'localhost:8000';
      const protocol = domain.includes('localhost') ? 'http' : 'https';
      const likeActivityId = `${protocol}://${domain}/activities/like-${Date.now()}`;

      const { Like } = await import('../models/like.ts');
      const like = new Like({
        actor: { id: user.actorId, ref: user._id },
        object: { id: post.activityId, ref: post._id },
        activityId: likeActivityId,
        isLocal: true
      });

      await like.save();
      await this.redisService.incrementLikes(postId);
    } else {
      post.likes.splice(likeIndex, 1);
      post.likesCount--;
      
      const { Like } = await import('../models/like.ts');
      await Like.findOneAndDelete({
        'actor.id': user.actorId,
        'object.id': post.activityId
      });

      await this.redisService.decrementLikes(postId);
    }

    await post.save();

    if (federationContext) {
      await this.activityService.publishLikeActivity(post, user, isLiked, federationContext);
    }

    await this.redisService.cachePost(postId, this.postToCache(post));

    return {
      success: true,
      likesCount: post.likesCount,
      isLiked
    };
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
    
  async processIncomingLike(actorId: string, objectId: string, activityId?: string): Promise<void> {
    const { Like } = await import('../models/like.ts');
    
    const existingLike = await Like.findOne({
      'actor.id': actorId,
      'object.id': objectId
    });

    if (existingLike) {
      throw new Error('Like already exists');
    }

    const post = await Post.findOne({ activityId: objectId });
    if (!post) {
      console.warn(`Local post not found for incoming like: ${objectId}`);
      return;
    }

    await this.ensureExternalUserExists(actorId);

    const like = new Like({
      actor: { id: actorId, ref: undefined }, // External user
      object: { id: objectId, ref: post._id }, // Local post
      activityId: activityId || `${objectId}/likes/${Date.now()}`,
      isLocal: false
    });

    await like.save();

    await Post.findByIdAndUpdate(post._id, { $inc: { likesCount: 1 } });
    await this.redisService.incrementLikes(post._id.toString());

    console.log(`Added federated like to post ${post.activityId} from ${actorId}`);
  }

  async processIncomingUnlike(actorId: string, objectId: string): Promise<void> {
    const { Like } = await import('../models/like.ts');
    
    const like = await Like.findOneAndDelete({
      'actor.id': actorId,
      'object.id': objectId
    });

    if (!like || !like.object.ref) {
      console.warn(`Like not found for unlike: ${actorId} -> ${objectId}`);
      return;
    }

    await Post.findByIdAndUpdate(like.object.ref, { $inc: { likesCount: -1 } });
    await this.redisService.decrementLikes(like.object.ref.toString());

    console.log(`Removed federated like from post ${objectId} by ${actorId}`);
  }
  

  private async ensureExternalUserExists(actorId: string): Promise<void> {
    const { UserService } = await import('./userService.ts');
    const userService = new UserService();
    
    const existingUser = await userService.findByActorId(actorId);
    if (existingUser) return;

    const url = new URL(actorId);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const username = pathParts[pathParts.length - 1];
    const domain = url.hostname;
    
    const { SearchService } = await import("./searchService.ts");
    const searchService = new SearchService();
    await searchService.lookupExternalUser(username, domain);
  }

  async likeExternalPost(activityId: string, userId: string, federationContext?: any): Promise<{ success: boolean; isLiked: boolean }> {
      if (!federationContext) {
      throw new Error('Federation context required for external post likes');
    }

    const { Like } = await import('../models/like.ts');
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const existingLike = await Like.findOne({
      'actor.id': user.actorId,
      'object.id': activityId
    });
    
    if (existingLike) {
      await Like.findOneAndDelete({
        'actor.id': user.actorId,
        'object.id': activityId
      });
      
      const mockPost = { activityId } as IPost;
      await this.activityService.publishLikeActivity(mockPost, user, false, federationContext);
      
      return { success: true, isLiked: false };
    } else {
      const domain = process.env.DOMAIN || 'localhost:8000';
      const protocol = domain.includes('localhost') ? 'http' : 'https';
      const likeActivityId = `${protocol}://${domain}/activities/like-${Date.now()}`;

      const like = new Like({
        actor: { id: user.actorId, ref: user._id },
        object: { id: activityId, ref: undefined }, // External post has no local ref
        activityId: likeActivityId,
        isLocal: true
      });

      await like.save();
      
      const mockPost = { activityId } as IPost;
      await this.activityService.publishLikeActivity(mockPost, user, true, federationContext);
      
      return { success: true, isLiked: true };
    }
  }

  async isExternalPostLikedByUser(activityId: string, userActorId: string): Promise<boolean> {
    const { Like } = await import('../models/like.ts');
    const like = await Like.findOne({
      'actor.id': userActorId,
      'object.id': activityId
    });
    return !!like;
  }
}