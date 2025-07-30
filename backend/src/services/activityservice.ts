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

      // The federation middleware will handle the actual activity creation
      // when the outbox is requested. This is just for logging.
      
      logger.info(`Post created: ${post.activityId} by ${author.username}`);
      
      // In a real implementation, you might want to:
      // 1. Send activities to followers' inboxes
      // 2. Update activity counts
      // 3. Cache the activity
      
    } catch (error) {
      logger.error("Failed to publish create activity:");
      // Don't throw - post creation should succeed even if federation fails
    }
  }

  async publishLikeActivity(post: IPost, user: IUser, isLike: boolean): Promise<void> {
    try {
      logger.info(`${isLike ? 'Like' : 'Unlike'} activity: ${post.activityId} by ${user.username}`);
      
      // TODO: Implement actual Like/Undo activity federation
      // This would involve creating Like or Undo activities and sending them
      // to the post author's inbox if they're on a remote server
      
    } catch (error) {
      logger.error(`Failed to publish ${isLike ? 'like' : 'unlike'} activity:`);
      // Don't throw - like operation should succeed even if federation fails
    }
  }

  async publishDeleteActivity(post: IPost, author: IUser): Promise<void> {
    try {
      logger.info(`Delete activity: ${post.activityId} by ${author.username}`);
      
      // TODO: Implement Delete activity federation
      // This would involve creating a Delete activity and sending it to followers
      
    } catch (error) {
      logger.error("Failed to publish delete activity:");
      // Don't throw - deletion should succeed even if federation fails
    }
  }
}