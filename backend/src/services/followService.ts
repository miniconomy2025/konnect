import { FollowModel, type IFollowObject, type IFollowObjectPopulated } from '../models/follows.ts';
import type { CreateFollow } from '../types/follow.ts';
import { populateRemoteFollowActorReferences } from '../utils/mappers.ts';
import { InboxService } from './inboxService.ts';
import { UserService } from './userService.ts';

export class FollowService {

  constructor(private readonly userService: UserService, private readonly InboxService: InboxService) {}

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

    const populatedFollow = await FollowModel.findById(follow._id)
      .populate(this.population)
      .lean();

    if (!populatedFollow) {
      throw new Error('Failed to populate follow after saving');
    }

    return populateRemoteFollowActorReferences(populatedFollow, this.userService, this.InboxService);
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

  async getFollowsByObjectId(objectId: string, page: number, limit: number) {
    const follows = await FollowModel.find({ 'object.id': objectId })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate(this.population)
      .lean();

    return follows;
  }
}