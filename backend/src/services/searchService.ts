import { getLogger } from "@logtape/logtape";
import { UserService } from "./userService.js";
import type { IUser } from "../models/user.js";

const logger = getLogger("search");

export interface ExternalUser {
  username: string;
  domain: string;
  displayName?: string;
  avatarUrl?: string;
  actorId: string;
  isLocal: boolean;
  bio?: string;
  isPrivate?: boolean;
}

export interface SearchResult {
  users: ExternalUser[];
  hasMore: boolean;
}

export class SearchService {
  private userService = new UserService();

  async searchUsers(query: string, page = 1, limit = 20): Promise<SearchResult> {
    const results: ExternalUser[] = [];
    
    const localUsers = await this.userService.searchLocalUsers(query, limit);
    results.push(...localUsers.map(user => this.userToExternalUser(user)));

    const webfingerMatch = query.match(/^@?([^@]+)@([^@]+)$/);
    if (webfingerMatch) {
      const [, username, domain] = webfingerMatch;
      try {
        const externalUser = await this.lookupExternalUser(username, domain);
        if (externalUser && !results.find(u => u.actorId === externalUser.actorId)) {
          results.unshift(externalUser); 
        }
      } catch (error) {
        logger.warn(`Failed to lookup external user ${username}@${domain}:`);
      }
    }

    return {
      users: results.slice(0, limit),
      hasMore: results.length > limit
    };
  }

  async lookupExternalUser(username: string, domain: string): Promise<ExternalUser | null> {
    try {
      // check if we already have this user 
      const existingUser = await this.userService.findExternalUser(username, domain);
      
      if (existingUser) {
        return this.userToExternalUser(existingUser);
      }

      // web finger
      const webfingerData = await this.performWebFingerLookup(username, domain);
      if (!webfingerData) return null;

      // fetch ActivityPub actor data
      const actorData = await this.fetchActorData(webfingerData.actorId);
      if (!actorData) return null;

      const { ActorParser } = await import('./actorParser.js');
      if (!ActorParser.validateActorUrls(actorData)) {
        logger.warn(`Invalid URLs in actor data for ${username}@${domain}`);
        return null;
      }

      // apply fixes
      const fixedActorData = ActorParser.applyPlatformSpecificFixes(actorData, domain);

      const cachedUser = await this.userService.createExternalUser({
        username,
        domain,
        actorId: webfingerData.actorId,
        displayName: fixedActorData.name || fixedActorData.preferredUsername,
        avatarUrl: fixedActorData.icon?.url,
        bio: fixedActorData.summary,
        inbox: fixedActorData.inbox,
        outbox: fixedActorData.outbox,
        followersUrl: fixedActorData.followers,
        followingUrl: fixedActorData.following,
        isPrivate: fixedActorData.manuallyApprovesFollowers || false
      });
    
      return cachedUser ? this.userToExternalUser(cachedUser) : null 
    } catch (error) {
      logger.error(`Failed to lookup external user ${username}@${domain}:`);
      return null;
    }
  }

  private async performWebFingerLookup(username: string, domain: string): Promise<{ actorId: string } | null> {
    const webfingerUrl = `https://${domain}/.well-known/webfinger?resource=acct:${username}@${domain}`;
    
    try {
      const response = await fetch(webfingerUrl, {
        headers: {
          'Accept': 'application/jrd+json, application/json'
        },
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`WebFinger lookup failed: ${response.status}`);
      }

      const data = await response.json();
      
      const selfLink = data.links?.find((link: any) => 
        link.rel === 'self' && 
        (link.type === 'application/activity+json' || link.type === 'application/ld+json')
      );

      if (!selfLink?.href) {
        throw new Error('No ActivityPub self link found');
      }

      return { actorId: selfLink.href };
    } catch (error) {
      logger.warn(`WebFinger lookup failed for ${username}@${domain}:`);
      return null;
    }
  }

  private async fetchActorData(actorId: string): Promise<any> {
    try {
      const response = await fetch(actorId, {
        headers: {
          'Accept': 'application/activity+json, application/ld+json; profile="https://www.w3.org/ns/activitystreams"',
          'User-Agent': `Konnect/1.0 (${process.env.DOMAIN})`
        },
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`Actor fetch failed: ${response.status}`);
      }

      const data = await response.json();
      
      const { ActorParser } = await import('./actorParser.js');
      return ActorParser.parseActor(data);
    } catch (error) {
      logger.warn(`Failed to fetch actor data from ${actorId}:`);
      return null;
    }
  }

  private userToExternalUser(user: IUser): ExternalUser {
    return {
      username: user.username,
      domain: user.domain,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      actorId: user.actorId,
      isLocal: user.isLocal,
      bio: user.bio,
      isPrivate: user.isPrivate
    };
  }
}