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

    const [localPosts, federatedActivities] = await Promise.all([
      this.getLocalPostsFromFollowing(followingActorIds, page, Math.ceil(limit / 2)),
      this.getFederatedActivitiesFromFollowing(followingActorIds, page, Math.ceil(limit / 2))
    ]);

    const unifiedLocalPosts = PostNormalizationService.localPostsToUnified(localPosts, userId);
    const unifiedFederatedPosts = await this.convertFederatedActivitiesToUnified(federatedActivities);

    const allPosts = [...unifiedLocalPosts, ...unifiedFederatedPosts]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    return {
      posts: allPosts,
      hasMore: allPosts.length === limit,
      sources: {
        local: unifiedLocalPosts.length,
        federated: unifiedFederatedPosts.length
      }
    };
  }

  async getPublicFeed(page = 1, limit = 20): Promise<{
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

    const unifiedPosts = PostNormalizationService.localPostsToUnified(localPosts);

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

  private async getFederatedActivitiesFromFollowing(followingActorIds: string[], page: number, limit: number): Promise<any[]> {
    const skip = (page - 1) * limit;

    const createActivities = await InboxActivity.find({
      'object.type': 'Create',
      'object.actor.id': { $in: followingActorIds }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate([
      { path: 'object.actor.ref', select: 'username displayName avatarUrl actorId domain isLocal' },
      { path: 'object.object.ref', select: 'username displayName avatarUrl actorId domain isLocal' }
    ])
    .lean();

    return createActivities;
  }

  private async convertFederatedActivitiesToUnified(activities: any[]): Promise<UnifiedPostResponse[]> {
    return activities.map(activity => {
      try {
        const actorData = activity.object.actor.ref || {
          username: this.extractUsernameFromActorId(activity.object.actor.id),
          displayName: this.extractUsernameFromActorId(activity.object.actor.id),
          actorId: activity.object.actor.id,
          domain: this.extractDomainFromActorId(activity.object.actor.id),
          isLocal: false
        };

        const noteData = this.parseActivityPubNote(activity.object);

        return {
          id: activity.object.activityId,
          type: 'external' as const,
          author: {
            id: actorData.actorId,
            username: actorData.username,
            domain: actorData.domain,
            displayName: actorData.displayName,
            avatarUrl: actorData.avatarUrl,
            isLocal: false
          },
          content: {
            text: noteData.content || '',
            hasMedia: noteData.hasMedia,
            mediaType: noteData.mediaType
          },
          media: noteData.media,
          engagement: {
            likesCount: 0,
            isLiked: false,
            canInteract: false
          },
          createdAt: activity.createdAt,
          updatedAt: activity.updatedAt,
          url: noteData.url,
          isReply: false
        };
      } catch (error) {
        logger.warn('Failed to convert federated activity to unified format:', { error });
        return null;
      }
    }).filter(Boolean) as UnifiedPostResponse[];
  }

  private parseActivityPubNote(activityObject: any): {
    content: string;
    hasMedia: boolean;
    mediaType: 'image' | 'video' | null;
    media?: { type: 'image' | 'video'; url: string; altText?: string };
    url?: string;
  } {
    let content = '';
    let hasMedia = false;
    let mediaType: 'image' | 'video' | null = null;
    let media: { type: 'image' | 'video'; url: string; altText?: string } | undefined;

    if (activityObject.summary) {
      content = activityObject.summary;
    }

    return {
      content,
      hasMedia,
      mediaType,
      media,
      url: activityObject.activityId
    };
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
}