import jwt from 'jsonwebtoken';
import { UserService } from './userService.js';
import type { IUser } from '../models/user.ts';

export interface GoogleProfile {
  id: string;
  emails: Array<{ value: string; verified: boolean }>;
  name: { givenName: string; familyName: string };
  photos: Array<{ value: string }>;
}

export class AuthService {
  private userService = new UserService();

  generateToken(user: IUser): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    return jwt.sign(
      { 
        userId: user._id?.toString(),
        username: user.username,
        email: user.email 
      },
      secret,
      { expiresIn: '30d' }
    );
  }

  verifyToken(token: string): any {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    return jwt.verify(token, secret);
  }

  async handleGoogleCallback(profile: GoogleProfile): Promise<{ user: IUser; isNewUser: boolean }> {
    let user = await this.userService.findByGoogleId(profile.id);
    
    if (user) {
      return { user, isNewUser: false };
    }

    const emailExists = await this.userService.findByEmail(profile.emails[0].value);
    if (emailExists) {
      throw new Error('An account with this email already exists');
    }

    const suggestedUsername = this.generateUsername(
      profile.name.givenName,
      profile.name.familyName
    );

    const finalUsername = await this.ensureUniqueUsername(suggestedUsername);

    user = await this.userService.createUser({
      googleId: profile.id,
      email: profile.emails[0].value,
      username: finalUsername,
      displayName: `${profile.name.givenName} ${profile.name.familyName}`,
      avatarUrl: profile.photos[0]?.value,
    });

    return { user, isNewUser: true };
  }

  private generateUsername(firstName: string, lastName: string): string {
    const base = (firstName + lastName)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    
    return base.slice(0, 15) || 'user';
  }

  private async ensureUniqueUsername(baseUsername: string): Promise<string> {
    let username = baseUsername;
    let counter = 1;

    while (!(await this.userService.isUsernameAvailable(username))) {
      username = `${baseUsername}${counter}`;
      counter++;
      
      if (counter > 9999) {
        username = `user${Date.now()}`;
        break;
      }
    }

    return username;
  }
}