import { getLogger } from "@logtape/logtape";

const logger = getLogger("post-parser");

export interface ParsedAttachment {
  type: 'image' | 'video' | 'audio' | 'document' | 'unknown';
  url: string;
  mediaType?: string;
  width?: number;
  height?: number;
  duration?: number;
  description?: string; 
}

export interface ParsedMention {
  href: string;
  name: string; 
}

export interface ParsedTag {
  type: 'Hashtag' | 'Mention' | 'Emoji';
  name: string;
  href?: string;
  icon?: string; 
}

export interface ParsedPost {
  id: string;
  type: string;
  content: string; 
  contentText: string; 
  summary?: string; 
  published: Date;
  updated?: Date | null;
  url?: string; 
  inReplyTo?: string; 
  
  attributedTo: string; 
  
  to: string[];
  cc?: string[];

  attachments: ParsedAttachment[];
  mentions: ParsedMention[];
  tags: ParsedTag[];
 
  replies?: number;
  likes?: number;
  shares?: number;

  language?: string;
  
  platformType?: string;
}

export class PostParser {
  
  static parsePost(activityData: any): ParsedPost | null {
    try {
      let noteData = activityData;
      if (activityData.type === 'Create' && activityData.object) {
        noteData = activityData.object;
      }

      if (!noteData.id || !noteData.type) {
        logger.warn("Post missing required id or type field");
        return null;
      }

      const supportedTypes = ['Note', 'Article'];
      if (!supportedTypes.includes(noteData.type)) {
        logger.warn(`Unsupported post type: ${noteData.type}`);
        return null;
      }

      const platformType = this.detectPlatform(noteData);
      
      const parsed: ParsedPost = {
        id: this.safeString(noteData.id),
        type: this.safeString(noteData.type),
        content: this.extractContent(noteData),
        contentText: this.extractPlainText(noteData),
        published: this.parseDate(noteData.published) || new Date(),
        attributedTo: this.safeString(noteData.attributedTo),
        to: this.extractAudience(noteData.to),
        attachments: this.parseAttachments(noteData.attachment, platformType),
        mentions: this.parseMentions(noteData.tag),
        tags: this.parseTags(noteData.tag),
        platformType
      };

      if (noteData.summary) {
        parsed.summary = this.sanitizeHtml(noteData.summary);
      }

      if (noteData.updated) {
        parsed.updated = this.parseDate(noteData.updated);
      }

      if (noteData.url) {
        parsed.url = this.safeString(noteData.url);
      }

      if (noteData.inReplyTo) {
        parsed.inReplyTo = this.safeString(noteData.inReplyTo);
      }

      if (noteData.cc) {
        parsed.cc = this.extractAudience(noteData.cc);
      }

      this.applyPlatformSpecificParsing(parsed, noteData, platformType);

      logger.debug(`Successfully parsed post: ${parsed.id}`);
      return parsed;

    } catch (error) {
      logger.error("Failed to parse post:");
      return null;
    }
  }

  private static detectPlatform(noteData: any): ParsedPost['platformType'] {
    const id = noteData.id || '';
    
    if (id.includes('mastodon')) return 'mastodon';
    
    
    return 'unknown';
  }

  private static extractContent(noteData: any): string {
    if (noteData.content) {
      return this.sanitizeHtml(noteData.content);
    }

    if (noteData.contentMap) {
      const content = noteData.contentMap.en || 
                     noteData.contentMap[Object.keys(noteData.contentMap)[0]];
      if (content) return this.sanitizeHtml(content);
    }

    if (noteData.name) {
      return this.sanitizeHtml(noteData.name);
    }

    return '';
  }

  private static extractPlainText(noteData: any): string {
    const html = this.extractContent(noteData);
    
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .trim();
  }

  private static parseAttachments(attachments: any, platformType: ParsedPost['platformType']): ParsedAttachment[] {
    if (!Array.isArray(attachments)) {
      if (attachments) {
        attachments = [attachments];
      } else {
        return [];
      }
    }

    return attachments.map(attachment => {
      const parsed: ParsedAttachment = {
        type: this.getAttachmentType(attachment.mediaType || attachment.type),
        url: this.safeString(attachment.url || attachment.href)
      };

      if (attachment.mediaType) {
        parsed.mediaType = attachment.mediaType;
      }

      if (attachment.width) parsed.width = parseInt(attachment.width);
      if (attachment.height) parsed.height = parseInt(attachment.height);
      if (attachment.duration) parsed.duration = parseInt(attachment.duration);
      
      if (attachment.name || attachment.summary) {
        parsed.description = attachment.name || attachment.summary;
      }

      return parsed;
    }).filter(a => a.url); 
  }

  private static getAttachmentType(mediaType: string): ParsedAttachment['type'] {
    if (!mediaType) return 'unknown';
    
    const type = mediaType.toLowerCase();
    
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
    
    return 'unknown';
  }

  private static parseMentions(tags: any[]): ParsedMention[] {
    if (!Array.isArray(tags)) return [];
    
    return tags
      .filter(tag => tag.type === 'Mention')
      .map(tag => ({
        href: this.safeString(tag.href),
        name: this.safeString(tag.name)
      }))
      .filter(mention => mention.href && mention.name);
  }

  private static parseTags(tags: any[]): ParsedTag[] {
    if (!Array.isArray(tags)) return [];
    
    return tags
      .filter(tag => ['Hashtag', 'Emoji'].includes(tag.type))
      .map(tag => {
        const parsed: ParsedTag = {
          type: tag.type,
          name: this.safeString(tag.name)
        };

        if (tag.href) parsed.href = this.safeString(tag.href);
        if (tag.icon?.url) parsed.icon = this.safeString(tag.icon.url);

        return parsed;
      })
      .filter(tag => tag.name);
  }

  private static extractAudience(audience: any): string[] {
    if (!audience) return [];
    
    if (Array.isArray(audience)) {
      return audience.map(a => this.safeString(a)).filter(Boolean);
    }
    
    return [this.safeString(audience)].filter(Boolean);
  }

  private static applyPlatformSpecificParsing(
    parsed: ParsedPost, 
    noteData: any, 
    platformType: ParsedPost['platformType']
  ): void {
    switch (platformType) {
      case 'mastodon':
        if (noteData.replies) parsed.replies = parseInt(noteData.replies);
        break;
    }
  }

  private static parseDate(dateStr: any): Date | null {
    if (!dateStr) return null;
    
    try {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  }

  private static safeString(value: any): string {
    if (typeof value === 'string') return value.trim();
    if (value && typeof value.toString === 'function') {
      return value.toString().trim();
    }
    return '';
  }

  private static sanitizeHtml(html: string): string {
    if (!html) return '';
    
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/javascript:/gi, '')
      .trim();
  }

  static validatePost(post: ParsedPost): boolean {
    try {
      if (!post.id || (!post.content && post.attachments.length === 0)) {
        return false;
      }

      new URL(post.id);
      if (post.url) new URL(post.url);
      
      if (isNaN(post.published.getTime())) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }
}