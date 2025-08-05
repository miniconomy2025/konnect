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
  avatar: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
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
  object: any; 
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
