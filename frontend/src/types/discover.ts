import { UserProfile } from "./account";

export interface DiscoverUser {
  actorId: string;
  avatarUrl: string;
  bio: string;
  displayName: string;
  domain: string;
  isLocal: boolean;
  isPrivate: boolean;
  username: string;
}

export interface DiscoverSearchResponse {
  hasMore: boolean;
  limit: number;
  page: number;
  query: string;
  results: UserProfile[];
}