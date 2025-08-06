import type { IPost } from '../models/post.js';
import type { IUser } from '../models/user.js';
import type { UnifiedPostResponse } from '../types/unifiedPost.js';
import { Types } from 'mongoose';

interface PopulatedPost extends Omit<IPost, 'author'> {
  author: IUser;
}

interface LikeCheckResult {
  userLikes: Map<string, boolean>;
  likeCounts: Map<string, number>;
}

export class PostNormalizationService {
  
  private static isValidPopulatedPost(post: IPost): post is PopulatedPost {
    return !(post.author instanceof Types.ObjectId);
  }

  private static getMediaType(mimeType: string): 'image' | 'video' | null {
    if (!mimeType) return null;
    
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    
    return null;
  }

  private static normalizeMediaType(type: string): 'image' | 'video' | null {
    if (type === 'image') return 'image';
    if (type === 'video') return 'video';
    return null;
  }

  private static cleanTextContent(text: string): string {
    if (!text) return '';
    
    return text
      .replace(/\s+/g, ' ')  
      .trim()
      .substring(0, 2200);   
  }

  private static buildLocalPostUrl(postId: string): string {
    const domain = process.env.DOMAIN || 'localhost:8000';
    const protocol = domain.includes('localhost') ? 'http' : 'https';
    return `${protocol}://${domain}/posts/${postId}`;
  }

  static filterByMediaType(
    posts: UnifiedPostResponse[], 
    includeTextOnly = false
  ): UnifiedPostResponse[] {
    if (includeTextOnly) {
      return posts;
    }
    
    return posts.filter(post => post.content.hasMedia);
  }

  static async localPostToUnifiedWithLikes(localPost: IPost, currentUserId?: string): Promise<UnifiedPostResponse> {
    const results = await this.localPostsToUnifiedWithLikes([localPost], currentUserId);
    if (results.length === 0) {
      throw new Error('Post author must be populated for normalization');
    }
    return results[0];
  }

  static async externalPostToUnifiedWithLikes(externalPost: any, currentUserId?: string): Promise<UnifiedPostResponse> {
    const results = await this.externalPostsToUnifiedWithLikes([externalPost], currentUserId);
    if (results.length === 0) {
      throw new Error(`Author not found for post ${externalPost.activityId}`);
    }
    return results[0];
  }

  static async localPostsToUnifiedWithLikes(localPosts: IPost[], currentUserId?: string): Promise<UnifiedPostResponse[]> {
    if (localPosts.length === 0) return [];

    const validPosts = localPosts.filter(this.isValidPopulatedPost);
    if (validPosts.length !== localPosts.length) {
      throw new Error('Post author must be populated for normalization');
    }

    const likeResult = await this.checkLocalPostLikes(validPosts, currentUserId);
    
    return validPosts.map(post => {
      const isLiked = likeResult.userLikes.get(post.id) || false;
      console.log(post)
      return {
        id: post.id,
        type: 'local' as const,
        author: {
          id: post.author._id.toString(),
          username: post.author.username,
          domain: post.author.domain,
          displayName: post.author.displayName,
          avatarUrl: post.author.avatarUrl,
          isLocal: post.author.isLocal
        },
        content: {
          text: post.caption,
          hasMedia: !!post.mediaUrl,
          mediaType: this.getMediaType(post.mediaType)
        },
        media: post.mediaUrl ? {
          type: this.getMediaType(post.mediaType)!,
          url: post.mediaUrl,
          altText: undefined 
        } : undefined,
        engagement: {
          likesCount: post.likesCount,
          isLiked: isLiked,
          canInteract: true
        },
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        url: this.buildLocalPostUrl(post.id),
        isReply: false,
      };
    });
  }

  static async externalPostsToUnifiedWithLikes(externalPosts: any[], currentUserId?: string): Promise<UnifiedPostResponse[]> {
    if (externalPosts.length === 0) return [];

    const uniqueAuthorIds = [...new Set(externalPosts.map(post => post.actorId))];
    const authorsMap = await this.batchGetAuthors(uniqueAuthorIds);
    
    const activityIds = externalPosts.map(post => post.objectId + '/activity');
    const likeResult = await this.checkExternalPostLikes(activityIds, currentUserId);
    
    const results: UnifiedPostResponse[] = [];
    
    for (const externalPost of externalPosts) {
      const author = authorsMap.get(externalPost.actorId);
      if (!author) {
        continue;
      }
      
      const mediaAttachment = externalPost.attachments?.find((att: any) => 
        att.type === 'image' || att.type === 'video'
      );
      
      const activityId = externalPost.objectId + '/activity';
      const isLiked = likeResult.userLikes.get(activityId) || false;
      const likesCount = likeResult.likeCounts.get(activityId) || 0;
      
      results.push({
        id: externalPost.activityId,
        type: 'external' as const,
        author: {
          id: author.actorId,
          username: author.username,
          domain: author.domain,
          displayName: author.displayName,
          avatarUrl: author.avatarUrl,
          isLocal: false
        },
        content: {
          text: this.cleanTextContent(externalPost.contentText),
          hasMedia: mediaAttachment !== undefined,
          mediaType: mediaAttachment ? this.normalizeMediaType(mediaAttachment.type) : null
        },
        media: mediaAttachment ? {
          type: this.normalizeMediaType(mediaAttachment.type)!,
          url: mediaAttachment.url,
          width: mediaAttachment.width,
          height: mediaAttachment.height,
          altText: mediaAttachment.description
        } : undefined,
        engagement: {
          likesCount: likesCount, 
          isLiked: isLiked, 
          canInteract: true 
        },
        createdAt: externalPost.published,
        updatedAt: externalPost.updated,
        url: externalPost.url,
        isReply: externalPost.isReply || false,
      });
    }
    
    return results;
  }

  private static async checkLocalPostLikes(posts: PopulatedPost[], currentUserId?: string): Promise<LikeCheckResult> {
    const userLikes = new Map<string, boolean>();
    const likeCounts = new Map<string, number>();
    
    if (!currentUserId) {
      return { userLikes, likeCounts };
    }

    try {
      const { User } = await import('../models/user.ts');
      
      const [userObjectId, user] = await Promise.all([
        Promise.resolve(new Types.ObjectId(currentUserId)),
        User.findById(currentUserId)
      ]);
      
      if (!user) {
        return { userLikes, likeCounts };
      }

      const postActivityIds = posts.map(post => post.activityId);
      
      const [localLikes, federatedLikes] = await Promise.all([
        Promise.resolve(this.checkLocalLikesSync(posts, userObjectId)),
        this.checkFederatedLikes(postActivityIds, user.actorId)
      ]);
      
      localLikes.forEach((isLiked, postId) => {
        userLikes.set(postId, isLiked);
      });
      
      federatedLikes.forEach((isLiked, activityId) => {
        const post = posts.find(p => p.activityId === activityId);
        if (post && !userLikes.has(post.id)) {
          userLikes.set(post.id, isLiked);
        }
      });
      
    } catch (error) {
      console.warn('Failed to check local post likes:', error);
    }
    
    return { userLikes, likeCounts };
  }

  private static async checkExternalPostLikes(activityIds: string[], currentUserId?: string): Promise<LikeCheckResult> {
    const userLikes = new Map<string, boolean>();
    const likeCounts = new Map<string, number>();
    
    try {
      const [likeCountsResult, userLikesResult] = await Promise.all([
        this.batchCountFederatedLikes(activityIds),
        currentUserId ? this.getUserFederatedLikes(activityIds, currentUserId) : Promise.resolve(new Map())
      ]);
      
      likeCountsResult.forEach((count, activityId) => {
        likeCounts.set(activityId, count);
      });
      
      userLikesResult.forEach((isLiked, activityId) => {
        userLikes.set(activityId, isLiked);
      });
      
    } catch (error) {
      console.warn('Failed to check external post likes:', error);
    }
    
    return { userLikes, likeCounts };
  }

  private static checkLocalLikesSync(posts: PopulatedPost[], userObjectId: Types.ObjectId): Map<string, boolean> {
    const likeMap = new Map<string, boolean>();
    
    for (const post of posts) {
      const isLiked = post.likes.some(likeId => likeId.toString() === userObjectId.toString());
      likeMap.set(post.id, isLiked);
    }
    
    return likeMap;
  }

  private static async checkFederatedLikes(activityIds: string[], userActorId: string): Promise<Map<string, boolean>> {
    const { Like } = await import('../models/like.ts');
    
    const federatedLikes = await Like.find({
      'actor.id': userActorId,
      'object.id': { $in: activityIds }
    }).lean();
    
    const likeMap = new Map<string, boolean>();
    federatedLikes.forEach(like => {
      likeMap.set(like.object.id, true);
    });
    
    return likeMap;
  }

  private static async getUserFederatedLikes(activityIds: string[], currentUserId: string): Promise<Map<string, boolean>> {
    const { Like } = await import('../models/like.ts');
    const { User } = await import('../models/user.ts');
    
    const user = await User.findById(currentUserId);
    if (!user) {
      return new Map();
    }
    
    const userFederatedLikes = await Like.find({
      'actor.id': user.actorId,
      'object.id': { $in: activityIds }
    }).lean();
    
    const likeMap = new Map<string, boolean>();
    userFederatedLikes.forEach(like => {
      likeMap.set(like.object.id, true);
    });
    
    return likeMap;
  }

  private static async batchCountFederatedLikes(activityIds: string[]): Promise<Map<string, number>> {
    const { Like } = await import('../models/like.ts');
    
    const likeCounts = await Like.aggregate([
      { $match: { 'object.id': { $in: activityIds } } },
      { $group: { _id: '$object.id', count: { $sum: 1 } } }
    ]);
    
    const countMap = new Map<string, number>();
    likeCounts.forEach(item => {
      countMap.set(item._id, item.count);
    });
    
    return countMap;
  }

  private static async batchGetAuthors(actorIds: string[]): Promise<Map<string, any>> {
    const { User } = await import('../models/user.ts');
    
    const authors = await User.find({ 
      actorId: { $in: actorIds } 
    }).lean();
    
    const authorMap = new Map();
    authors.forEach(author => {
      authorMap.set(author.actorId, author);
    });
    
    return authorMap;
  }
}