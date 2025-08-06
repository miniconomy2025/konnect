import { Undo } from "@fedify/fedify";
import { getLogger } from "@logtape/logtape";
import { UserService } from "../../services/userService.ts";
import { InboxService } from "../../services/inboxService.ts";
import { FollowService } from "../../services/followService.ts";
import type { CreateActivityObject } from "../../types/inbox.ts";

const logger = getLogger("federation");
const userService = new UserService();
const inboxService = new InboxService();
const followService = new FollowService(userService, inboxService);

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

    const { SearchService } = await import("../../services/searchService.ts");
    const searchService = new SearchService();
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

export function addUndoListener(inboxListeners: any) {
  return inboxListeners.on(Undo, async (ctx: any, undo: any) => {
    const actor = await undo.getActor(ctx);
    const object = await undo.getObject(ctx);
    
    if (!actor?.id || !object?.id) {
      logger.warn(`Missing actor or object in Undo activity`, { 
        actorId: actor?.id?.toString(), 
        objectId: object?.id?.toString() 
      });
      return;
    }

    await ensureExternalUserExists(actor.id.toString());
    if (object.constructor.name === 'Follow') {
      try {
        const objectActor = await object.getActor(ctx);
        const objectTarget = await object.getObject(ctx);

        if (!objectActor?.id || !objectTarget?.id) {
          logger.warn(`Missing actor or object in Follow being undone`);
          return;
        }

        const removed = await followService.removeFollow(objectActor.id.toString(), objectTarget.id.toString());
        
        if (removed) {
          logger.info(`Removed follow: ${objectActor.id.toString()} → ${objectTarget.id.toString()}`);
        } else {
          logger.warn(`Follow not found for removal: ${objectActor.id.toString()} → ${objectTarget.id.toString()}`);
        }

        const undoInboxActivity: CreateActivityObject = {
          type: "Undo",
          summary: `${actor.name || actor.preferredUsername || 'Someone'} unfollowed ${objectTarget.name || objectTarget.preferredUsername || 'someone'}`,
          actor: actor.id.toString(),
          object: objectTarget.id.toString(),
          activityId: undo.id?.toString(),
        };

        await inboxService.persistInboxActivityObject(undoInboxActivity);
        logger.info(`Persisted Undo activity: ${undo.id?.toString()}`);
        
      } catch (error) {
        if (error instanceof Error && error.message.includes('already exists')) {
          logger.info(`Undo activity already exists, skipping: ${undo.id?.toString()}`);
        } else {
          logger.error(`Failed to process undo follow activity:`, { 
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
    } else if (object.constructor.name === 'Like') {
      try {
        const actor = await undo.getActor(ctx);
        const likedObject = await object.getObject(ctx);
        
        if (!actor?.id || !likedObject?.id) {
          logger.warn(`Missing actor or object in Undo Like activity`);
          return;
        }

        const { PostService } = await import("../../services/postserivce.ts");
        const postService = new PostService();
        await postService.processIncomingUnlike(
          actor.id.toString(),
          likedObject.id.toString()
        );
        
        logger.info(`Processed incoming unlike from ${actor.id.toString()} on ${likedObject.id.toString()}`);
      } catch (error) {
        logger.error(`Failed to process undo like activity:`, { 
          error: error instanceof Error ? error.message : String(error)
        });
      }
    } else {
      logger.warn(`Received Undo for unsupported object type: ${object.type}`);
    }
  });
}