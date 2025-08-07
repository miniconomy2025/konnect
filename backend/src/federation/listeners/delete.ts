import { Delete } from "@fedify/fedify";
import { getLogger } from "@logtape/logtape";
import { UserService } from "../../services/userService.ts";
import { InboxService } from "../../services/inboxService.ts";
import type { CreateActivityObject } from "../../types/inbox.ts";
import { ensureExternalUserExists } from "../util/federationUtil.ts";
import { SearchService } from "../../services/searchService.ts";

const logger = getLogger("federation");
const userService = new UserService();
const inboxService = new InboxService();
const searchService = new SearchService();

export function addDeleteListener(inboxListeners: any) {
  return inboxListeners.on(Delete, async (ctx: any, deleteActivity: any) => {
    const actor = await deleteActivity.getActor(ctx);
    const object = await deleteActivity.getObject(ctx);
    
    if (!actor?.id || !object?.id) {
      logger.warn(`Missing actor or object in Delete activity`, { 
        actorId: actor?.id?.toString(), 
        objectId: object?.id?.toString() 
      });
      return;
    }

    try {
      const { ExternalPost } = await import("../../models/externalPost.ts");
      
      const deletedPost = await ExternalPost.findOneAndDelete({
        objectId: object.id.toString()
      });

      if (deletedPost) {
        logger.info(`Deleted external post: ${object.id.toString()}`);
      } else {
        logger.warn(`External post not found for deletion: ${object.id.toString()}`);
      }

      const deleteInboxActivity: CreateActivityObject = {
        type: "Delete",
        summary: `${actor.name || actor.preferredUsername || 'Someone'} deleted a post`,
        actor: actor.id.toString(),
        object: object.id.toString(),
        activityId: deleteActivity.id?.toString(),
      };

      await inboxService.persistInboxActivityObject(deleteInboxActivity);
      logger.info(`Persisted Delete activity: ${deleteActivity.id?.toString()}`);
      
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        logger.info(`Delete activity already exists, skipping: ${deleteActivity.id?.toString()}`);
      } else {
        logger.error(`Failed to process delete activity:`, { 
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  });
}