import { Follow, Image, Note } from "@fedify/fedify";
import { UserService } from "../../services/userService.ts";
import { PostService } from "../../services/postserivce.ts";
import { InboxService } from "../../services/inboxService.ts";
import { dateToTemporal } from "../../utils/temporal.ts";
import { inboxActivityToActivityPubActivity } from "../../utils/mappers.ts";

const userService = new UserService();
const postService = new PostService();
const inboxService = new InboxService();

function buildBaseUrl(): string {
  const domain = process.env.DOMAIN || 'localhost:8000';
  const protocol = domain.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${domain}`;
}

export function createObjectDispatchers(federation: any) {
  federation.setObjectDispatcher(
    Note,
    "/posts/{id}",
    async (ctx: any, { id }: { id: string }) => {
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

  federation.setObjectDispatcher(
    Follow,
    "/activities/{id}",
    async (ctx: any, { id }: { id: string }) => {
      const baseUrl = buildBaseUrl();
      const inboxActivity = await inboxService.getPopulatedInboxActivityByActivityId(`${baseUrl}/activities/${id}`);
      if (!inboxActivity) return null;
      return inboxActivityToActivityPubActivity(inboxActivity);
    }
  );
}