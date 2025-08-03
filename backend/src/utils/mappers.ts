import { Follow, type Activity } from "@fedify/fedify";
import type { IFollowObject, IFollowObjectPopulated } from "../models/follows.ts";
import { type IInboxActivity, type IInboxActivityPopulated } from "../models/inbox.ts";
import type { InboxService } from "../services/inboxService.ts";
import type { UserService } from "../services/userService.ts";
import type { DisplayPersonActor } from "../types/inbox.ts";

export const inboxActivityToActivityPubActivity = (inboxActivity: IInboxActivityPopulated, index?: number, array?: IInboxActivityPopulated[]): Activity => {
  switch (inboxActivity.object.type) {
    case 'Follow':
      const actorUrl = new URL(inboxActivity.object.actor?.actorId || '');
      const objectUrl = new URL(inboxActivity.object.object?.actorId || '');
      return new Follow({
        summary: inboxActivity.object.summary,
        actor: actorUrl,
        object: objectUrl,
        id: new URL(inboxActivity.object.activityId)
      });
    default:
      throw new Error(`Unknown activity type or activity type not yet supported: ${inboxActivity.object.type}`);
  }
}

export const populateRemoteActivityActorReferences = async (
  activity: IInboxActivity,
  userService: UserService
): Promise<IInboxActivityPopulated> => {
  const { object, inboxId } = activity;
  const actorRef = object.actor.ref;
  const objectRef = object.object.ref;

  let newActor: DisplayPersonActor | { actorId: string } | undefined;
  if (actorRef && typeof actorRef === 'object' && 'username' in actorRef && 'actorId' in actorRef) {
    newActor = actorRef as unknown as DisplayPersonActor;
  } else {
    console.log("hgere2")
    newActor = await userService.getRemoteActorDisplay(object.actor.id);
    console.log("hgere")
  }

  let newObject: DisplayPersonActor | { actorId: string } | undefined;
  if (objectRef && typeof objectRef === 'object' && 'username' in objectRef && 'actorId' in objectRef) {
    newObject = objectRef as unknown as DisplayPersonActor;
  } else {
    console.log("hgere1")
    newObject = await userService.getRemoteActorDisplay(object.object.id);
  }

  const populatedActivity: IInboxActivityPopulated = {
    inboxId,
    object: {
      type: object.type,
      activityId: object.activityId,
      summary: object.summary,
      actor: newActor,
      object: newObject
    }
  };

  return populatedActivity;
}

export const populateRemoteFollowActorReferences = async (
  follow: IFollowObject,
  userService: UserService,
  inboxService: InboxService
): Promise<IFollowObjectPopulated> => {
  const { actor, object, activity } = follow;
  const actorRef = actor.ref;
  const objectRef = object.ref;
  const activityRef = activity.ref;

  let newActor: DisplayPersonActor | { actorId: string } | undefined;
  if (actorRef && typeof actorRef === 'object' && 'username' in actorRef && 'actorId' in actorRef) {
    newActor = actorRef as unknown as DisplayPersonActor;
  } else {
    newActor = await userService.getRemoteActorDisplay(actor.id);
  }

  let newObject: DisplayPersonActor | { actorId: string } | undefined;
  if (objectRef && typeof objectRef === 'object' && 'username' in objectRef && 'actorId' in objectRef) {
    newObject = objectRef as unknown as DisplayPersonActor;
  } else {
    newObject = await userService.getRemoteActorDisplay(object.id);
  }

  let newActivity: IInboxActivityPopulated | undefined;
  if (activityRef && typeof activityRef === 'object' && 'object' in activityRef && 'inboxId' in activityRef) {
    newActivity = activityRef as unknown as IInboxActivityPopulated;
  } else {
    const activityResult = await inboxService.getPopulatedInboxActivityByActivityId(activity.id);
    newActivity = activityResult || undefined;
  }

  const populatedFollow: IFollowObjectPopulated = {
    actor: newActor,
    object: newObject,
    activity: newActivity
  };

  return populatedFollow;
}