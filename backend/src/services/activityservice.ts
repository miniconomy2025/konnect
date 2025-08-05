import { Create, Delete, Image, Note, Person, Update } from "@fedify/fedify";
import { getLogger } from "@logtape/logtape";
import type { IPost } from "../models/post.ts";
import type { IUser } from "../models/user.ts";
import { User } from "../models/user.ts";
import { dateToTemporal } from "../utils/temporal.ts";

const logger = getLogger("activity");

export class ActivityService {
  
  async queueCreateActivity(post: IPost, author: IUser, federationContext?: any): Promise<void> {
    try {
      if (!federationContext) {
        logger.warn(`No federation context available for post ${post.activityId}, activity will not be delivered`);
        return;
      }

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
        attribution: federationContext.getActorUri(author.username),
      });

      const createActivity = new Create({
        id: new URL(`${post.activityId}/activity`),
        actor: federationContext.getActorUri(author.username),
        object: note,
        to: new URL("https://www.w3.org/ns/activitystreams#Public"),
        published: dateToTemporal(post.createdAt),
      });

      const deliveryPromises = externalFollowers.map(async (follower) => {
        try {
          await federationContext.sendActivity(
            { identifier: author.username },
            {
              id: new URL(follower.actorId),
              inboxId: new URL(follower.inboxUrl)
            },
            createActivity
          );
          logger.info(`Queued Create activity to ${follower.actorId} for post ${post.activityId}`);
        } catch (error) {
          logger.error(`Failed to queue Create activity to ${follower.actorId}:`, {
            error: error instanceof Error ? error.message : String(error)
          });
        }
      });

      await Promise.allSettled(deliveryPromises);
      logger.info(`Create activity delivery queued for post ${post.activityId} to ${externalFollowers.length} external followers`);
      
    } catch (error) {
      logger.error("Failed to queue create activity:", {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  async publishLikeActivity(post: IPost, user: IUser, isLike: boolean): Promise<void> {
    try {
      logger.info(`${isLike ? 'Like' : 'Unlike'} activity: ${post.activityId} by ${user.username}`);
      // TODO: Implement Like/Undo activities when we have proper federation context
    } catch (error) {
      logger.error(`Failed to publish ${isLike ? 'like' : 'unlike'} activity:`, {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

 async publishUpdateActivity(user: IUser, federationContext?: any): Promise<void> {
    try {
      if (!federationContext) {
        logger.warn(`No federation context available for user ${user.username}, update activity will not be delivered`);
        return;
      }

      const { FollowService } = await import('./followService.ts');
      const { InboxService } = await import('./inboxService.ts');
      const { UserService } = await import('./userService.ts');
      
      const userService = new UserService();
      const inboxService = new InboxService();
      const followService = new FollowService(userService, inboxService);

      const followerActorIds = await followService.getFollowerActorIds(user.actorId);
      
      if (followerActorIds.length === 0) {
        logger.info(`No followers to send Update activity for user ${user.username}`);
        return;
      }

      const externalFollowers = await User.find({
        actorId: { $in: followerActorIds },
        isLocal: false
      });

      if (externalFollowers.length === 0) {
        logger.info(`No external followers to send Update activity for user ${user.username}`);
        return;
      }

      const domain = process.env.DOMAIN || 'localhost:8000';
      const protocol = domain.includes('localhost') ? 'http' : 'https';
      const updateActivityId = `${protocol}://${domain}/activities/update-${Date.now()}`;

      const person = new Person({
        id: new URL(user.actorId),
        preferredUsername: user.username,
        name: user.displayName,
        summary: user.bio ? `<p>${user.bio}</p>` : "",
        icon: user.avatarUrl ? new Image({
          url: new URL(user.avatarUrl),
          mediaType: "image/jpeg",
        }) : undefined,
      });

      const updateActivity = new Update({
        id: new URL(updateActivityId),
        actor: federationContext.getActorUri(user.username),
        object: person,
        to: new URL("https://www.w3.org/ns/activitystreams#Public"),
        published: dateToTemporal(new Date()),
      });

      const deliveryPromises = externalFollowers.map(async (follower) => {
        try {
          await federationContext.sendActivity(
            { identifier: user.username },
            {
              id: new URL(follower.actorId),
              inboxId: new URL(follower.inboxUrl)
            },
            updateActivity
          );
          logger.info(`Queued Update activity to ${follower.actorId} for user ${user.username}`);
        } catch (error) {
          logger.error(`Failed to queue Update activity to ${follower.actorId}:`, {
            error: error instanceof Error ? error.message : String(error)
          });
        }
      });

      await Promise.allSettled(deliveryPromises);
      logger.info(`Update activity delivery queued for user ${user.username} to ${externalFollowers.length} external followers`);
      
    } catch (error) {
      logger.error("Failed to publish update activity:", {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  async publishDeleteActivity(post: IPost, author: IUser, federationContext?: any): Promise<void> {
    try {
      if (!federationContext) {
        logger.warn(`No federation context available for post ${post.activityId}, delete activity will not be delivered`);
        return;
      }

      const { FollowService } = await import('./followService.ts');
      const { InboxService } = await import('./inboxService.ts');
      const { UserService } = await import('./userService.ts');
      
      const userService = new UserService();
      const inboxService = new InboxService();
      const followService = new FollowService(userService, inboxService);

      const followerActorIds = await followService.getFollowerActorIds(author.actorId);
      
      if (followerActorIds.length === 0) {
        logger.info(`No followers to send Delete activity for post ${post.activityId}`);
        return;
      }

      const externalFollowers = await User.find({
        actorId: { $in: followerActorIds },
        isLocal: false
      });

      if (externalFollowers.length === 0) {
        logger.info(`No external followers to send Delete activity for post ${post.activityId}`);
        return;
      }

      const domain = process.env.DOMAIN || 'localhost:8000';
      const protocol = domain.includes('localhost') ? 'http' : 'https';
      const deleteActivityId = `${protocol}://${domain}/activities/delete-${Date.now()}`;

      const deleteActivity = new Delete({
        id: new URL(deleteActivityId),
        actor: federationContext.getActorUri(author.username),
        object: new URL(post.activityId),
        to: new URL("https://www.w3.org/ns/activitystreams#Public"),
        published: dateToTemporal(new Date()),
      });

      const deliveryPromises = externalFollowers.map(async (follower) => {
        try {
          await federationContext.sendActivity(
            { identifier: author.username },
            {
              id: new URL(follower.actorId),
              inboxId: new URL(follower.inboxUrl)
            },
            deleteActivity
          );
          logger.info(`Queued Delete activity to ${follower.actorId} for post ${post.activityId}`);
        } catch (error) {
          logger.error(`Failed to queue Delete activity to ${follower.actorId}:`, {
            error: error instanceof Error ? error.message : String(error)
          });
        }
      });

      await Promise.allSettled(deliveryPromises);
      logger.info(`Delete activity delivery queued for post ${post.activityId} to ${externalFollowers.length} external followers`);
      
    } catch (error) {
      logger.error("Failed to publish delete activity:", {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  async publishPostUpdateActivity(post: IPost, author: IUser, federationContext?: any): Promise<void> {
    try {
      if (!federationContext) {
        logger.warn(`No federation context available for post ${post.activityId}, update activity will not be delivered`);
        return;
      }

      const { FollowService } = await import('./followService.ts');
      const { InboxService } = await import('./inboxService.ts');
      const { UserService } = await import('./userService.ts');
      
      const userService = new UserService();
      const inboxService = new InboxService();
      const followService = new FollowService(userService, inboxService);

      console.log(author.actorId);
      const followerActorIds = await followService.getFollowerActorIds(author.actorId);
      
      if (followerActorIds.length === 0) {
        logger.info(`No followers to send Update activity for post ${post.activityId}`);
        return;
      }

      const externalFollowers = await User.find({
        actorId: { $in: followerActorIds },
        isLocal: false
      });

      if (externalFollowers.length === 0) {
        logger.info(`No external followers to send Update activity for post ${post.activityId}`);
        return;
      }

      const updatedNote = new Note({
        id: new URL(post.activityId),
        content: post.caption,
        to: new URL("https://www.w3.org/ns/activitystreams#Public"),
        published: dateToTemporal(post.createdAt),
        updated: dateToTemporal(post.updatedAt),
        attachments: [new Image({
          url: new URL(post.mediaUrl),
          mediaType: post.mediaType,
        })],
        attribution: federationContext.getActorUri(author.username),
      });

      const domain = process.env.DOMAIN || 'localhost:8000';
      const protocol = domain.includes('localhost') ? 'http' : 'https';
      const updateActivityId = `${protocol}://${domain}/activities/update-post-${Date.now()}`;

      const updateActivity = new Update({
        id: new URL(updateActivityId),
        actor: federationContext.getActorUri(author.username),
        object: updatedNote,
        to: new URL("https://www.w3.org/ns/activitystreams#Public"),
        published: dateToTemporal(new Date()),
      });

      const deliveryPromises = externalFollowers.map(async (follower) => {
        try {
          await federationContext.sendActivity(
            { identifier: author.username },
            {
              id: new URL(follower.actorId),
              inboxId: new URL(follower.inboxUrl)
            },
            updateActivity
          );
          logger.info(`Queued post Update activity to ${follower.actorId} for post ${post.activityId}`);
        } catch (error) {
          logger.error(`Failed to queue post Update activity to ${follower.actorId}:`, {
            error: error instanceof Error ? error.message : String(error)
          });
        }
      });

      await Promise.allSettled(deliveryPromises);
      logger.info(`Post Update activity delivery queued for post ${post.activityId} to ${externalFollowers.length} external followers`);
      
    } catch (error) {
      logger.error("Failed to publish post update activity:", {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
}