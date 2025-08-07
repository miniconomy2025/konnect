import { Undo } from "@fedify/fedify";
import { getLogger } from "@logtape/logtape";
import { UserService } from "../../services/userService.ts";
import { InboxService } from "../../services/inboxService.ts";
import { FollowService } from "../../services/followService.ts";
import type { CreateActivityObject } from "../../types/inbox.ts";
import { SearchService } from "../../services/searchService.ts";
import { ensureExternalUserExists } from "../util/federationUtil.ts";

const logger = getLogger("federation");
const userService = new UserService();
const inboxService = new InboxService();
const searchService = new SearchService();
const followService = new FollowService(userService, inboxService);


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

    await ensureExternalUserExists(actor.id.toString(), userService, searchService, logger);
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