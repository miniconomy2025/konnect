import { Delete } from "@fedify/fedify";
import { getLogger } from "@logtape/logtape";
import { UserService } from "../../services/userService.ts";
import { InboxService } from "../../services/inboxService.ts";
import type { CreateActivityObject } from "../../types/inbox.ts";

const logger = getLogger("federation");
const userService = new UserService();
const inboxService = new InboxService();

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

    await ensureExternalUserExists(actor.id.toString());

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