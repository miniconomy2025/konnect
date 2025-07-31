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

  async createPost(postData: CreatePostData): Promise<IPost> {
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
    
    // Publish to ActivityPub
    const author = await User.findById(postData.authorId);
    if (author) {
      await this.activityService.publishCreateActivity(savedPost, author);
    }

    return savedPost;
  }

  async getPostById(id: string): Promise<IPost | null> {
    return await Post.findById(id).populate('author', 'username displayName avatarUrl');
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

      // If all posts were in cache, return them
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
    await Promise.all([
      this.redisService.cacheFeedPosts(
        userId,
        posts.map((p) => p._id.toString())
      ),
      ...posts.map((post) => 
        this.redisService.cachePost(post._id.toString(), this.postToCache(post))
      )
    ]);

    return posts;
  }

  async getFeedPosts(userId: string, page = 1, limit = 20): Promise<IPost[]> {
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

      // If all posts were in cache, return them
      if (posts.every(post => post !== null)) {
        return posts.filter((post): post is IPost => post !== null);
      }
    }

    // If not in cache or incomplete, fetch from DB
    const following = await this.redisService.getFollowing(userId);
    const posts = await Post.find({
      author: { $in: following.length > 0 ? following : [userId] }
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username displayName avatarUrl');

    // Cache the results
    await Promise.all([
      this.redisService.cacheFeedPosts(
        `feed:${userId}`,
        posts.map((p) => p._id.toString())
      ),
      ...posts.map((post) => 
        this.redisService.cachePost(post._id.toString(), this.postToCache(post))
      )
    ]);

    return posts;
  }

  async likePost(postId: string, userId: string): Promise<{ success: boolean; likesCount: number; isLiked: boolean }> {
    const post = await Post.findById(postId);
    if (!post) {
      return { success: false, likesCount: 0, isLiked: false };
    }

    const userIdObj = new mongoose.Types.ObjectId(userId);
    const likeIndex = post.likes.indexOf(userIdObj);
    let isLiked = false;

    if (likeIndex === -1) {
      post.likes.push(userIdObj);
      post.likesCount++;
      isLiked = true;
      await this.redisService.incrementLikes(postId);
    } else {
      post.likes.splice(likeIndex, 1);
      post.likesCount--;
      await this.redisService.decrementLikes(postId);
    }

    await post.save();
    
    // Update cache
    await this.redisService.cachePost(postId, this.postToCache(post));

    return {
      success: true,
      likesCount: post.likesCount,
      isLiked
    };
  }

  async deletePost(postId: string, userId: string): Promise<boolean> {
    const post = await Post.findOne({ _id: postId, author: userId });
    if (!post) {
      return false;
    }

    const author = await User.findById(userId);

    try {
      await this.s3Service.deleteImage(post.mediaUrl);
    } catch (error) {
      console.error('Failed to delete image from S3:', error);
    }

    // Publish delete activity before deleting the post
    if (author) {
      await this.activityService.publishDeleteActivity(post, author);
    }

    await Post.findByIdAndDelete(postId);
    return true;
  }

  async isPostLikedByUser(postId: string, userId: string): Promise<boolean> {
    const post = await Post.findById(postId);
    if (!post) return false;

    const userObjectId = new mongoose.Types.ObjectId(userId);
    return post.likes.includes(userObjectId);
  }

  async getPostsWithLikeStatus(posts: IPost[], userId?: string): Promise<any[]> {
    if (!userId) {
      return posts.map(post => ({
        ...post.toObject(),
        isLiked: false,
      }));
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    return posts.map(post => ({
      ...post.toObject(),
      isLiked: post.likes.includes(userObjectId),
    }));
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

  private postToCache(post: IPost): Record<string, any> {
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

  private transformCachedPost(cached: Record<string, any>): IPost {
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
}