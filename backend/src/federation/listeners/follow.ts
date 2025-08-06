import { Accept, Follow } from "@fedify/fedify";
import { getLogger } from "@logtape/logtape";
import { UserService } from "../../services/userService.ts";
import { InboxService } from "../../services/inboxService.ts";
import { SearchService } from "../../services/searchService.ts";
import type { CreateActivityObject } from "../../types/inbox.ts";
import { ensureExternalUserExists } from "../util/federationUtil.ts";

const logger = getLogger("federation");
const userService = new UserService();
const inboxService = new InboxService();
const searchService = new SearchService();

export function addFollowListener(inboxListeners: any) {
  return inboxListeners.on(Follow, async (ctx: any, follow: any) => {
    if (follow.objectId == null) return;

    const actorBeingFollowed = await follow.getObject(ctx);
    if (actorBeingFollowed == null || actorBeingFollowed.id == null) return;

    const actorFollowing = await follow.getActor(ctx);
    if (actorFollowing == null || actorFollowing.id == null) return;

    await ensureExternalUserExists(actorFollowing.id.toString(), userService, searchService, logger);

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