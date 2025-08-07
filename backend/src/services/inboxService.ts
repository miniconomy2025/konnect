import mongoose from 'mongoose';
import { InboxActivity, type IActivityObject, type IInboxActivityPopulated } from '../models/inbox.ts';
import type { CreateActivityObject } from '../types/inbox.ts';
import { populateRemoteActivityActorReferences } from '../utils/mappers.ts';
import { FollowService } from './followService.ts';
import { UserService } from './userService.ts';
import { Neo4jService } from './neo4jService.ts';
import type { IExternalPost } from '../models/externalPost.js';

export class InboxService {
  private readonly userService = new UserService();
  private readonly followService = new FollowService(this.userService, this);
  private readonly domain = process.env.DOMAIN || 'localhost:8000';
  private readonly protocol = this.domain.includes('localhost') ? 'http' : 'https';
  private readonly baseUrl = `${this.protocol}://${this.domain}`;
  private readonly neo4jService = new Neo4jService();

  async persistInboxActivityObject(activityObject: CreateActivityObject): Promise<IInboxActivityPopulated> {
    switch (activityObject.type) {
      case 'Follow':
        return this.persistFollowActivity(activityObject);
      case 'Create':
        return this.persistCreateActivity(activityObject);
      case 'Delete':
        return this.persistDeleteActivity(activityObject);
      case 'Undo':
        return this.persistUndoActivity(activityObject);
      case 'Update':
        return this.persistUpdateActivity(activityObject);
      default:
        throw new Error(`Unknown activity type: ${activityObject.type}`);
    }
  }
      
  private async persistFollowActivity(activityObject: CreateActivityObject): Promise<IInboxActivityPopulated> {
    const localActivityId = new mongoose.Types.ObjectId().toString();
    const objectId = new mongoose.Types.ObjectId();

    let objectUser = await this.userService.findByActorId(activityObject.object);
    let inboxId: string;
    let inboxActivityId: string;
    
    if (!objectUser) {
      const remoteActor = await this.userService.getRemoteActorDisplay(activityObject.object);
      if (!remoteActor) {
        throw new Error('User not found. For incoming following activities, the object must be a user of this server or a remote actor.');
      } else {
        inboxId = `${remoteActor.actorId}/inbox`;
        inboxActivityId = activityObject.activityId || `${this.baseUrl}/activities/${localActivityId}`;
      }
    } else {
      inboxId = `${objectUser.actorId}/inbox`;
      inboxActivityId = activityObject.activityId || `${this.baseUrl}/activities/${localActivityId}`;
    }

    let actorUser = await this.userService.findByActorId(activityObject.actor);
    if (!actorUser) {
      const remoteActor = await this.userService.getRemoteActorDisplay(activityObject.actor);
      if (!remoteActor) {
        throw new Error('User not found. For incoming following activities, the actor must be a user of this server or a remote actor.');
      }
    }

    const existingFollow = await this.followService.getPopulatedFollowByActorIdAndObjectId(activityObject.actor, activityObject.object);

    if (existingFollow) {
      throw new Error('Follow already exists');
    }

    if (activityObject.activityId) {
      const existingActivity = await InboxActivity.findOne({
        'object.activityId': inboxActivityId
      });
      if (existingActivity) {
        throw new Error('Activity already exists');
      }
    }

    const inboxActivity = new InboxActivity({
      inboxId: inboxId,
      object: {
        _id: objectId,
        type: activityObject.type,
        summary: activityObject.summary,
        actor: {
          id: activityObject.actor,
          ref: actorUser ? actorUser._id : undefined
        },
        object: {
          id: activityObject.object,
          ref: objectUser ? objectUser._id : undefined
        },
        target: activityObject.target,
        origin: activityObject.activityId,
        activityId: inboxActivityId,
      }
    });

    await this.followService.persistFollow({
      actor: {
        id: activityObject.actor,
        ref: actorUser ? actorUser._id : undefined
      },
      object: {
        id: activityObject.object,
        ref: objectUser ? objectUser._id : undefined
      },
      activity: {
        id: inboxActivityId,
        ref: objectId
      }
    });
    
    const savedActivity = await inboxActivity.save();
    
    const populatedActivity = await InboxActivity.findOne({ _id: savedActivity._id })
      .populate([
        { path: 'object.actor.ref', select: 'username displayName avatarUrl actorId' },
        { path: 'object.object.ref', select: 'username displayName avatarUrl actorId' }
      ])
      .lean();
    
    if (!populatedActivity) {
      throw new Error('Failed to populate activity after saving');
    }
    
    return populateRemoteActivityActorReferences(populatedActivity, this.userService);
  }

  
async persistCreateActivity(activityObject: CreateActivityObject): Promise<IInboxActivityPopulated> {
    const localActivityId = new mongoose.Types.ObjectId().toString();
    const objectId = new mongoose.Types.ObjectId();

    let actorUser = await this.userService.findByActorId(activityObject.actor);
    
    if (!actorUser) {
      const remoteActor = await this.userService.getRemoteActorDisplay(activityObject.actor);
      if (!remoteActor) {
        throw new Error('Actor not found for Create activity');
      }
    }

    const inboxId = actorUser ? 
      `${actorUser.actorId}/inbox` : 
      `${this.baseUrl}/shared/inbox`;
    const inboxActivityId = `${this.baseUrl}/activities/${localActivityId}`;

    if (activityObject.activityId) {
      const existingActivity = await InboxActivity.findOne({
        'object.origin': activityObject.activityId
      });
      if (existingActivity) {
        throw new Error('Activity already exists');
      }
    }

    try {
      await this.processAndStoreExternalPost(activityObject);
    } catch (error) {
      console.warn('Failed to process external post content:', error);
    }

    const inboxActivity = new InboxActivity({
      inboxId: inboxId,
      object: {
        _id: objectId,
        type: activityObject.type,
        summary: activityObject.summary,
        actor: {
          id: activityObject.actor,
          ref: actorUser ? actorUser._id : undefined
        },
        object: {
          id: activityObject.object,
          ref: null 
        },
        target: activityObject.target,
        origin: activityObject.activityId,
        activityId: inboxActivityId,
      }
    });
    
    const savedActivity = await inboxActivity.save();
    
    const populatedActivity = await InboxActivity.findOne({ _id: savedActivity._id })
      .populate([
        { path: 'object.actor.ref', select: 'username displayName avatarUrl actorId' },
        { path: 'object.object.ref', select: 'username displayName avatarUrl actorId' }
      ])
      .lean();
    
    if (!populatedActivity) {
      throw new Error('Failed to populate activity after saving');
    }
    
    return populateRemoteActivityActorReferences(populatedActivity, this.userService);
  }

  private async processAndStoreExternalPost(activityObject: CreateActivityObject): Promise<void> {
    try {
      const { ExternalPost } = await import('../models/externalPost.js');
      const { PostParser } = await import('./postParser.js');
      
      const postData = await this.fetchActivityPubObject(activityObject.object);
      if (!postData) {
        console.warn(`Could not fetch post object: ${activityObject.object}`);
        return;
      }

      const parsedPost = PostParser.parsePost(postData);
      if (!parsedPost || !PostParser.validatePost(parsedPost)) {
        console.warn(`Failed to parse post: ${activityObject.object}`);
        return;
      }

      const existingPost = await ExternalPost.findOne({ 
        objectId: activityObject.object 
      });
      
      if (existingPost) {
        console.log(`External post already exists: ${activityObject.object}`);
        return;
      }

      const externalPost = new ExternalPost({
        activityId: activityObject.activityId || parsedPost.id,
        actorId: activityObject.actor,
        objectId: activityObject.object,
        content: parsedPost.content,
        contentText: parsedPost.contentText,
        summary: parsedPost.summary,
        published: parsedPost.published,
        updated: parsedPost.updated,
        url: parsedPost.url,
        inReplyTo: parsedPost.inReplyTo,
        attachments: parsedPost.attachments,
        mentions: parsedPost.mentions,
        tags: parsedPost.tags,
        to: parsedPost.to,
        cc: parsedPost.cc,
        likesCount: parsedPost.likes || 0,
        sharesCount: parsedPost.shares || 0,
        repliesCount: parsedPost.replies || 0,
        platformType: parsedPost.platformType
      });

      const savedPost = await externalPost.save() as IExternalPost & { _id: mongoose.Types.ObjectId };

        await this.neo4jService.createPost(
            savedPost._id.toString(),
            savedPost!.actorId,
            externalPost.createdAt.getTime()
        );

      
    } catch (error) {
      throw error;
    }
  }

  async persistDeleteActivity(activityObject: CreateActivityObject): Promise<IInboxActivityPopulated> {
    const localActivityId = new mongoose.Types.ObjectId().toString();
    const objectId = new mongoose.Types.ObjectId();

    let actorUser = await this.userService.findByActorId(activityObject.actor);
    
    if (!actorUser) {
      const remoteActor = await this.userService.getRemoteActorDisplay(activityObject.actor);
      if (!remoteActor) {
        throw new Error('Actor not found for Delete activity');
      }
    }

    const inboxId = actorUser ? 
      `${actorUser.actorId}/inbox` : 
      `${this.baseUrl}/shared/inbox`;
    const inboxActivityId = `${this.baseUrl}/activities/${localActivityId}`;

    if (activityObject.activityId) {
      const existingActivity = await InboxActivity.findOne({
        'object.origin': activityObject.activityId
      });
      if (existingActivity) {
        throw new Error('Activity already exists');
      }
    }

    const inboxActivity = new InboxActivity({
      inboxId: inboxId,
      object: {
        _id: objectId,
        type: activityObject.type,
        summary: activityObject.summary,
        actor: {
          id: activityObject.actor,
          ref: actorUser ? actorUser._id : undefined
        },
        object: {
          id: activityObject.object,
          ref: null 
        },
        target: activityObject.target,
        origin: activityObject.activityId,
        activityId: inboxActivityId,
      }
    });
    
    const savedActivity = await inboxActivity.save();
    
    const populatedActivity = await InboxActivity.findOne({ _id: savedActivity._id })
      .populate([
        { path: 'object.actor.ref', select: 'username displayName avatarUrl actorId' },
        { path: 'object.object.ref', select: 'username displayName avatarUrl actorId' }
      ])
      .lean();
    
    if (!populatedActivity) {
      throw new Error('Failed to populate activity after saving');
    }
    
    return populateRemoteActivityActorReferences(populatedActivity, this.userService);
  }

  async persistUndoActivity(activityObject: CreateActivityObject): Promise<IInboxActivityPopulated> {
    const localActivityId = new mongoose.Types.ObjectId().toString();
    const objectId = new mongoose.Types.ObjectId();

    let actorUser = await this.userService.findByActorId(activityObject.actor);
    
    if (!actorUser) {
      const remoteActor = await this.userService.getRemoteActorDisplay(activityObject.actor);
      if (!remoteActor) {
        throw new Error('Actor not found for Undo activity');
      }
    }

    const inboxId = actorUser ? 
      `${actorUser.actorId}/inbox` : 
      `${this.baseUrl}/shared/inbox`;
    const inboxActivityId = activityObject.activityId || `${this.baseUrl}/activities/${localActivityId}`;

    if (activityObject.activityId) {
      const existingActivity = await InboxActivity.findOne({
        'object.origin': activityObject.activityId
      });
      if (existingActivity) {
        throw new Error('Activity already exists');
      }
    }

    const inboxActivity = new InboxActivity({
      inboxId: inboxId,
      object: {
        _id: objectId,
        type: activityObject.type,
        summary: activityObject.summary,
        actor: {
          id: activityObject.actor,
          ref: actorUser ? actorUser._id : undefined
        },
        object: {
          id: activityObject.object,
          ref: null 
        },
        target: activityObject.target,
        origin: activityObject.activityId,
        activityId: inboxActivityId,
      }
    });
    
    const savedActivity = await inboxActivity.save();
    
    const populatedActivity = await InboxActivity.findOne({ _id: savedActivity._id })
      .populate([
        { path: 'object.actor.ref', select: 'username displayName avatarUrl actorId' },
        { path: 'object.object.ref', select: 'username displayName avatarUrl actorId' }
      ])
      .lean();
    
    if (!populatedActivity) {
      throw new Error('Failed to populate activity after saving');
    }
    
    return populateRemoteActivityActorReferences(populatedActivity, this.userService);
  }

  async persistUpdateActivity(activityObject: CreateActivityObject): Promise<IInboxActivityPopulated> {
    const localActivityId = new mongoose.Types.ObjectId().toString();
    const objectId = new mongoose.Types.ObjectId();

    let actorUser = await this.userService.findByActorId(activityObject.actor);
    
    if (!actorUser) {
      const remoteActor = await this.userService.getRemoteActorDisplay(activityObject.actor);
      if (!remoteActor) {
        throw new Error('Actor not found for Update activity');
      }
    }

    const inboxId = actorUser ? 
      `${actorUser.actorId}/inbox` : 
      `${this.baseUrl}/shared/inbox`;
    const inboxActivityId = activityObject.activityId || `${this.baseUrl}/activities/${localActivityId}`;

    if (activityObject.activityId) {
      const existingActivity = await InboxActivity.findOne({
        'object.origin': activityObject.activityId
      });
      if (existingActivity) {
        throw new Error('Activity already exists');
      }
    }

    const inboxActivity = new InboxActivity({
      inboxId: inboxId,
      object: {
        _id: objectId,
        type: activityObject.type,
        summary: activityObject.summary,
        actor: {
          id: activityObject.actor,
          ref: actorUser ? actorUser._id : undefined
        },
        object: {
          id: activityObject.object,
          ref: null 
        },
        target: activityObject.target,
        origin: activityObject.activityId,
        activityId: inboxActivityId,
      }
    });
    
    const savedActivity = await inboxActivity.save();
    
    const populatedActivity = await InboxActivity.findOne({ _id: savedActivity._id })
      .populate([
        { path: 'object.actor.ref', select: 'username displayName avatarUrl actorId' },
        { path: 'object.object.ref', select: 'username displayName avatarUrl actorId' }
      ])
      .lean();
    
    if (!populatedActivity) {
      throw new Error('Failed to populate activity after saving');
    }
    
    return populateRemoteActivityActorReferences(populatedActivity, this.userService);
  }

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
      console.warn(`Failed to fetch ActivityPub object ${url}:`, error);
      return null;
    }
  }
  
  async defaultActivitySummary(type: string, actorUrl: string, objectUrl: string): Promise<string | undefined> {
    switch (type) {
      case 'Follow':
        let actor = await this.userService.findDisplayActorById(actorUrl);
        let object = await this.userService.findDisplayActorById(objectUrl);
    
        if (!actor) {
          actor = await this.userService.getRemoteActorDisplay(actorUrl);
        }
    
        if (!object) {
          object = await this.userService.getRemoteActorDisplay(objectUrl);
        }
        return `${actor?.displayName || actor?.username || actor?.actorId || 'Some user'} followed ${object?.displayName || object?.username || object?.actorId || 'some other user'}`;
      default:
        return undefined;
    }
  }

  async getInboxActivityByActivityId(id: string): Promise<IActivityObject | null> {
    return InboxActivity.findOne({
      'object.activityId': id.toString()
    });
  }

  async getInboxActivityById(id: string): Promise<IActivityObject | null> {
    return InboxActivity.findById(id);
  }

  async getPopulatedInboxActivityByActivityId(id: string): Promise<IInboxActivityPopulated | null> {
    const activity = await InboxActivity.findOne({ 'object.activityId': id.toString() })
      .populate([
        { path: 'object.actor.ref', select: 'username displayName avatarUrl actorId' },
        { path: 'object.object.ref', select: 'username displayName avatarUrl actorId' }
      ])
      .lean();

    if (!activity) {
      return null;
    }
    return populateRemoteActivityActorReferences(activity, this.userService);
  }

  async getPaginatedInboxActivities(username: string, page = 1, limit = 20): Promise<IInboxActivityPopulated[]> {
    const inboxId = `${this.baseUrl}/users/${username}/inbox`;

    const activities = await InboxActivity.find({ inboxId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate([
        { path: 'object.actor.ref', select: 'username displayName avatarUrl actorId' },
        { path: 'object.object.ref', select: 'username displayName avatarUrl actorId' }
      ])
      .lean();

    return Promise.all(
      activities.map((activity) => populateRemoteActivityActorReferences(activity, this.userService))
    );
  }
}