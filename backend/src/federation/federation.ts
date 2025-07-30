import { createFederation, Person, Image, Create, Note } from "@fedify/fedify";
import { getLogger } from "@logtape/logtape";
import { MemoryKvStore, InProcessMessageQueue } from "@fedify/fedify";
import { dateToTemporal } from "../utils/temporal.ts";
import { UserService } from "../services/userService.ts";
import { PostService } from "../services/postserivce.ts";

const logger = getLogger("federation");
const userService = new UserService();
const postService = new PostService();

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
  
  const page = cursor ? parseInt(cursor) : 1;
  const limit = 20;
  
  const posts = await postService.getUserPosts(user._id.toString(), page, limit);
  
  const activities = posts.map(post => {
    const noteId = post.activityId;
    
    const note = new Note({
      id: new URL(noteId),
      content: post.caption,
      to: new URL("https://www.w3.org/ns/activitystreams#Public"),
      published: dateToTemporal(post.createdAt),
      attachments: [new Image({
        url: new URL(post.mediaUrl),
        mediaType: post.mediaType,
      })],
      attribution: ctx.getActorUri(identifier),
    });
    
    return new Create({
      id: new URL(`${noteId}/activity`),
      actor: ctx.getActorUri(identifier),
      object: note,
      to: new URL("https://www.w3.org/ns/activitystreams#Public"),
      published: dateToTemporal(post.createdAt),
    });
  });
  
  return {
    items: activities,
    nextCursor: posts.length === limit ? (page + 1).toString() : null,
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

// Handle individual post objects
federation.setObjectDispatcher(
  Note,
  "/posts/{id}",
  async (ctx, { id }) => {
    const post = await postService.getPostById(id);
    if (!post) return null;
    
    const user = await userService.findById(post.author.toString());
    if (!user) return null;
    
    return new Note({
      id: new URL(post.activityId),
      content: post.caption,
      to: new URL("https://www.w3.org/ns/activitystreams#Public"),
      published: dateToTemporal(post.createdAt),
      attachments: [new Image({
        url: new URL(post.mediaUrl),
        mediaType: post.mediaType,
      })],
      attribution: ctx.getActorUri(user.username),
    });
  }
);

federation.setInboxListeners("/users/{identifier}/inbox", "/inbox");

export default federation;