import { getLogger } from "@logtape/logtape";

const logger = getLogger("actor-parser");

export interface ParsedActor {
  id: string;
  type: string;
  preferredUsername: string;
  name?: string;
  summary?: string;
  icon?: {
    url: string;
    mediaType?: string;
  };
  image?: {
    url: string;
    mediaType?: string;
  };
  inbox: string;
  outbox?: string;
  followers?: string;
  following?: string;
  publicKey?: {
    id: string;
    owner: string;
    publicKeyPem: string;
  };
  endpoints?: {
    sharedInbox?: string;
  };
  url?: string; 
  discoverable?: boolean;
  indexable?: boolean;
  manuallyApprovesFollowers?: boolean;
  attachment?: any[]; 
}

export class ActorParser {
  
  /**
   * Safely parse an ActivityPub actor object from any platform
   */
  static parseActor(actorData: any): ParsedActor | null {
    try {
      if (!actorData.id || !actorData.type) {
        logger.warn("Actor missing required id or type field");
        return null;
      }

      const validTypes = ['Person', 'Service', 'Application', 'Group', 'Organization'];
      if (!validTypes.includes(actorData.type)) {
        logger.warn(`Unknown actor type: ${actorData.type}`);
      }

      const parsed: ParsedActor = {
        id: this.safeString(actorData.id),
        type: this.safeString(actorData.type),
        preferredUsername: this.extractUsername(actorData),
        inbox: this.safeString(actorData.inbox)
      };

      if (actorData.name) {
        parsed.name = this.safeString(actorData.name);
      }

      if (actorData.summary) {
        parsed.summary = this.sanitizeHtml(actorData.summary);
      }

      const iconUrl = this.extractIconUrl(actorData);
      if (iconUrl) {
        parsed.icon = {
          url: iconUrl,
          mediaType: this.extractIconMediaType(actorData)
        };
      }

      const imageUrl = this.extractImageUrl(actorData);
      if (imageUrl) {
        parsed.image = {
          url: imageUrl,
          mediaType: this.extractImageMediaType(actorData)
        };
      }

      if (actorData.outbox) {
        parsed.outbox = this.safeString(actorData.outbox);
      }

      if (actorData.followers) {
        parsed.followers = this.safeString(actorData.followers);
      }

      if (actorData.following) {
        parsed.following = this.safeString(actorData.following);
      }

      if (actorData.url) {
        parsed.url = this.safeString(actorData.url);
      }

      if (typeof actorData.discoverable === 'boolean') {
        parsed.discoverable = actorData.discoverable;
      }

      if (typeof actorData.manuallyApprovesFollowers === 'boolean') {
        parsed.manuallyApprovesFollowers = actorData.manuallyApprovesFollowers;
      }

      if (actorData.publicKey) {
        parsed.publicKey = this.parsePublicKey(actorData.publicKey);
      }

      if (actorData.endpoints?.sharedInbox) {
        parsed.endpoints = {
          sharedInbox: this.safeString(actorData.endpoints.sharedInbox)
        };
      }

      logger.debug(`Successfully parsed actor: ${parsed.preferredUsername}`);
      return parsed;

    } catch (error) {
      logger.error("Failed to parse actor:");
      return null;
    }
  }

  /**
   * Extract username, handling different platform conventions
   */
  private static extractUsername(actorData: any): string {
    if (actorData.preferredUsername) {
      return this.safeString(actorData.preferredUsername);
    }

    if (actorData.name) {
      return this.safeString(actorData.name).replace(/\s+/g, '').toLowerCase();
    }

    try {
      const url = new URL(actorData.id);
      const pathParts = url.pathname.split('/').filter(Boolean);
      return pathParts[pathParts.length - 1] || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Extract icon URL, handling different platform formats
   */
  private static extractIconUrl(actorData: any): string | null {
    if (actorData.icon?.url) {
      return this.safeString(actorData.icon.url);
    }

    if (Array.isArray(actorData.icon) && actorData.icon[0]?.url) {
      return this.safeString(actorData.icon[0].url);
    }

    if (typeof actorData.icon === 'string') {
      return this.safeString(actorData.icon);
    }

    if (actorData.avatar) {
      return this.safeString(actorData.avatar);
    }

    return null;
  }

  private static extractIconMediaType(actorData: any): string | undefined {
    if (actorData.icon?.mediaType) {
      return this.safeString(actorData.icon.mediaType);
    }
    if (Array.isArray(actorData.icon) && actorData.icon[0]?.mediaType) {
      return this.safeString(actorData.icon[0].mediaType);
    }
    return undefined;
  }

  /**
   * Extract header/banner image URL
   */
  private static extractImageUrl(actorData: any): string | null {
    if (actorData.image?.url) {
      return this.safeString(actorData.image.url);
    }

    if (Array.isArray(actorData.image) && actorData.image[0]?.url) {
      return this.safeString(actorData.image[0].url);
    }

    if (actorData.header) {
      return this.safeString(actorData.header);
    }

    return null;
  }

  private static extractImageMediaType(actorData: any): string | undefined {
    if (actorData.image?.mediaType) {
      return this.safeString(actorData.image.mediaType);
    }
    if (Array.isArray(actorData.image) && actorData.image[0]?.mediaType) {
      return this.safeString(actorData.image[0].mediaType);
    }
    return undefined;
  }

  /**
   * Parse public key information
   */
  private static parsePublicKey(publicKeyData: any): ParsedActor['publicKey'] | undefined {
    if (!publicKeyData.id || !publicKeyData.owner || !publicKeyData.publicKeyPem) {
      return undefined;
    }

    return {
      id: this.safeString(publicKeyData.id),
      owner: this.safeString(publicKeyData.owner),
      publicKeyPem: this.safeString(publicKeyData.publicKeyPem)
    };
  }

  /**
   * Safely convert value to string, handling various input types
   */
  private static safeString(value: any): string {
    if (typeof value === 'string') {
      return value.trim();
    }
    if (value && typeof value.toString === 'function') {
      return value.toString().trim();
    }
    return '';
  }

  /**
   * Basic HTML sanitization for bio/summary fields
   */
  private static sanitizeHtml(html: string): string {
    if (!html) return '';
    
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/javascript:/gi, '')
      .trim();
  }

  /**
   * Validate that required URLs are actually URLs
   */
  static validateActorUrls(actor: ParsedActor): boolean {
    try {
      new URL(actor.id);
      new URL(actor.inbox);
      
      if (actor.outbox) new URL(actor.outbox);
      if (actor.followers) new URL(actor.followers);
      if (actor.following) new URL(actor.following);
      if (actor.icon?.url) new URL(actor.icon.url);
      if (actor.image?.url) new URL(actor.image.url);
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Platform-specific adjustments
   */
  static applyPlatformSpecificFixes(actor: ParsedActor, domain: string): ParsedActor {
    if (domain.includes('mastodon') || actor.type === 'Person') {
      if (!actor.outbox && actor.id) {
        actor.outbox = `${actor.id}/outbox`;
      }
    }

    // we can place platform specific fixes here if required

    return actor;
  }
}