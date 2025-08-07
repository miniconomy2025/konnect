export interface User {
  id: number;
  username: string;
  displayName: string;
  avatar: string;
}


export interface UserProfile {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  joinDate: Date;
  activityPubId: string;
  isPrivate: boolean;
  followingCount: number;
  followersCount: number;
  isFollowingCurrentUser: boolean;
  isFollowedByCurrentUser: boolean;
  isLocal: boolean;
  hostServer: string;
  handle: string;
}

export interface Actor {
  _id: string;
  username: string;
  actorId: string;
  displayName: string;
  avatarUrl: string;
}

export interface Activity {
  inboxId: string;
  object: {
    actorId: string;
    username?: string;
    displayName?: string;
    avatarUrl?: string;
  }; 
}

export interface FollowingItem {
  activity: Activity;
  actor: Actor;
  object: Actor;
}

export interface FollowsResponse {
  followers: FollowingItem[];
  following: FollowingItem[];
  limit: number;
  page: number;
}
