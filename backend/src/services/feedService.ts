import { getLogger } from '@logtape/logtape';
import { InboxActivity } from '../models/inbox.ts';
import { Post, type IPost } from '../models/post.ts';
import { User } from '../models/user.ts';
import { FollowService } from './followService.ts';
import { InboxService } from './inboxService.ts';
import { PostNormalizationService } from './postNormalizationService.ts';
import { UserService } from './userService.ts';
import type { UnifiedPostResponse } from '../types/unifiedPost.ts';

const logger = getLogger("feed");

export class FeedService {
  private userService = new UserService();
  private inboxService = new InboxService();
  private followService = new FollowService(this.userService, this.inboxService);

  async getTimelineFeed(userId: string, page = 1, limit = 20): Promise<{
    posts: UnifiedPostResponse[];
    hasMore: boolean;
    sources: { local: number; federated: number };
  }> {
    if (!userId) {
      return this.getPublicFeed(page, limit);
    }

    const user = await User.findById(userId);
    if (!user) {
      return this.getPublicFeed(page, limit);
    }

    const followingActorIds = await this.followService.getFollowingActorIds(user.actorId);
    followingActorIds.push(user.actorId);

    const [localPosts, externalPosts] = await Promise.all([
      this.getLocalPostsFromFollowing(followingActorIds, page, Math.ceil(limit / 2)),
      this.getExternalPostsFromFollowing(followingActorIds, page, Math.ceil(limit / 2))
    ]);

    const unifiedLocalPosts = PostNormalizationService.localPostsToUnified(localPosts, userId);
    const unifiedExternalPosts = this.convertExternalPostsToUnified(externalPosts);

    const allPosts = [...unifiedLocalPosts, ...unifiedExternalPosts]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    return {
      posts: allPosts,
      hasMore: allPosts.length === limit,
      sources: {
        local: unifiedLocalPosts.length,
        federated: unifiedExternalPosts.length
      }
    };
  }

  async getPublicFeed(page = 1, limit = 20, userId?: string): Promise<{
    posts: UnifiedPostResponse[];
    hasMore: boolean;
    sources: { local: number; federated: number };
  }> {
    const skip = (page - 1) * limit;
    
    const localPosts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username displayName avatarUrl');

    const unifiedPosts = PostNormalizationService.localPostsToUnified(localPosts, userId);

    return {
      posts: unifiedPosts,
      hasMore: localPosts.length === limit,
      sources: {
        local: unifiedPosts.length,
        federated: 0
      }
    };
  }

  private async getLocalPostsFromFollowing(followingActorIds: string[], page: number, limit: number): Promise<IPost[]> {
    const skip = (page - 1) * limit;

    const localFollowingUsers = await User.find({ 
      actorId: { $in: followingActorIds },
      isLocal: true 
    }).distinct('_id');

    return await Post.find({ author: { $in: localFollowingUsers } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username displayName avatarUrl');
  }

  private async getExternalPostsFromFollowing(followingActorIds: string[], page: number, limit: number): Promise<any[]> {
    try {
      const { ExternalPost } = await import('../models/externalPost.js');
      const skip = (page - 1) * limit;

      const externalPosts = await ExternalPost.find({
        actorId: { $in: followingActorIds }
      })
      .sort({ published: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

      return externalPosts;
    } catch (error) {
      logger.error('Error fetching external posts:', {error});
      return [];
    }
  }

  private convertExternalPostsToUnified(externalPosts: any[]): UnifiedPostResponse[] {
    return externalPosts.map(post => {
      try {
        return {
          id: post.objectId,
          type: 'external' as const,
          author: {
            id: post.actorId,
            username: this.extractUsernameFromActorId(post.actorId),
            domain: this.extractDomainFromActorId(post.actorId),
            displayName: this.extractUsernameFromActorId(post.actorId), // We'll enhance this later
            avatarUrl: undefined,
            isLocal: false
          },
          content: {
            text: post.contentText || post.content || '',
            hasMedia: post.attachments && post.attachments.length > 0,
            mediaType: this.getFirstMediaType(post.attachments)
          },
          media: this.getFirstMediaAttachment(post.attachments),
          engagement: {
            likesCount: post.likesCount || 0,
            isLiked: false,
            canInteract: false
          },
          createdAt: post.published,
          updatedAt: post.updated,
          url: post.url,
          isReply: !!post.inReplyTo
        };
      } catch (error) {
        logger.warn('Failed to convert external post to unified format:', { error, postId: post._id });
        return null;
      }
    }).filter(Boolean) as UnifiedPostResponse[];
  }


  private extractUsernameFromActorId(actorId: string): string {
    try {
      const url = new URL(actorId);
      const pathParts = url.pathname.split('/').filter(Boolean);
      return pathParts[pathParts.length - 1] || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  private extractDomainFromActorId(actorId: string): string {
    try {
      const url = new URL(actorId);
      return url.hostname;
    } catch {
      return 'unknown';
    }
  }

  private getFirstMediaType(attachments: any[]): 'image' | 'video' | null {
    if (!attachments || attachments.length === 0) return null;
    
    const firstMedia = attachments.find(att => att.type === 'image' || att.type === 'video');
    return firstMedia ? firstMedia.type : null;
  }

  private getFirstMediaAttachment(attachments: any[]): UnifiedPostResponse['media'] {
    if (!attachments || attachments.length === 0) return undefined;
    
    const firstMedia = attachments.find(att => att.type === 'image' || att.type === 'video');
    if (!firstMedia) return undefined;

    return {
      type: firstMedia.type,
      url: firstMedia.url,
      width: firstMedia.width,
      height: firstMedia.height,
      altText: firstMedia.description
    };
  }
}