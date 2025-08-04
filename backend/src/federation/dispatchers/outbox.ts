import { Create, Image, Note } from "@fedify/fedify";
import { UserService } from "../../services/userService.ts";
import { PostService } from "../../services/postserivce.ts";
import { dateToTemporal } from "../../utils/temporal.ts";

const userService = new UserService();
const postService = new PostService();

export function createOutboxDispatcher(federation: any) {
  federation.setOutboxDispatcher("/users/{identifier}/outbox", async (ctx: any, identifier: string, cursor: string) => {
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
}