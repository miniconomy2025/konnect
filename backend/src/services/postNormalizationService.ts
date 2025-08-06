import type { IPost, IPostPopulated } from '../models/post.js';
import type { ExternalPostResponse } from './externalPostService.js';
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
    const { Like } = await import('../models/like.ts');
    const { User } = await import('../models/user.ts');
    
    let isLiked = false;
    if (currentUserId) {
      const userObjectId = new Types.ObjectId(currentUserId);
      const user = await User.findById(currentUserId);
      
      if (user) {
        isLiked = localPost.likes.some(likeId => likeId.toString() === userObjectId.toString());
        
        if (!isLiked) {
          const federatedLike = await Like.findOne({
            'actor.id': user.actorId,
            'object.id': localPost.activityId
          });
          isLiked = !!federatedLike;
        }
      }
    }
    const author = this.extractAuthorInfo(localPost);
    
    return {
      id: localPost.id,
      type: 'local',
      author: {
        id: author._id.toString(),
        username: author.username,
        domain: author.domain,
        displayName: author.displayName,
        avatarUrl: author.avatarUrl,
        isLocal: author.isLocal
      },
      content: {
        text: localPost.caption,
        hasMedia: !!localPost.mediaUrl,
        mediaType: this.getMediaType(localPost.mediaType)
      },
      media: localPost.mediaUrl ? {
        type: this.getMediaType(localPost.mediaType)!,
        url: localPost.mediaUrl,
        altText: undefined 
      } : undefined,
      engagement: {
        likesCount: localPost.likesCount,
        isLiked: isLiked,
        canInteract: true
      },
      createdAt: localPost.createdAt,
      updatedAt: localPost.updatedAt,
      url: this.buildLocalPostUrl(localPost.id),
      isReply: false,
    };
  }

  static async externalPostToUnifiedWithLikes(externalPost: any, currentUserId?: string): Promise<UnifiedPostResponse> {
    const { Like } = await import('../models/like.ts');
    const { User } = await import('../models/user.ts');
    const {UserService} = await import('../services/userService.ts');
    const userService = new UserService();

    const federatedLikesCount = await Like.countDocuments({ 'object.id': externalPost.activityId });

    
    let isLiked = false;
    if (currentUserId) {
      const user = await User.findById(currentUserId);
      if (user) {
        const federatedLike = await Like.findOne({
          'actor.id': user.actorId,
          'object.id': externalPost.objectId + '/activity'
        });
        isLiked = !!federatedLike;
      }
    }
    
    const mediaAttachment = externalPost.attachments.find(att => 
      att.type === 'image' || att.type === 'video'
    );
    const author = await userService.findByActorId(externalPost.actorId)
    
    return {
      id: externalPost.activityId,
      type: 'external',
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
        likesCount: federatedLikesCount, 
        isLiked: isLiked, 
        canInteract: true 
      },
      createdAt: externalPost.published,
      updatedAt: externalPost.updated,
      url: externalPost.url,
      isReply: externalPost.isReply,
    };
  }

  static async localPostsToUnifiedWithLikes(localPosts: IPost[], currentUserId?: string): Promise<UnifiedPostResponse[]> {
    return Promise.all(localPosts.map(post => this.localPostToUnifiedWithLikes(post, currentUserId)));
  }

  static async externalPostsToUnifiedWithLikes(externalPosts: ExternalPostResponse[], currentUserId?: string): Promise<UnifiedPostResponse[]> {
    return Promise.all(externalPosts.map(post => this.externalPostToUnifiedWithLikes(post, currentUserId)));
  }

}