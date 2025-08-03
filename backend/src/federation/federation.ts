import { Accept, Create, createFederation, Follow, Image, importJwk, InProcessMessageQueue, MemoryKvStore, Note, Person, type Recipient } from "@fedify/fedify";
import { getLogger } from "@logtape/logtape";
import { User } from "../models/user.ts";
import { FollowService } from "../services/followService.ts";
import { InboxService } from "../services/inboxService.ts";
import { PostService } from "../services/postserivce.ts";
import { SearchService } from "../services/searchService.ts";
import { UserService } from "../services/userService.ts";
import type { CreateActivityObject } from "../types/inbox.ts";
import { inboxActivityToActivityPubActivity } from '../utils/mappers.ts';
import { dateToTemporal } from "../utils/temporal.ts";

const logger = getLogger("federation");
const userService = new UserService();
const postService = new PostService();
const inboxService = new InboxService();
const followService = new FollowService(userService, inboxService);
const searchService = new SearchService();

const federation = createFederation({
  kv: new MemoryKvStore(),
  queue: new InProcessMessageQueue(),
});

function extractUsernameAndDomain(actorId: string): { username: string; domain: string } | null {
  try {
    const url = new URL(actorId);
    const domain = url.hostname;
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    let username = pathParts[pathParts.length - 1];
    if (username?.startsWith('@')) {
      username = username.slice(1);
    }
    
    return username ? { username, domain } : null;
  } catch {
    return null;
  }
}

async function ensureExternalUserExists(actorId: string): Promise<void> {
  try {
    const existingUser = await userService.findByActorId(actorId);
    if (existingUser) {
      return; 
    }

    const userInfo = extractUsernameAndDomain(actorId);
    if (!userInfo) {
      logger.warn(`Could not extract username/domain from actor ID: ${actorId}`);
      return;
    }

    const externalUser = await searchService.lookupExternalUser(userInfo.username, userInfo.domain);
    if (externalUser) {
      logger.info(`Successfully created external user: ${userInfo.username}@${userInfo.domain}`);
    } else {
      logger.warn(`Failed to lookup/create external user: ${userInfo.username}@${userInfo.domain}`);
    }
  } catch (error) {
    logger.error(`Error ensuring external user exists for ${actorId}:`, {
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

federation.setActorDispatcher("/users/{identifier}", async (ctx, identifier) => {
  logger.info(`Actor dispatcher called for: ${identifier}`);
  
  const user = await userService.findByUsername(identifier);
  if (!user) {
    logger.info(`User not found: ${identifier}`);
    return null;
  }
  
  logger.info(`Serving actor: ${user.username}`);
  const keys = await ctx.getActorKeyPairs(identifier);
  
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

    publicKey: keys[0]?.cryptographicKey,
    assertionMethods: keys.map((key) => key.multikey),
  });
}).setKeyPairsDispatcher(async (ctx, identifier) => {
  const urlParts = identifier.split('/');
  const username = urlParts[urlParts.length - 1];
    
  const user = await User.findOne({ username, isLocal: true });
  if (!user) {
    return [];
  }
    
  if (!user.keyPairs || user.keyPairs.length === 0) {
    logger.warn(`No key pairs found for user: ${username}`);
    return [];
  }
  
  try {
    const keyPairs = await Promise.all(user.keyPairs.map(async (keyPair: any) => {
      if (!keyPair.privateKey) {
        return null;
      }
      
      return {
        publicKey: await importJwk(keyPair.publicKey, 'public'),
        privateKey: await importJwk(keyPair.privateKey, 'private'),
      };
    }));
    
    return keyPairs.filter((keyPair): keyPair is { publicKey: CryptoKey; privateKey: CryptoKey } => keyPair !== null);
  } catch (error) {
    logger.error(`Error importing key pairs for user ${username}:`, { error: error instanceof Error ? error.message : String(error) });
    return [];
  }
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
  if (!user) {
    return null;
  }

  const page = cursor ? parseInt(cursor) : 1;
  const limit = 20;

  const followers = await followService.getPopulatedFollowsByObjectId(user.actorId, page, limit);
  const items: Recipient[] = followers.map(follower => {
    const actorId = follower.actor?.actorId;
    if (!actorId) {
      return null;
    }

    return {
      id: new URL(actorId),
      inboxId: ctx.parseUri(new URL(actorId))?.type === "actor" ? ctx.getInboxUri(actorId) : null,
    };
  }).filter(Boolean) as Recipient[];

  return {
    items: items,
    nextCursor: followers.length === limit ? (page + 1).toString() : null,
  };
})

federation.setFollowingDispatcher("/users/{identifier}/following", async (ctx, identifier, cursor) => {
  const user = await userService.findByUsername(identifier);
  if (!user) {
    return null;
  }

  const page = cursor ? parseInt(cursor) : 1;
  const limit = 20;

  const following = await followService.getPopulatedFollowsByActorId(user.actorId, page, limit);

  const items: URL[] = following.map(follow => {
    const objectId = follow.object?.actorId;
    if (!objectId) {
      logger.warn(`Missing object ID in following: ${JSON.stringify(follow)}`);
      return null;
    }

    return new URL(objectId);
  }).filter(Boolean) as URL[];

  return {
    items: items,
    nextCursor: following.length === limit ? (page + 1).toString() : null,
  };
})

federation.setObjectDispatcher(
  Note,
  "/posts/{id}",
  async (ctx, { id }) => {
    const post = await postService.getPostById(id);
    if (!post) return null;
    
    const user = await userService.findById(post.author._id.toString());
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

federation.setObjectDispatcher(
  Follow,
  "/activities/{id}",
  async (ctx, { id }) => {
    const inboxActivity = await inboxService.getPopulatedInboxActivityByActivityId(`${ctx.getActorUri("")}/activities/${id}`);
    if (!inboxActivity) return null;
    return inboxActivityToActivityPubActivity(inboxActivity);
  }
);

// get the inbox
federation.setInboxDispatcher("/users/{identifier}/inbox", async (ctx, identifier, cursor) => {
  if (cursor == null) return null;

  const user = await userService.findByUsername(identifier);
  if (!user) return null;

  const cursorParams = new URLSearchParams(cursor);
  const page = parseInt(cursorParams.get("page") || "1");
  const limit = parseInt(cursorParams.get("limit") || "20");

  const inbox = await inboxService.getPaginatedInboxActivities(user.username, page, limit);

  const activities = inbox.map(inboxActivityToActivityPubActivity);

  const nextCursor = inbox.length === limit ? (page + 1).toString() : null;
  return { items: activities, nextCursor: nextCursor };
}).setFirstCursor(async (ctx, identifier) => {
  return `page=1&limit=20`;
});

federation
  .setInboxListeners("/users/{identifier}/inbox", "/inbox")
  .on(Follow, async (ctx, follow) => {
    if (follow.objectId == null) return;

    const actorBeingFollowed = await follow.getObject(ctx);
    if (actorBeingFollowed == null || actorBeingFollowed.id == null) return;

    const actorFollowing = await follow.getActor(ctx);
    if (actorFollowing == null || actorFollowing.id == null) return;

    await ensureExternalUserExists(actorFollowing.id.toString());

    const followedUrl = new URL(actorBeingFollowed.id.toString());
    const username = followedUrl.pathname.split('/').pop();
    
    if (!username) {
      logger.warn(`Could not extract username from URL: ${actorBeingFollowed.id.toString()}`);
      return;
    }
        
    try {
      await ctx.sendActivity(
        { identifier: username },
        actorFollowing,
        new Accept({
          actor: follow.objectId,
          object: follow,
        }),
      );
      logger.info(`Successfully sent Accept activity from ${username} to ${actorFollowing.id.toString()}`);
    } catch (error) {
      logger.error(`Failed to send Accept activity from ${username} to ${actorFollowing.id.toString()}:`, { 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
    }

    const followInboxActivity: CreateActivityObject = {
      type: "Follow",
      summary: await inboxService.defaultActivitySummary("Follow", actorFollowing.id.toString(), actorBeingFollowed.id.toString()),
      actor: actorFollowing.id.toString(),
      object: actorBeingFollowed.id.toString(),
      activityId: follow.id?.toString(),
    }

    try {
      await inboxService.persistInboxActivityObject(followInboxActivity);
      logger.info(`Successfully persisted follow activity: ${follow.id?.toString()}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        logger.info(`Follow already exists, skipping persistence: ${actorFollowing.id.toString()} -> ${actorBeingFollowed.id.toString()}`);
      } else {
        logger.error(`Failed to persist follow activity:`, { 
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
      }
    }
  })
  .on(Create, async (ctx, create) => {
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
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          actorId: actor.id.toString(),
          objectId: object.id.toString(),
          activityId: create.id?.toString()
        });
      }
    }
  });

export default federation;