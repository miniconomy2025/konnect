import { UserService } from "../../services/userService.ts";
import { InboxService } from "../../services/inboxService.ts";
import { inboxActivityToActivityPubActivity } from "../../utils/mappers.ts";

const userService = new UserService();
const inboxService = new InboxService();

export function createInboxDispatcher(federation: any) {
  federation.setInboxDispatcher("/users/{identifier}/inbox", async (ctx: any, identifier: string, cursor: string) => {
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
  }).setFirstCursor(async (ctx: any, identifier: string) => {
    return `page=1&limit=20`;
  });
}