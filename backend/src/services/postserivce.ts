import mongoose from 'mongoose';
import { S3Service } from './s3Service.js';
import { ActivityService } from './activityservice.js';
import { Post, type IPost } from '../models/post.js';
import { User, type IUser} from '../models/user.js';
import type { CreatePostData } from '../types/post.js';

export class PostService {
  private s3Service = new S3Service();
  private activityService = new ActivityService();

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

    return await savedPost.populate('author', 'username displayName avatarUrl');
  }

  async getPostById(id: string): Promise<IPost | null> {
    return await Post.findById(id).populate('author', 'username displayName avatarUrl');
  }

  async getPostByActivityId(activityId: string): Promise<IPost | null> {
    return await Post.findOne({ activityId }).populate('author', 'username displayName avatarUrl');
  }

  async getUserPosts(userId: string, page = 1, limit = 20): Promise<IPost[]> {
    const skip = (page - 1) * limit;
    
    return await Post.find({ author: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username displayName avatarUrl');
  }

  async getFeedPosts(userId: string, page = 1, limit = 20): Promise<IPost[]> {
    if (!userId) {
      return this.getPublicFeedPosts(page, limit);
    }

    const skip = (page - 1) * limit;
    
    return await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username displayName avatarUrl');
  }

  async getPublicFeedPosts(page = 1, limit = 20): Promise<IPost[]> {
    const skip = (page - 1) * limit;
    
    return await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username displayName avatarUrl');
  }

  async likePost(postId: string, userId: string): Promise<{ success: boolean; likesCount: number; isLiked: boolean }> {
    const post = await Post.findById(postId);
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
    } else {
      post.likes.splice(likeIndex, 1);
      post.likesCount--;
    }

    await post.save();
    
    const user = await User.findById(userId);
    if (user) {
      await this.activityService.publishLikeActivity(post, user, isLiked);
    }

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