export const activityTypes = ['Follow', 'Create'] as const;
export type ActivityType = typeof activityTypes[number];

export interface CreateActivityObject {
  type: ActivityType;
  summary?: string;
  actor: string;
  object: string;
  target?: string;
  origin?: string;
  activityId?: string;
}

export interface InboxActivityResponse {
  summary?: string;
  type: ActivityType;
}

export type DisplayPersonActor = {
  actorId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
}

export interface InboxFollowActivityResponse extends InboxActivityResponse {
  follower: DisplayPersonActor | { actorId: string };
  followed: DisplayPersonActor | { actorId: string };
}