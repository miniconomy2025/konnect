import { Create, Image, Note } from "@fedify/fedify";
import { getLogger } from "@logtape/logtape";
import federation from "../federation/federation.ts";
import type { IPost } from "../models/post.ts";
import type { IUser } from "../models/user.ts";
import { User } from "../models/user.ts";
import { dateToTemporal } from "../utils/temporal.ts";

const logger = getLogger("activity");

export class ActivityService {
  
  async publishCreateActivity(post: IPost, author: IUser): Promise<void> {
    try {
      const domain = process.env.DOMAIN || 'localhost:8000';
      const protocol = domain.includes('localhost') ? 'http' : 'https';
      const baseUrl = `${protocol}://${domain}`;
      
      const ctx = federation.createContext(new URL(baseUrl), {});

      const { FollowService } = await import('./followService.ts');
      const { InboxService } = await import('./inboxService.ts');
      const { UserService } = await import('./userService.ts');
      
      const userService = new UserService();
      const inboxService = new InboxService();
      const followService = new FollowService(userService, inboxService);

      const followerActorIds = await followService.getFollowerActorIds(author.actorId);
      
      if (followerActorIds.length === 0) {
        logger.info(`No followers to send Create activity for post ${post.activityId}`);
        return;
      }

      const externalFollowers = await User.find({
        actorId: { $in: followerActorIds },
        isLocal: false
      });

      if (externalFollowers.length === 0) {
        logger.info(`No external followers to send Create activity for post ${post.activityId}`);
        return;
      }

      const note = new Note({
        id: new URL(post.activityId),
        content: post.caption,
        to: new URL("https://www.w3.org/ns/activitystreams#Public"),
        published: dateToTemporal(post.createdAt),
        attachments: [new Image({
          url: new URL(post.mediaUrl),
          mediaType: post.mediaType,
        })],
        attribution: ctx.getActorUri(author.username),
      });

      const createActivity = new Create({
        id: new URL(`${post.activityId}/activity`),
        actor: ctx.getActorUri(author.username),
        object: note,
        to: new URL("https://www.w3.org/ns/activitystreams#Public"),
        published: dateToTemporal(post.createdAt),
      });

      const deliveryPromises = externalFollowers.map(async (follower) => {
        try {
          await ctx.sendActivity(
            { identifier: author.username },
            {
              id: new URL(follower.actorId),
              inboxId: new URL(follower.inboxUrl)
            },
            createActivity
          );
          logger.info(`Sent Create activity to ${follower.actorId} for post ${post.activityId}`);
        } catch (error) {
          logger.error(`Failed to send Create activity to ${follower.actorId}:`, {
            error: error instanceof Error ? error.message : String(error)
          });
        }
      });

      await Promise.allSettled(deliveryPromises);
      logger.info(`Create activity delivery completed for post ${post.activityId} to ${externalFollowers.length} external followers`);
      
    } catch (error) {
      logger.error("Failed to publish create activity:", {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  async publishLikeActivity(post: IPost, user: IUser, isLike: boolean): Promise<void> {
    try {
      logger.info(`${isLike ? 'Like' : 'Unlike'} activity: ${post.activityId} by ${user.username}`);
      
    } catch (error) {
      logger.error(`Failed to publish ${isLike ? 'like' : 'unlike'} activity:`, {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  async publishDeleteActivity(post: IPost, author: IUser): Promise<void> {
    try {
      logger.info(`Delete activity: ${post.activityId} by ${author.username}`);
      
    } catch (error) {
      logger.error("Failed to publish delete activity:", {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
}