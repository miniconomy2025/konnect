import { Post, type IPost } from '../models/post.js';
import { User, type IUser } from '../models/user.js';
import { S3Service } from './s3Service.js';
import { ActivityService } from './activityservice.ts';
import type { CreatePostData } from '../types/post.js';
import mongoose from 'mongoose';

export class PostService {
  private s3Service = new S3Service();
  private activityService = new ActivityService();

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
    
    return await Post.find({ author: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username displayName avatarUrl');
  }

  async getFeedPosts(userId: string, page = 1, limit = 20): Promise<IPost[]> {
    const skip = (page - 1) * limit;
    
    // For now, just return all posts. Later you can implement following logic
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

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const isAlreadyLiked = post.likes.includes(userObjectId);

    if (isAlreadyLiked) {
      // Unlike the post
      post.likes = post.likes.filter(id => !id.equals(userObjectId));
      post.likesCount = Math.max(0, post.likesCount - 1);
    } else {
      // Like the post
      post.likes.push(userObjectId);
      post.likesCount += 1;
    }

    await post.save();

    // Publish like/unlike activity
    const user = await User.findById(userId);
    if (user) {
      await this.activityService.publishLikeActivity(post, user, !isAlreadyLiked);
    }

    return {
      success: true,
      likesCount: post.likesCount,
      isLiked: !isAlreadyLiked,
    };
  }

  async deletePost(postId: string, userId: string): Promise<boolean> {
    const post = await Post.findOne({ _id: postId, author: userId });
    if (!post) {
      return false;
    }

    // Get author for activity publishing
    const author = await User.findById(userId);

    // Delete image from S3
    try {
      await this.s3Service.deleteImage(post.mediaUrl);
    } catch (error) {
      console.error('Failed to delete image from S3:', error);
      // Continue with post deletion even if S3 deletion fails
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
}