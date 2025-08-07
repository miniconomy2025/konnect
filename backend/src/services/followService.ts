import { FollowModel, type IFollowObject, type IFollowObjectPopulated } from '../models/follows.ts';
import type { CreateFollow } from '../types/follow.ts';
import { populateRemoteFollowActorReferences } from '../utils/mappers.ts';
import { InboxService } from './inboxService.ts';
import { UserService } from './userService.ts';
import { RedisService } from './redisService.ts';
import { ActivityService } from './activityservice.ts';
import { Neo4jService } from './neo4jService.ts';

export class FollowService {
  private activityService = new ActivityService();
  private redisService = RedisService.getInstance();
  private neo4jService = new Neo4jService();

  constructor(private readonly userService: UserService, private readonly InboxService: InboxService) {
  }

  private population = [
    { path: 'actor.ref', select: 'username displayName avatarUrl actorId' },
    { path: 'object.ref', select: 'username displayName avatarUrl actorId' },
    { path: 'activity.ref', select: 'inboxId object' }
  ]
  
  async persistFollow(followCreateObject: CreateFollow): Promise<IFollowObjectPopulated> {
    const follow = new FollowModel({
      ...followCreateObject
    });

    await follow.save();

    // Invalidate caches for both users
    await this.redisService.invalidateFollowCaches(
      followCreateObject.actor.id,
      followCreateObject.object.id
    );

    // Sync to Neo4j
    await this.neo4jService.createFollowRelationship(
      followCreateObject.actor.id,
      followCreateObject.object.id
    );

    const populatedFollow = await FollowModel.findById(follow._id)
      .populate(this.population)
      .lean();

    if (!populatedFollow) {
      throw new Error('Failed to populate follow after saving');
    }

    return populateRemoteFollowActorReferences(populatedFollow, this.userService, this.InboxService);
  }

  async removeFollow(actorId: string, objectId: string): Promise<boolean> {
    const result = await FollowModel.deleteOne({ 
      'actor.id': actorId, 
      'object.id': objectId 
    });

    if (result.deletedCount > 0) {
      // Invalidate caches for both users
      await this.redisService.invalidateFollowCaches(actorId, objectId);
      
      // Remove from Neo4j
      await this.neo4jService.removeFollowRelationship(actorId, objectId);
      
      return true;
    }
    return false;
  }

  async isFollowing(actorId: string, objectId: string): Promise<boolean> {
    const follow = await FollowModel.findOne({ 
      'actor.id': actorId, 
      'object.id': objectId 
    });
    return !!follow;
  }

  async getFollowById(id: string): Promise<IFollowObjectPopulated | null> {
    const follow = await FollowModel.findById(id).populate(this.population).lean();

    if (!follow) {
      return null;
    }

    return populateRemoteFollowActorReferences(follow, this.userService, this.InboxService);
  }

  async getFollowByActivityId(activityId: string): Promise<IFollowObjectPopulated | null> {
    const follow = await FollowModel.findOne({ 'activity.id': activityId }).populate(this.population).lean();

    if (!follow) {
      return null;
    }

    return populateRemoteFollowActorReferences(follow, this.userService, this.InboxService);
  }

  async getPopulatedFollowByActorIdAndObjectId(actorId: string, objectId: string): Promise<IFollowObjectPopulated | null> {
    const follow = await FollowModel.findOne({ 'actor.id': actorId, 'object.id': objectId }).populate(this.population).lean();

    if (!follow) {
      return null;
    }

    return populateRemoteFollowActorReferences(follow, this.userService, this.InboxService);
  }

  async getPopulatedFollowsByActorId(actorId: string, page?: number, limit?: number): Promise<IFollowObjectPopulated[]> {
    let follows: IFollowObject[] = [];

    if (page && limit) {
      follows = await FollowModel.find({ 'actor.id': actorId })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate(this.population)
        .lean();
    } else {
      follows = await FollowModel.find({ 'actor.id': actorId })
        .populate(this.population)
        .lean();
    }

    return Promise.all(follows.map(follow => populateRemoteFollowActorReferences(follow, this.userService, this.InboxService)));
  }

  async getPopulatedFollowsByObjectId(objectId: string, page?: number, limit?: number): Promise<IFollowObjectPopulated[]> {
    let follows: IFollowObject[] = [];

    if (page && limit) {
      follows = await FollowModel.find({ 'object.id': objectId })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate(this.population)
        .lean();
    } else {
      follows = await FollowModel.find({ 'object.id': objectId })
        .populate(this.population)
        .lean();
    }

    return Promise.all(follows.map(follow => populateRemoteFollowActorReferences(follow, this.userService, this.InboxService)));
  }

  async getFollowingActorIds(actorId: string): Promise<string[]> {
    // Try to get from cache first
    const cachedFollowing = await this.redisService.getCachedFollowingList(actorId);
    if (cachedFollowing.length > 0) {
      return cachedFollowing;
    }

    // If not in cache, get from database
    const follows = await FollowModel.find({ 'actor.id': actorId }).lean();
    const followingIds = follows.map(follow => follow.object.id);

    // Cache the results
    await this.redisService.cacheFollowingList(actorId, followingIds);

    return followingIds;
  }

  async getFollowerActorIds(objectId: string): Promise<string[]> {
    // Try to get from cache first
    const cachedFollowers = await this.redisService.getCachedFollowersList(objectId);
    if (cachedFollowers.length > 0) {
      return cachedFollowers;
    }

    // If not in cache, get from database
    const follows = await FollowModel.find({ 'object.id': objectId }).lean();
    const followerIds = follows.map(follow => follow.actor.id);

    // Cache the results
    await this.redisService.cacheFollowersList(objectId, followerIds);

    return followerIds;
  }

  async getFollowCounts(actorId: string): Promise<{ followingCount: number; followersCount: number }> {
    // Try to get from cache first
    const cachedCounts = await this.redisService.getCachedFollowCounts(actorId);
    if (cachedCounts) {
      return {
        followingCount: cachedCounts.following,
        followersCount: cachedCounts.followers
      };
    }

    // If not in cache, get from database
    const [followingCount, followersCount] = await Promise.all([
      FollowModel.countDocuments({ 'actor.id': actorId }),
      FollowModel.countDocuments({ 'object.id': actorId })
    ]);

    // Cache the results
    await this.redisService.cacheFollowCounts(actorId, followingCount, followersCount);

    return { followingCount, followersCount };
  }
}