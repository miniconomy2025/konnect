import type { IPost } from '../models/post.js';
import type { UnifiedPostResponse } from '../types/unifiedPost.js';
import { Types } from 'mongoose';

export class PostNormalizationService {
  
  private static extractAuthorInfo(post: IPost): any {
    if (post.author instanceof Types.ObjectId) {
      throw new Error('Post author must be populated for normalization');
    }
    return post.author;
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
    return (await this.localPostsToUnifiedWithLikes([localPost], currentUserId))[0];
  }

  static async externalPostToUnifiedWithLikes(externalPost: any, currentUserId?: string): Promise<UnifiedPostResponse> {
    return (await this.externalPostsToUnifiedWithLikes([externalPost], currentUserId))[0];
  }

  static async localPostsToUnifiedWithLikes(localPosts: IPost[], currentUserId?: string): Promise<UnifiedPostResponse[]> {
    if (localPosts.length === 0) return [];

    const { Like } = await import('../models/like.ts');
    const { User } = await import('../models/user.ts');
    
    let userLikeData: Map<string, boolean> = new Map();
    
    if (currentUserId) {
      const userObjectId = new Types.ObjectId(currentUserId);
      const user = await User.findById(currentUserId);
      
      if (user) {
        const postActivityIds = localPosts.map(post => post.activityId);
        
        const [localLikes, federatedLikes] = await Promise.all([
          this.checkLocalLikes(localPosts, userObjectId),
          this.checkFederatedLikes(postActivityIds, user.actorId)
        ]);
        
        localLikes.forEach((isLiked, postId) => {
          userLikeData.set(postId, isLiked);
        });
        
        federatedLikes.forEach((isLiked, activityId) => {
          const post = localPosts.find(p => p.activityId === activityId);
          if (post && !userLikeData.get(post.id)) {
            userLikeData.set(post.id, isLiked);
          }
        });
      }
    }

    return localPosts.map(post => {
      const author = this.extractAuthorInfo(post);
      const isLiked = userLikeData.get(post.id) || false;
      
      return {
        id: post.id,
        type: 'local' as const,
        author: {
          id: author._id.toString(),
          username: author.username,
          domain: author.domain,
          displayName: author.displayName,
          avatarUrl: author.avatarUrl,
          isLocal: author.isLocal
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

    const { Like } = await import('../models/like.ts');
    const { User } = await import('../models/user.ts');
    const { UserService } = await import('../services/userService.ts');
    const userService = new UserService();

    const activityIds = externalPosts.map(post => post.objectId + '/activity');
    const federatedLikesCount = await this.batchCountFederatedLikes(activityIds);
    
    let userLikeData: Map<string, boolean> = new Map();
    
    if (currentUserId) {
      const user = await User.findById(currentUserId);
      if (user) {
        const userFederatedLikes = await Like.find({
          'actor.id': user.actorId,
          'object.id': { $in: activityIds }
        }).lean();
        
        userFederatedLikes.forEach(like => {
          userLikeData.set(like.object.id, true);
        });
      }
    }

    const authorActorIds = [...new Set(externalPosts.map(post => post.actorId))];
    const authorsMap = await this.batchGetAuthors(authorActorIds, userService);
    
    return Promise.all(externalPosts.map(async externalPost => {
      const mediaAttachment = externalPost.attachments.find(att => 
        att.type === 'image' || att.type === 'video'
      );
      
      const author = authorsMap.get(externalPost.actorId);
      if (!author) {
        throw new Error(`Author not found for post ${externalPost.activityId}`);
      }
      
      const activityId = externalPost.objectId + '/activity';
      const isLiked = userLikeData.get(activityId) || false;
      const likesCount = federatedLikesCount.get(activityId) || 0;
      
      return {
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
        isReply: externalPost.isReply,
      };
    }));
  }

  private static async checkLocalLikes(posts: IPost[], userObjectId: Types.ObjectId): Promise<Map<string, boolean>> {
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

  private static async batchGetAuthors(actorIds: string[], userService: any): Promise<Map<string, any>> {
    const authors = await Promise.all(
      actorIds.map(async actorId => {
        const author = await userService.findByActorId(actorId);
        return { actorId, author };
      })
    );
    
    const authorMap = new Map();
    authors.forEach(({ actorId, author }) => {
      if (author) {
        authorMap.set(actorId, author);
      }
    });
    
    return authorMap;
  }
}