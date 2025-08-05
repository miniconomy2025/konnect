import { Router } from 'express';
import { optionalAuth } from '../middlewares/auth.ts';
import { FollowService } from '../services/followService.ts';
import { InboxService } from '../services/inboxService.ts';
import { UserService } from '../services/userService.js';
import type { UserResponse } from '../types/user.ts';
import { SearchService } from '../services/searchService.ts';
import type { IUser } from '../models/user.ts';

const router = Router();
const userService = new UserService();
const inboxService = new InboxService();
const followService = new FollowService(userService, inboxService);
const searchService = new SearchService();

router.get('/users/:username', optionalAuth, async (req, res) => {
  try {
    const { username } = req.params;
    const currentUser = req.user;
    
    const acceptHeader = req.headers.accept || '';
    const isActivityPubRequest = acceptHeader.includes('application/activity+json') ||
                                acceptHeader.includes('application/ld+json');
    
    if (isActivityPubRequest) {
      return res.status(406).json({ 
        error: 'ActivityPub requests should be handled by Fedify federation middleware' 
      });
    }

    let user: IUser | UserResponse | null = null;
    if (!req.federationContext) {
      user = await userService.findByUsername(username);
      if (user) {
        const { followingCount, followersCount } = await followService.getFollowCounts(user.actorId);
        const isFollowingCurrentUser = currentUser ? await followService.isFollowing(user.actorId, currentUser.actorId) : false;
        const isFollowedByCurrentUser = currentUser ? await followService.isFollowing(currentUser.actorId, user.actorId) : false;

        const localDomain = process.env.DOMAIN || 'localhost:8000';
        const hostServer = user.isLocal ? localDomain : user.domain;
        const handle = `@${user.username}@${hostServer}`;

        const userResponse: UserResponse = {
          username: user.username,
          displayName: user.displayName,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
          joinDate: user.createdAt,
          activityPubId: user.actorId,
          isPrivate: user.isPrivate,
          followingCount,
          followersCount,
          isFollowingCurrentUser,
          isFollowedByCurrentUser,
          isLocal: user.isLocal,
          hostServer,
          handle,
        }

        return res.json(userResponse);
      } else {
        return res.status(404).json({ error: 'User not found locally' });
      }
    } else {
      const searchResult = await searchService.searchAllUsers(username, 1, 1, req.federationContext, currentUser?.actorId);
      if (searchResult.users.length > 0) {
        user = searchResult.users[0];
        return res.json(user);
      } else {
        return res.status(404).json({ error: 'User not found locally nor federated' });
      }
    }
  } catch (error) {
    console.error('User profile endpoint error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;