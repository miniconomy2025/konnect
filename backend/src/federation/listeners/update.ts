import { Update } from "@fedify/fedify";
import { getLogger } from "@logtape/logtape";
import { UserService } from "../../services/userService.ts";
import { InboxService } from "../../services/inboxService.ts";
import type { CreateActivityObject } from "../../types/inbox.ts";

const logger = getLogger("federation");
const userService = new UserService();
const inboxService = new InboxService();

export function addUpdateListener(inboxListeners: any) {
  return inboxListeners.on(Update, async (ctx: any, update: any) => {
    const actor = await update.getActor(ctx);
    const object = await update.getObject(ctx);
    
    if (!actor?.id || !object?.id) {
      logger.warn(`Missing actor or object in Update activity`, { 
        actorId: actor?.id?.toString(), 
        objectId: object?.id?.toString() 
      });
      return;
    }

    if (actor.id.toString() !== object.id.toString()) {
      logger.warn(`Update actor and object don't match - potential security issue`);
      return;
    }

    try {
      const existingUser = await userService.findByActorId(actor.id.toString());
      
      if (existingUser && !existingUser.isLocal) {
        const updateData: any = {};
        
        if (object.name && object.name !== existingUser.displayName) {
          updateData.displayName = object.name;
        }
        
        if (object.summary !== undefined && object.summary !== existingUser.bio) {
          const plainTextBio = object.summary.replace(/<[^>]*>/g, '').trim();
          updateData.bio = plainTextBio;
        }
        
        if (object.icon?.url && object.icon.url !== existingUser.avatarUrl) {
          updateData.avatarUrl = object.icon.url;
        }

        if (Object.keys(updateData).length > 0) {
          await userService.updateExternalUser(existingUser._id.toString(), updateData);
          logger.info(`Updated external user: ${existingUser.username}@${existingUser.domain}`);
        }
      }

      const updateInboxActivity: CreateActivityObject = {
        type: "Update",
        summary: `${actor.name || actor.preferredUsername || 'Someone'} updated their profile`,
        actor: actor.id.toString(),
        object: object.id.toString(),
        activityId: update.id?.toString(),
      };

      await inboxService.persistInboxActivityObject(updateInboxActivity);
      logger.info(`Persisted Update activity: ${update.id?.toString()}`);
      
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        logger.info(`Update activity already exists, skipping: ${update.id?.toString()}`);
      } else {
        logger.error(`Failed to process update activity:`, { 
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  });
}