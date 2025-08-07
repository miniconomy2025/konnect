export interface CreateUserData {
  googleId: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  keyPairs: {
    privateKey: JsonWebKey;
    publicKey: JsonWebKey;
  }[]
}

export interface UserResponse {
  username: string,
  displayName: string,
  bio: string | undefined,
  avatarUrl: string | undefined,
  joinDate: Date,
  activityPubId: string,
  isPrivate: boolean,
  followingCount: number,
  followersCount: number,
  isFollowingCurrentUser: boolean,
  isFollowedByCurrentUser: boolean,
  isLocal: boolean,
  hostServer: string,
  handle: string,
}
export interface ExternalUser {
  username: string;
  domain: string;
  displayName?: string;
  avatarUrl?: string;
  actorId: string;
  isLocal: boolean;
  bio?: string;
  isPrivate?: boolean;
}

export interface ActorData {
  readonly id: string;
  readonly preferredUsername: string;
  readonly name?: string;
  readonly summary?: string;
  readonly iconUrl?: string;
  readonly inboxUrl?: string;
  readonly outboxUrl?: string;
  readonly followersUrl?: string;
  readonly followingUrl?: string;
  readonly manuallyApprovesFollowers?: boolean;
  readonly type: 'Person' | 'Application' | 'Group' | 'Organization' | 'Service';
}

