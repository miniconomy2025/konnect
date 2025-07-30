import { createFederation, Person, Image } from "@fedify/fedify";
import { getLogger } from "@logtape/logtape";
import { MemoryKvStore, InProcessMessageQueue } from "@fedify/fedify";
import { UserService } from "../services/userService.ts";

const logger = getLogger("federation");
const userService = new UserService();

const federation = createFederation({
  kv: new MemoryKvStore(),
  queue: new InProcessMessageQueue(),
});

federation.setActorDispatcher("/users/{identifier}", async (ctx, identifier) => {
  logger.debug(`Actor dispatcher called for: ${identifier}`);
  
  const user = await userService.findByUsername(identifier);
  if (!user) {
    logger.warn(`User not found: ${identifier}`);
    return null;
  }
  
  logger.info(`Serving actor: ${user.username}`);
  
  return new Person({
    id: ctx.getActorUri(identifier),
    preferredUsername: user.username,
    name: user.displayName,
    summary: user.bio || "",
    
    icon: user.avatarUrl ? new Image({
      url: new URL(user.avatarUrl),
      mediaType: "image/jpeg",
    }) : undefined,
    
    inbox: ctx.getInboxUri(identifier),
    outbox: ctx.getOutboxUri(identifier),
    followers: ctx.getFollowersUri(identifier),
    following: ctx.getFollowingUri(identifier),
        
    discoverable: !user.isPrivate,
    indexable: !user.isPrivate,
    manuallyApprovesFollowers: user.isPrivate,
  });
});

federation.setOutboxDispatcher("/users/{identifier}/outbox", async (ctx, identifier, cursor) => {
  const user = await userService.findByUsername(identifier);
  if (!user) return null;
  
  return {
    items: [],
    nextCursor: null,
  };
});

federation.setFollowersDispatcher("/users/{identifier}/followers", async (ctx, identifier, cursor) => {
  const user = await userService.findByUsername(identifier);
  if (!user) return null;
  
  return {
    items: [],
    nextCursor: null,
  };
});

federation.setFollowingDispatcher("/users/{identifier}/following", async (ctx, identifier, cursor) => {
  const user = await userService.findByUsername(identifier);
  if (!user) return null;
  
  return {
    items: [],
    nextCursor: null,
  };
});

federation.setInboxListeners("/users/{identifier}/inbox", "/inbox");

export default federation;