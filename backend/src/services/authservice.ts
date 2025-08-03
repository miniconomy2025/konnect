import jwt from 'jsonwebtoken';
import type { IUser } from '../models/user.ts';
import { UserService } from './userService.js';

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

    const keyPair = await this.generateKeyPair();
    user = await this.userService.createUser({
      googleId: profile.id,
      email: profile.emails[0].value,
      username: finalUsername,
      displayName: `${profile.name.givenName} ${profile.name.familyName}`,
      avatarUrl: profile.photos[0]?.value,
      keyPairs: [{
        privateKey: keyPair.privateJwk,
        publicKey: keyPair.publicJwk,
      }]
    });

    return { user, isNewUser: true };
  }

  private async generateKeyPair() {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: "RSASSA-PKCS1-v1_5",
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: "SHA-256",
      },
      true,
      ["sign", "verify"]
    );
  
    const publicJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
    const privateJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
  
    const jwks = {
      keys: [publicJwk],
    };
     
    return { privateJwk, publicJwk, jwks };
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