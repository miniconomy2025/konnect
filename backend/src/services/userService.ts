import { getDatabase } from '../database/connection.js';
import type { User, CreateUserData } from '../types/user.js';
import { ObjectId } from 'mongodb';

const RESERVED_USERNAMES = [
  'admin', 'api', 'www', 'mail', 'ftp', 'localhost', 'inbox', 'outbox',
  'followers', 'following', 'posts', 'activities', 'collections'
];

export class UserService {
  private get collection() {
    return getDatabase().collection<User>('users');
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return await this.collection.findOne({ googleId });
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.collection.findOne({ username, isLocal: true });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.collection.findOne({ email });
  }

  async findById(id: string): Promise<User | null> {
    return await this.collection.findOne({ _id: new ObjectId(id) });
  }

  async isUsernameAvailable(username: string): Promise<boolean> {
    if (RESERVED_USERNAMES.includes(username.toLowerCase())) {
      return false;
    }
    
    const existing = await this.collection.findOne({ username, isLocal: true });
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

  async createUser(userData: CreateUserData): Promise<User> {
    const domain = process.env.DOMAIN || 'localhost:8000';
    const protocol = domain.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${domain}`;
    
    const user: User = {
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.collection.insertOne(user);
    return { ...user, _id: result.insertedId };
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );
    
    return result;
  }
}