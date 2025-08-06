import {
  Image,
  isActor,
  type Actor,
  type Context
} from "@fedify/fedify";
import { getLogger } from "@logtape/logtape";
import type { IUser } from "../models/user.js";
import type { ActorData, ExternalUser, UserResponse } from "../types/user.ts";
import { FollowService } from "./followService.js";
import { InboxService } from "./inboxService.js";
import { UserService, type CreateExternalUserData } from "./userService.js";

const logger = getLogger("search");


export interface SearchResult {
  users: ExternalUser[];
  hasMore: boolean;
}

export interface FederatedSearchResult {
  users: UserResponse[];
  hasMore: boolean;
}

export class SearchService {
  private userService = new UserService();
  private inboxService = new InboxService();
  private followService = new FollowService(this.userService, this.inboxService);

  async userToUserResponse(user: IUser, currentUserActorId?: string): Promise<UserResponse> {
    const { followingCount, followersCount } = await this.followService.getFollowCounts(user.actorId);
    
    let isFollowingCurrentUser: boolean = false;
    let isFollowedByCurrentUser: boolean = false;
    
    if (currentUserActorId) {
      [isFollowingCurrentUser, isFollowedByCurrentUser] = await Promise.all([
        this.followService.isFollowing(user.actorId, currentUserActorId),
        this.followService.isFollowing(currentUserActorId, user.actorId)
      ]);
    }
    
    const localDomain = process.env.DOMAIN || 'localhost:8000';
    const hostServer = user.isLocal ? localDomain : user.domain;
    const handle = `@${user.username}@${hostServer}`;
    
    return {
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      joinDate: user.createdAt,
      activityPubId: user.actorId,
      isPrivate: user.isPrivate,
      followingCount,
      followersCount,
      isFollowingCurrentUser,
      isFollowedByCurrentUser,
      isLocal: user.isLocal,
      hostServer,
      handle,
    };
  }

  private async extractActorData(actor: Actor, context: Context<void | unknown>): Promise<ActorData> {
    const id = actor.id?.toString();
    if (!id) {
      throw new Error('Actor ID is required');
    }

    const preferredUsername = actor.preferredUsername?.toString() ?? '';
    const name = actor.name?.toString();
    const summary = actor.summary?.toString();
    const manuallyApprovesFollowers = actor.manuallyApprovesFollowers ?? false;

    let actorType: ActorData['type'] = 'Person';
    if (actor.constructor.name === 'Application') actorType = 'Application';
    else if (actor.constructor.name === 'Group') actorType = 'Group';
    else if (actor.constructor.name === 'Organization') actorType = 'Organization';
    else if (actor.constructor.name === 'Service') actorType = 'Service';

    let iconUrl: string | undefined;
    try {
      const icon = await actor.getIcon();
      if (icon) {
        if (Array.isArray(icon)) {
          for (const iconItem of icon) {
            if (iconItem instanceof Image && iconItem.url) {
              iconUrl = iconItem.url.toString();
              break;
            }
          }
        } else if (icon instanceof Image && icon.url) {
          iconUrl = icon.url.toString();
        }
      }
    } catch (error) {
      logger.debug(`Failed to get icon for actor ${id}: ${error}`);
    }

    let inboxUrl: string | undefined;
    let outboxUrl: string | undefined;
    let followersUrl: string | undefined;
    let followingUrl: string | undefined;

    try {
      const inbox = await actor.getInbox();
      inboxUrl = inbox?.toString();
    } catch (error) {
      logger.debug(`Failed to get inbox for actor ${id}: ${error}`);
    }

    try {
      const outbox = await actor.getOutbox();
      outboxUrl = outbox?.toString();
    } catch (error) {
      logger.debug(`Failed to get outbox for actor ${id}: ${error}`);
    }

    try {
      const followers = await actor.getFollowers();
      followersUrl = followers?.toString();
    } catch (error) {
      logger.debug(`Failed to get followers for actor ${id}: ${error}`);
    }

    try {
      const following = await actor.getFollowing();
      followingUrl = following?.toString();
    } catch (error) {
      logger.debug(`Failed to get following for actor ${id}: ${error}`);
    }

    return {
      id,
      preferredUsername,
      name,
      summary,
      iconUrl,
      inboxUrl,
      outboxUrl,
      followersUrl,
      followingUrl,
      manuallyApprovesFollowers,
      type: actorType
    };
  }

  private actorDataToCreateExternalUserData(
    actorData: ActorData, 
    username: string, 
    domain: string
  ): CreateExternalUserData {
    return {
      username: actorData.preferredUsername || username,
      domain,
      actorId: actorData.id,
      displayName: actorData.name || actorData.preferredUsername || username,
      avatarUrl: actorData.iconUrl,
      bio: actorData.summary,
      inbox: actorData.inboxUrl,
      outbox: actorData.outboxUrl,
      followersUrl: actorData.followersUrl,
      followingUrl: actorData.followingUrl,
      isPrivate: actorData.manuallyApprovesFollowers || false
    };
  }

  private async tryFederationLookupWithFormats(
    username: string, 
    domain: string, 
    federationContext: Context<void | unknown>
  ): Promise<Actor | null> {
    const lookupFormats = [
      `${username}@${domain}`,
      `@${username}@${domain}`,
      `acct:${username}@${domain}`
    ];
    
    for (const format of lookupFormats) {
      try {
        const foundObject = await federationContext.lookupObject(format);
        if (isActor(foundObject)) {
          return foundObject;
        }
      } catch (formatError) {
        continue;
      }
    }
    
    return null;
  }

  private async createAndCacheExternalUser(
    actorData: ActorData, 
    username: string, 
    domain: string,
    currentUserActorId?: string
  ): Promise<UserResponse | null> {
    try {
      const createUserData = this.actorDataToCreateExternalUserData(actorData, username, domain);
      const cachedUser = await this.userService.createExternalUser(createUserData);
      
      return cachedUser ? this.userToUserResponse(cachedUser, currentUserActorId) : null;
    } catch (error) {
      logger.warn(`Failed to create external user ${username}@${domain}: ${error}`);
      return null;
    }
  }

  private async handleWebfingerLookup(
    username: string, 
    domain: string, 
    federationContext: Context<void | unknown>,
    currentUserActorId?: string
  ): Promise<UserResponse | null> {
    try {
      const existingExternalUser = await this.userService.findExternalUser(username, domain);
      if (existingExternalUser) {
        return this.userToUserResponse(existingExternalUser, currentUserActorId);
      }

      const foundActor = await this.tryFederationLookupWithFormats(username, domain, federationContext);
      
      if (foundActor) {
        const actorData = await this.extractActorData(foundActor, federationContext);
        return this.createAndCacheExternalUser(actorData, username, domain, currentUserActorId);
      } else {
        logger.warn(`Federation lookup failed for ${username}@${domain}, falling back to manual lookup`);
        const externalUser = await this.lookupExternalUser(username, domain);
        if (externalUser) {
          const cachedUser = await this.userService.findExternalUser(username, domain);
          return cachedUser ? this.userToUserResponse(cachedUser, currentUserActorId) : null;
        }
      }
      
      return null;
    } catch (error) {
      logger.warn(`Failed to lookup user ${username}@${domain}: ${error}`);
      return null;
    }
  }

  private extractUsernameFromActorUrl(actorUrl: string): { username: string; domain: string } | null {
    try {
      const url = new URL(actorUrl);
      const pathParts = url.pathname.split('/').filter(Boolean);
      const username = pathParts[pathParts.length - 1]?.startsWith('@') 
        ? pathParts[pathParts.length - 1].slice(1) 
        : pathParts[pathParts.length - 1];
      const domain = url.hostname;
      
      return username ? { username, domain } : null;
    } catch {
      return null;
    }
  }

  private async handleUrlBasedLookup(
    query: string, 
    federationContext: Context<void | unknown>,
    currentUserActorId?: string
  ): Promise<UserResponse | null> {
    try {
      const foundObject = await federationContext.lookupObject(query);
      if (!isActor(foundObject)) return null;

      const actorData = await this.extractActorData(foundObject, federationContext);

      const existingUser = await this.userService.findByActorId(actorData.id);
      if (existingUser) {
        return this.userToUserResponse(existingUser, currentUserActorId);
      }

      const urlInfo = this.extractUsernameFromActorUrl(actorData.id);
      if (urlInfo) {
        return this.createAndCacheExternalUser(actorData, urlInfo.username, urlInfo.domain, currentUserActorId);
      }
      
      return null;
    } catch (error) {
      logger.warn(`Direct federation lookup failed for ${query}: ${error}`);
      return null;
    }
  }

  private async getLocalUsers(
    query: string, 
    limit: number,
    currentUserActorId?: string
  ): Promise<UserResponse[]> {
    const localUsers = await this.userService.searchLocalUsers(query, limit);
    return Promise.all(localUsers.map(user => this.userToUserResponse(user, currentUserActorId)));
  }

  private async getUsersInLocalDatabase(
    query: string,
    limit: number,
    currentUserActorId?: string
  ): Promise<UserResponse[]> {
    const localUsers = await this.userService.searchUsersInLocalDatabase(query, limit);
    return Promise.all(localUsers.map(user => this.userToUserResponse(user, currentUserActorId)));
  }

  async searchAllUsers(query: string, page = 1, limit = 20, federationContext: Context<void | unknown>, currentUserActorId?: string): Promise<FederatedSearchResult> {
    const results: UserResponse[] = [];

    const webfingerMatch = query.match(/^@?([^@]+)@([^@]+)$/);
    
    if (webfingerMatch) {
      const [, username, domain] = webfingerMatch;
      const webfingerUser = await this.handleWebfingerLookup(username, domain, federationContext, currentUserActorId);
      
      if (webfingerUser) {
        results.push(webfingerUser);
      }
      
      const localUsers = await this.getLocalUsers(username, limit - results.length, currentUserActorId);
      
      for (const localUser of localUsers) {
        if (!results.find(u => u.activityPubId === localUser.activityPubId)) {
          results.push(localUser);
        }
      }
    } else {
      const localUsers = await this.getUsersInLocalDatabase(query, limit, currentUserActorId);
      results.push(...localUsers);

      if (query.startsWith('http://') || query.startsWith('https://')) {
        const urlUser = await this.handleUrlBasedLookup(query, federationContext, currentUserActorId);
        
        if (urlUser && !results.find(u => u.activityPubId === urlUser.activityPubId)) {
          results.push(urlUser);
        }
      }
    }

    return {
      users: results.slice(0, limit),
      hasMore: results.length > limit
    };
  }

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