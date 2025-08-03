import { Create } from "@fedify/fedify";
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

export function addCreateListener(inboxListeners: any) {
  return inboxListeners.on(Create, async (ctx: any, create: any) => {
    const actor = await create.getActor(ctx);
    const object = await create.getObject(ctx);
    
    if (!actor?.id || !object?.id) {
      logger.warn(`Missing actor or object in Create activity`, { 
        actorId: actor?.id?.toString(), 
        objectId: object?.id?.toString() 
      });
      return;
    }

    await ensureExternalUserExists(actor.id.toString());

    const createInboxActivity: CreateActivityObject = {
      type: "Create",
      summary: `${actor.name || actor.preferredUsername || 'Someone'} created a post`,
      actor: actor.id.toString(),
      object: object.id.toString(),
      activityId: create.id?.toString(),
    };

    try {
      await inboxService.persistInboxActivityObject(createInboxActivity);
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        logger.info(`Create activity already exists, skipping: ${create.id?.toString()}`);
      } else {
        logger.error(`Failed to persist create activity:`, { 
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  });
}