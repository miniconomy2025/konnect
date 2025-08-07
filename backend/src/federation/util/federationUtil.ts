import type { Logger } from "@logtape/logtape";
import type { SearchService } from "../../services/searchService.ts";
import type { UserService } from "../../services/userService.ts";

export async function ensureExternalUserExists(actorId: string, userService: UserService, searchService: SearchService, logger: Logger): Promise<void> {
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