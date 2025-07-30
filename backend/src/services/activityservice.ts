import { getLogger } from "@logtape/logtape";
import federation from "../federation/federation.ts";
import type { IPost } from "../models/post.ts";
import type { IUser } from "../models/user.ts";

const logger = getLogger("activity");

export class ActivityService {
  
  async publishCreateActivity(post: IPost, author: IUser): Promise<void> {
    try {
      const domain = process.env.DOMAIN || 'localhost:8000';
      const protocol = domain.includes('localhost') ? 'http' : 'https';
      
      // Create the activity context
      const ctx = federation.createContext(
        new URL(`${protocol}://${domain}`),
        {}
      );

      // The federation middleware handles the actual activity creation
      // when the outbox is requested, current this just logs and then sending to followers TODO
      
      logger.info(`Post created: ${post.activityId} by ${author.username}`);
      
      // Todo
      // 1. Send activities to followers' inboxes
      // 2. Update activity counts
      // 3. Cache the activity
      
    } catch (error) {
      logger.error("Failed to publish create activity:");
    }
  }

  async publishLikeActivity(post: IPost, user: IUser, isLike: boolean): Promise<void> {
    try {
      logger.info(`${isLike ? 'Like' : 'Unlike'} activity: ${post.activityId} by ${user.username}`);
      
      // TODO actual Like/Undo activity federation
      // This would involve creating Like or Undo activities and sending them
      // to the post author's inbox if they're on a remote server
      
    } catch (error) {
      logger.error(`Failed to publish ${isLike ? 'like' : 'unlike'} activity:`);
    }
  }

  async publishDeleteActivity(post: IPost, author: IUser): Promise<void> {
    try {
      logger.info(`Delete activity: ${post.activityId} by ${author.username}`);
      
      // TODO: Implement Delete activity federation
      // This would involve creating a Delete activity and sending it to followers
      
    } catch (error) {
      logger.error("Failed to publish delete activity:");
    }
  }
}