import { Like as ActivityPubLike } from "@fedify/fedify";
import { getLogger } from "@logtape/logtape";
import { PostService } from "../../services/postserivce.ts";

const logger = getLogger("federation");

export function addLikeListener(inboxListeners: any) {
  return inboxListeners.on(ActivityPubLike, async (ctx: any, like: any) => {
    const actor = await like.getActor(ctx);
    const object = await like.getObject(ctx);
    
    if (!actor?.id || !object?.id) {
      logger.warn(`Missing actor or object in Like activity`, { 
        actorId: actor?.id?.toString(), 
        objectId: object?.id?.toString() 
      });
      return;
    }

    try {
      const postService = new PostService();
      await postService.processIncomingLike(
        actor.id.toString(),
        object.id.toString(),
        like.id?.toString()
      );
      
      logger.info(`Processed incoming like from ${actor.id.toString()} on ${object.id.toString()}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        logger.info(`Like already exists, skipping: ${actor.id.toString()} -> ${object.id.toString()}`);
      } else {
        logger.error(`Failed to process like:`, { 
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  });
}