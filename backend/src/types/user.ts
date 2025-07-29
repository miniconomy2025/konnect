import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  // Google OAuth data
  googleId: string;
  email: string;
  
  // ActivityPub identity
  username: string;
  domain: string;          
  actorId: string;           
  
  // Profile data
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  
  // ActivityPub URLs
  inboxUrl: string;
  outboxUrl: string;
  followersUrl: string;
  followingUrl: string;
  
  // Internal flags
  isLocal: boolean;
  isPrivate: boolean;
  
  // Timestamps
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