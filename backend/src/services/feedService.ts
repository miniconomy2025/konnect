import { getLogger } from '@logtape/logtape';
import { InboxActivity } from '../models/inbox.ts';
import { Post, type IPost } from '../models/post.ts';
import { User, type IUser } from '../models/user.ts';
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

    const unifiedLocalPosts = await PostNormalizationService.localPostsToUnifiedWithLikes(localPosts, userId);
    const unifiedExternalPosts = await PostNormalizationService.externalPostsToUnifiedWithLikes(externalPosts, userId);

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

    const unifiedPosts = await PostNormalizationService.localPostsToUnifiedWithLikes(localPosts, userId);

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

}