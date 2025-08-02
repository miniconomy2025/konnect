import { getLogger } from "@logtape/logtape";
import { PostParser, type ParsedPost } from "./postParser.js";
import { SearchService } from "./searchService.js";

const logger = getLogger("external-posts");

export interface ExternalPostResponse {
  id: string;
  content: string;
  contentText: string;
  summary?: string;
  published: Date;
  updated?: Date | null;
  url?: string;
  
  author: {
    username: string;
    domain: string;
    displayName: string;
    avatarUrl?: string;
    actorId: string;
  };
  
  attachments: Array<{
    type: 'image' | 'video' | 'audio' | 'document' | 'unknown';
    url: string;
    mediaType?: string;
    width?: number;
    height?: number;
    description?: string;
  }>;
  
  mentions: Array<{
    name: string;
    href: string;
  }>;
  
  tags: Array<{
    type: 'Hashtag' | 'Mention' | 'Emoji';
    name: string;
    href?: string;
  }>;
  
  isReply: boolean;
  platformType?: string;
}

export class ExternalPostService {
  private searchService = new SearchService();

  /**
   * Get posts from an external user's outbox
   */
  async getUserPosts(
    username: string, 
    domain: string, 
    limit = 20
  ): Promise<ExternalPostResponse[]> {
    try {
      const user = await this.searchService.lookupExternalUser(username, domain);
      if (!user) {
        throw new Error('User not found');
      }

      const outboxData = await this.fetchOutbox(user.actorId, limit);
      if (!outboxData) {
        return [];
      }

      const posts = this.parseOutboxActivities(outboxData);
      
      return posts.map(post => this.toExternalPostResponse(post, {
        username: user.username,
        domain: user.domain,
        displayName: user.displayName || user.username,
        avatarUrl: user.avatarUrl,
        actorId: user.actorId
      }));

    } catch (error) {
      logger.error(`Failed to get posts for ${username}@${domain}:`);
      return [];
    }
  }

  /**
   * Get a specific external post
   */
  async getPost(postUrl: string): Promise<ExternalPostResponse | null> {
    try {
      const postData = await this.fetchActivityPubObject(postUrl);
      if (!postData) return null;

      const parsed = PostParser.parsePost(postData);
      if (!parsed || !PostParser.validatePost(parsed)) {
        return null;
      }

      const authorData = await this.fetchActivityPubObject(parsed.attributedTo);
      if (!authorData) return null;

      const { ActorParser } = await import('./actorParser.js');
      const author = ActorParser.parseActor(authorData);
      if (!author) return null;

      const domain = new URL(author.id).hostname;

      return this.toExternalPostResponse(parsed, {
        username: author.preferredUsername,
        domain,
        displayName: author.name || author.preferredUsername,
        avatarUrl: author.icon?.url,
        actorId: author.id
      });

    } catch (error) {
      logger.error(`Failed to get external post ${postUrl}:`);
      return null;
    }
  }

  /**
   * Fetch an ActivityPub outbox
   */
  private async fetchOutbox(actorId: string, limit: number): Promise<any> {
    const outboxUrl = `${actorId}/outbox`;
    
    try {
      const response = await fetch(outboxUrl, {
        headers: {
          'Accept': 'application/activity+json, application/ld+json',
          'User-Agent': `Konnect/1.0 (${process.env.DOMAIN})`
        },
        signal: AbortSignal.timeout(15000)
      });

      if (!response.ok) {
        const alternatives = [
          `${actorId.replace('/users/', '/users/')}/outbox`,
          `${actorId.replace('/u/', '/users/')}/outbox`,
          `${actorId}/feed`,
        ];

        for (const altUrl of alternatives) {
          try {
            const altResponse = await fetch(altUrl, {
              headers: {
                'Accept': 'application/activity+json, application/ld+json',
                'User-Agent': `Konnect/1.0 (${process.env.DOMAIN})`
              },
              signal: AbortSignal.timeout(10000)
            });
            if (altResponse.ok) {
              return await altResponse.json();
            }
          } catch {
            
          }
        }

        throw new Error(`Outbox fetch failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.type === 'OrderedCollection' || data.type === 'Collection') {
        if (data.first) {
          return await this.fetchActivityPubObject(data.first);
        }
        if (data.orderedItems || data.items) {
          return data;
        }
      }

      return data;

    } catch (error) {
      logger.warn(`Failed to fetch outbox ${outboxUrl}:`);
      return null;
    }
  }

  /**
   * Fetch any ActivityPub object
   */
  private async fetchActivityPubObject(url: string): Promise<any> {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/activity+json, application/ld+json',
          'User-Agent': `Konnect/1.0 (${process.env.DOMAIN})`
        },
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.warn(`Failed to fetch ActivityPub object ${url}:`);
      return null;
    }
  }

  /**
   * Parse activities from an outbox
   */
  private parseOutboxActivities(outboxData: any): ParsedPost[] {
    const items = outboxData.orderedItems || outboxData.items || [];
    const posts: ParsedPost[] = [];

    for (const item of items) {
      try {
        const parsed = PostParser.parsePost(item);
        if (parsed && PostParser.validatePost(parsed)) {
          posts.push(parsed);
        }
      } catch (error) {
        logger.warn('Failed to parse outbox item:');
      }
    }

    return posts;
  }

  /**
   * Convert ParsedPost to our API response format
   */
  private toExternalPostResponse(
    post: ParsedPost, 
    author: {
      username: string;
      domain: string;
      displayName: string;
      avatarUrl?: string;
      actorId: string;
    }
  ): ExternalPostResponse {
    return {
      id: post.id,
      content: post.content,
      contentText: post.contentText,
      summary: post.summary,
      published: post.published,
      updated: post.updated,
      url: post.url,
      
      author,
      
      attachments: post.attachments.map(att => ({
        type: att.type,
        url: att.url,
        mediaType: att.mediaType,
        width: att.width,
        height: att.height,
        description: att.description
      })),
      
      mentions: post.mentions,
      
      tags: post.tags,
      
      isReply: !!post.inReplyTo,
      platformType: post.platformType
    };
  }
}