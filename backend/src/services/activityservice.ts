import { Create, Delete, Image, Note, Person, Update, type Context } from "@fedify/fedify";
import { getLogger } from "@logtape/logtape";
import type { IPost } from "../models/post.ts";
import type { IUser } from "../models/user.ts";
import { User } from "../models/user.ts";
import { dateToTemporal } from "../utils/temporal.ts";
import { Like as ActivityPubLike, Undo } from "@fedify/fedify";


const logger = getLogger("activity");

export class ActivityService {
  
  async queueCreateActivity(post: IPost, author: IUser, federationContext?: Context<void | unknown>): Promise<void> {
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

  async publishDeleteActivity(post: IPost, author: IUser, federationContext?: Context<void | unknown>): Promise<void> {
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

  async publishLikeActivity(post: IPost, user: IUser, isLike: boolean, federationContext?: any): Promise<void> {
    try {
      if (!federationContext) {
        logger.warn(`No federation context available for like activity`);
        return;
      }

      const isExternalPost = !post.activityId.includes(process.env.DOMAIN || 'localhost:8000');
      
      if (isExternalPost) {
        await this.sendLikeToExternalPostAuthor(post, user, isLike, federationContext);
      }
      
    } catch (error) {
      logger.error(`Failed to publish ${isLike ? 'like' : 'unlike'} activity:`, {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  private async sendLikeToExternalPostAuthor(post: IPost, user: IUser, isLike: boolean, federationContext: any): Promise<void> {

    const postData = await this.fetchActivityPubObject(post.activityId);
    if (!postData?.object?.attributedTo) {
      logger.warn(`Could not get author for external post ${post.activityId}`);
      return;
    }

    const { UserService } = await import('./userService.ts');
    const userService = new UserService();
    const authorUser = await userService.findByActorId(postData.object.attributedTo);
    if (!authorUser) {
      logger.warn(`External post author not found: ${postData.object.attributedTo}`);
      return;
    }

    const domain = process.env.DOMAIN || 'localhost:8000';
    const protocol = domain.includes('localhost') ? 'http' : 'https';
    
    if (isLike) {
      const likeActivityId = `${protocol}://${domain}/activities/like-${Date.now()}`;
      
      const likeActivity = new ActivityPubLike({
        id: new URL(likeActivityId),
        actor: new URL(user.actorId),
        object: new URL(post.activityId.replace("/activity","")),
        published: dateToTemporal(new Date())
      });

      await federationContext.sendActivity(
        { identifier: user.username },
        { id: new URL(authorUser.actorId), inboxId: new URL(authorUser.inboxUrl) },
        likeActivity
      );

      logger.info(`Sent Like activity to ${authorUser.actorId} for external post ${post.activityId}`);
    } else {
      const { Like } = await import('../models/like.ts');
      const originalLike = await Like.findOne({
        'actor.id': user.actorId,
        'object.id': post.activityId,
        isLocal: true
      });

      const undoActivityId = `${protocol}://${domain}/activities/undo-like-${Date.now()}`;
      
      const undoActivity = new Undo({
        id: new URL(undoActivityId),
        actor: new URL(user.actorId),
        object: new ActivityPubLike({
          id: originalLike ? new URL(originalLike.activityId) : new URL(`${post.activityId}/likes/${user._id}`),
          actor: new URL(user.actorId),
          object: new URL(post.activityId.replace("/activity","")),
        }),
        published: dateToTemporal(new Date())
      });

      await federationContext.sendActivity(
        { identifier: user.username },
        { id: new URL(authorUser.actorId), inboxId: new URL(authorUser.inboxUrl) },
        undoActivity
      );

      logger.info(`Sent Undo Like activity to ${authorUser.actorId} for external post ${post.activityId}`);
    }
  }

  private async fetchActivityPubObject(url: string): Promise<any> {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/activity+json, application/ld+json',
          'User-Agent': `Konnect/1.0 (${process.env.DOMAIN})`
        },
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.warn(`Failed to fetch ActivityPub object ${url}`);
      return null;
    }
  }
}