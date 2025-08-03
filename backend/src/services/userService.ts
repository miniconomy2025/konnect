import { Person } from '@fedify/fedify';
import { Error } from 'mongoose';
import federation from '../federation/federation.ts';
import { User, type IUser } from '../models/user.ts';
import type { DisplayPersonActor } from '../types/inbox.ts';
import type { CreateUserData } from '../types/user.js';

const RESERVED_USERNAMES = [
  'admin', 'api', 'www', 'mail', 'ftp', 'localhost', 'inbox', 'outbox',
  'followers', 'following', 'posts', 'activities', 'collections'
];

export interface CreateExternalUserData {
  username: string;
  domain: string;
  actorId: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  inbox?: string;
  outbox?: string;
  followersUrl?: string;
  followingUrl?: string;
  isPrivate?: boolean;
}

export class UserService {
  private sanitizeUserOutput(user: IUser | null): IUser | null {
    if (!user) {
      return user;
    } else {
      user.keyPairs = user.keyPairs.map((keyPair) => ({
        privateKey: undefined,
        publicKey: keyPair.publicKey,
      }));
      return user;
    }
  }

  async findByGoogleId(googleId: string): Promise<IUser | null> {
    return this.sanitizeUserOutput(await User.findOne({ googleId }));
  }

  async findByUsername(username: string): Promise<IUser | null> {
    return this.sanitizeUserOutput(await User.findOne({ username, isLocal: true }));
  }

  async findByUsernameUnsanitized(username: string): Promise<Omit<IUser, 'keyPairs'> & { keyPairs: { publicKey: JsonWebKey, privateKey: JsonWebKey }[] } | null> {
    return await User.findOne({ username });
  }

  async findByActorIdUnsanitized(actorId: string): Promise<Omit<IUser, 'keyPairs'> & { keyPairs: { publicKey: JsonWebKey, privateKey: JsonWebKey }[] } | null> {
    return await User.findOne({ actorId });
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.sanitizeUserOutput(await User.findOne({ email }));
  }

  async findById(id: string): Promise<IUser | null> {
    return this.sanitizeUserOutput(await User.findById(id));
  }

  async findByActorId(actorId: string): Promise<IUser | null> {
    return this.sanitizeUserOutput(await User.findOne({ actorId }));
  }

  async findDisplayActorById(actorId: string): Promise<DisplayPersonActor | undefined> {
    const user = this.sanitizeUserOutput(await User.findOne({ actorId }));
    if (!user) {
      return undefined;
    } else {
      return {
        actorId: user.actorId,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl || '',
      }
    }
  }

  async searchLocalUsers(query: string, limit = 20): Promise<IUser[]> {
    const searchRegex = new RegExp(query.replace(/^@/, ''), 'i');
    
    return await User.find({
      isLocal: true,
      $or: [
        { username: searchRegex },
        { displayName: searchRegex }
      ]
    })
    .limit(limit)
    .sort({ username: 1 });
  }

  async findExternalUser(username: string, domain: string): Promise<IUser | null> {
    return await User.findOne({ 
      username, 
      domain, 
      isLocal: false 
    });
  }

  async createExternalUser(userData: CreateExternalUserData): Promise<IUser | null> {
    const existing = await this.findExternalUser(userData.username, userData.domain);
    if (existing) {
      return await this.updateExternalUser(existing._id.toString(), userData);
    }

    const user = new User({
      googleId: `external:${userData.username}@${userData.domain}`,
      email: `${userData.username}@${userData.domain}`, // Placeholder
      username: userData.username,
      domain: userData.domain,
      actorId: userData.actorId,
      displayName: userData.displayName || userData.username,
      avatarUrl: userData.avatarUrl,
      bio: userData.bio || '',
      inboxUrl: userData.inbox || `${userData.actorId}/inbox`,
      outboxUrl: userData.outbox || `${userData.actorId}/outbox`,
      followersUrl: userData.followersUrl || `${userData.actorId}/followers`,
      followingUrl: userData.followingUrl || `${userData.actorId}/following`,
      isLocal: false,
      isPrivate: userData.isPrivate || false
    });

    return await user.save();
  }

  async updateExternalUser(id: string, updates: Partial<CreateExternalUserData>): Promise<IUser | null> {
    const updateData: Partial<IUser> = {};
    
    if (updates.displayName) updateData.displayName = updates.displayName;
    if (updates.avatarUrl) updateData.avatarUrl = updates.avatarUrl;
    if (updates.bio !== undefined) updateData.bio = updates.bio;
    if (updates.inbox) updateData.inboxUrl = updates.inbox;
    if (updates.outbox) updateData.outboxUrl = updates.outbox;
    if (updates.followersUrl) updateData.followersUrl = updates.followersUrl;
    if (updates.followingUrl) updateData.followingUrl = updates.followingUrl;
    if (updates.isPrivate !== undefined) updateData.isPrivate = updates.isPrivate;
    
    updateData.updatedAt = new Date();

    return await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
  }

  async findUserByActorId(actorId: string): Promise<IUser | null> {
    return await User.findOne({ actorId });
  }

  async searchAllUsers(query: string, includeExternal = true, limit = 20): Promise<IUser[]> {
    const searchRegex = new RegExp(query.replace(/^@/, ''), 'i');
    
    const searchFilter: any = {
      $or: [
        { username: searchRegex },
        { displayName: searchRegex }
      ]
    };

    if (!includeExternal) {
      searchFilter.isLocal = true;
    }

    return await User.find(searchFilter)
      .limit(limit)
      .sort({ isLocal: -1, username: 1 }); 
  }

  async isUsernameAvailable(username: string): Promise<boolean> {
    if (RESERVED_USERNAMES.includes(username.toLowerCase())) {
      return false;
    }
    
    const existing = this.sanitizeUserOutput(await User.findOne({ username, isLocal: true }));
    return !existing;
  }

  validateUsername(username: string): { valid: boolean; error?: string } {
    if (!username || username.length < 1) {
      return { valid: false, error: 'Username is required' };
    }
    
    if (username.length > 30) {
      return { valid: false, error: 'Username must be 30 characters or less' };
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return { valid: false, error: 'Username can only contain letters, numbers, hyphens, and underscores' };
    }
    
    if (RESERVED_USERNAMES.includes(username.toLowerCase())) {
      return { valid: false, error: 'This username is reserved' };
    }
    
    return { valid: true };
  }

  async createUser(userData: CreateUserData): Promise<IUser> {
    const domain = process.env.DOMAIN || 'localhost:8000';
    const protocol = domain.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${domain}`;
    
    const user = new User({
      ...userData,
      domain,
      actorId: `${baseUrl}/users/${userData.username}`,
      inboxUrl: `${baseUrl}/users/${userData.username}/inbox`,
      outboxUrl: `${baseUrl}/users/${userData.username}/outbox`,
      followersUrl: `${baseUrl}/users/${userData.username}/followers`,
      followingUrl: `${baseUrl}/users/${userData.username}/following`,
      isLocal: true,
      isPrivate: false,
      bio: '',
    });

    return await user.save();
  }

  async updateUser(id: string, updates: Partial<IUser>): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );
  }

  async refreshExternalUser(username: string, domain: string): Promise<IUser | null> {
    return await this.findExternalUser(username, domain);
  }

  async getExternalUserStats(): Promise<{ total: number; byDomain: Record<string, number> }> {
    const externalUsers = await User.find({ isLocal: false }, 'domain');
    
    const byDomain: Record<string, number> = {};
    for (const user of externalUsers) {
      byDomain[user.domain] = (byDomain[user.domain] || 0) + 1;
    }

    return {
      total: externalUsers.length,
      byDomain
    };
  }
  
  async getRemoteActorDisplay(actorUrl: string): Promise<DisplayPersonActor | undefined> {
    const ctx = federation.createContext(
      new URL(actorUrl),
      {}
    );
    const actor = await ctx.lookupObject(new URL(actorUrl));
    if (!actor) {
      return undefined
    } else if (actor instanceof Person) {
      const user: DisplayPersonActor = {
        actorId: actorUrl,
        username: actor.preferredUsername?.toString() || actorUrl,
        displayName: actor.name?.toString() || actorUrl,
        avatarUrl: (await actor.getIcon())?.url?.toString() || '',
      }
      return user;
    } else {
      throw new Error(`Actor of type ${typeof actor} not supported`)
    }
  }
}