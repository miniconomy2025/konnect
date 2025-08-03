import { Accept, Follow } from "@fedify/fedify";
import { getLogger } from "@logtape/logtape";
import { UserService } from "../../services/userService.ts";
import { InboxService } from "../../services/inboxService.ts";
import { SearchService } from "../../services/searchService.ts";
import type { CreateActivityObject } from "../../types/inbox.ts";

const logger = getLogger("federation");
const userService = new UserService();
const inboxService = new InboxService();
const searchService = new SearchService();

async function ensureExternalUserExists(actorId: string): Promise<void> {
  try {
    const existingUser = await userService.findByActorId(actorId);
    if (existingUser) {
      return; 
    }

    const url = new URL(actorId);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const username = pathParts[pathParts.length - 1]?.startsWith('@') 
      ? pathParts[pathParts.length - 1].slice(1) 
      : pathParts[pathParts.length - 1];
    const domain = url.hostname;
    
    if (!username) {
      logger.warn(`Could not extract username from actor ID: ${actorId}`);
      return;
    }

    const externalUser = await searchService.lookupExternalUser(username, domain);
    if (externalUser) {
      logger.info(`Successfully created external user: ${username}@${domain}`);
    } else {
      logger.warn(`Failed to lookup/create external user: ${username}@${domain}`);
    }
  } catch (error) {
    logger.error(`Error ensuring external user exists for ${actorId}:`, {
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

export function createFollowListener(federation: any) {
  federation.setInboxListeners("/users/{identifier}/inbox", "/inbox")
    .on(Follow, async (ctx: any, follow: any) => {
      if (follow.objectId == null) return;

      const actorBeingFollowed = await follow.getObject(ctx);
      if (actorBeingFollowed == null || actorBeingFollowed.id == null) return;

      const actorFollowing = await follow.getActor(ctx);
      if (actorFollowing == null || actorFollowing.id == null) return;

      await ensureExternalUserExists(actorFollowing.id.toString());

      const followedUrl = new URL(actorBeingFollowed.id.toString());
      const username = followedUrl.pathname.split('/').pop();
      
      if (!username) {
        logger.warn(`Could not extract username from URL: ${actorBeingFollowed.id.toString()}`);
        return;
      }
          
      try {
        await ctx.sendActivity(
          { identifier: username },
          actorFollowing,
          new Accept({
            actor: follow.objectId,
            object: follow,
          }),
        );
        logger.info(`Successfully sent Accept activity from ${username} to ${actorFollowing.id.toString()}`);
      } catch (error) {
        logger.error(`Failed to send Accept activity from ${username} to ${actorFollowing.id.toString()}:`, { 
          error: error instanceof Error ? error.message : String(error)
        });
      }

      const followInboxActivity: CreateActivityObject = {
        type: "Follow",
        summary: await inboxService.defaultActivitySummary("Follow", actorFollowing.id.toString(), actorBeingFollowed.id.toString()),
        actor: actorFollowing.id.toString(),
        object: actorBeingFollowed.id.toString(),
        activityId: follow.id?.toString(),
      }

      try {
        await inboxService.persistInboxActivityObject(followInboxActivity);
        logger.info(`Successfully persisted follow activity: ${follow.id?.toString()}`);
      } catch (error) {
        if (error instanceof Error && error.message.includes('already exists')) {
          logger.info(`Follow already exists, skipping persistence: ${actorFollowing.id.toString()} -> ${actorBeingFollowed.id.toString()}`);
        } else {
          logger.error(`Failed to persist follow activity:`, { 
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
    });
}