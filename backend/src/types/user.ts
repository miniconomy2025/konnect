import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  googleId: string;
  email: string;
  username: string;
  domain: string;
  actorId: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  inboxUrl: string;
  outboxUrl: string;
  followersUrl: string;
  followingUrl: string;
  isLocal: boolean;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  googleId: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
}