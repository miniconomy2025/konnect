import { type Recipient } from "@fedify/fedify";
import { getLogger } from "@logtape/logtape";
import { UserService } from "../../services/userService.ts";
import { FollowService } from "../../services/followService.ts";
import { InboxService } from "../../services/inboxService.ts";

const logger = getLogger("federation");
const userService = new UserService();
const inboxService = new InboxService();
const followService = new FollowService(userService, inboxService);

export function createFollowersDispatcher(federation: any) {
  federation.setFollowersDispatcher("/users/{identifier}/followers", async (ctx: any, identifier: string, cursor: string) => {
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
  });
}

export function createFollowingDispatcher(federation: any) {
  federation.setFollowingDispatcher("/users/{identifier}/following", async (ctx: any, identifier: string, cursor: string) => {
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
  });
}