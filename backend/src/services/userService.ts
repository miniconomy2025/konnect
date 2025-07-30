import { User, type IUser } from '../models/user.ts';
import type { CreateUserData } from '../types/user.js';

const RESERVED_USERNAMES = [
  'admin', 'api', 'www', 'mail', 'ftp', 'localhost', 'inbox', 'outbox',
  'followers', 'following', 'posts', 'activities', 'collections'
];

export class UserService {
  async findByGoogleId(googleId: string): Promise<IUser | null> {
    return await User.findOne({ googleId });
  }

  async findByUsername(username: string): Promise<IUser | null> {
    return await User.findOne({ username, isLocal: true });
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  async findById(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }

  async isUsernameAvailable(username: string): Promise<boolean> {
    if (RESERVED_USERNAMES.includes(username.toLowerCase())) {
      return false;
    }
    
    const existing = await User.findOne({ username, isLocal: true });
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
}