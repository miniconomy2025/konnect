import type { IPost, IPostPopulated } from '../models/post.js';
import type { ExternalPostResponse } from './externalPostService.js';
import type { UnifiedPostResponse } from '../types/unifiedPost.js';
import { Types } from 'mongoose';

export class PostNormalizationService {
  
  /**
   * Convert local post to unified format
   */
  static localPostToUnified(localPost: IPost, currentUserId?: string): UnifiedPostResponse {
    const author = this.extractAuthorInfo(localPost);
    
    return {
      id: localPost._id.toString(),
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
        isLiked: currentUserId ? this.checkIfLiked(localPost, currentUserId) : false,
        canInteract: true
      },
      createdAt: localPost.createdAt,
      updatedAt: localPost.updatedAt,
      url: this.buildLocalPostUrl(localPost._id.toString()),
      isReply: false,
    };
  }

  /**
   * Convert external post to unified format
   */
  static externalPostToUnified(externalPost: ExternalPostResponse): UnifiedPostResponse {
    const mediaAttachment = externalPost.attachments.find(att => 
      att.type === 'image' || att.type === 'video'
    );
    
    return {
      id: externalPost.id,
      type: 'external',
      author: {
        id: externalPost.author.actorId,
        username: externalPost.author.username,
        domain: externalPost.author.domain,
        displayName: externalPost.author.displayName,
        avatarUrl: externalPost.author.avatarUrl,
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
        likesCount: 0,           
        isLiked: false,          
        canInteract: false       
      },
      createdAt: externalPost.published,
      updatedAt: externalPost.updated,
      url: externalPost.url,
      isReply: externalPost.isReply,
    };
  }

  static localPostsToUnified(localPosts: IPost[], currentUserId?: string): UnifiedPostResponse[] {
    return localPosts.map(post => this.localPostToUnified(post, currentUserId));
  }

  static externalPostsToUnified(externalPosts: ExternalPostResponse[]): UnifiedPostResponse[] {
    return externalPosts.map(post => this.externalPostToUnified(post));
  }

  static mixAndSortPosts(
    localPosts: IPost[], 
    externalPosts: ExternalPostResponse[], 
    currentUserId?: string
  ): UnifiedPostResponse[] {
    const unifiedLocal = this.localPostsToUnified(localPosts, currentUserId);
    const unifiedExternal = this.externalPostsToUnified(externalPosts);
    
    return [...unifiedLocal, ...unifiedExternal]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  private static extractAuthorInfo(post: IPost): any {
    if (post.author instanceof Types.ObjectId) {
      throw new Error('Post author must be populated for normalization');
    }
    return post.author;
  }

  private static checkIfLiked(post: IPost, currentUserId: string): boolean {
    const userObjectId = new Types.ObjectId(currentUserId);
    return post.likes.some(likeId => likeId.toString() === userObjectId.toString());
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

}