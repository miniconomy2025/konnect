import { Router } from 'express';
import { UserService } from '../services/userService.js';
import { FollowService } from '../services/followService.ts';
import { InboxService } from '../services/inboxService.ts';

const router = Router();
const userService = new UserService();
const inboxService = new InboxService();
const followService = new FollowService(userService, inboxService);

router.get('/users/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const acceptHeader = req.headers.accept || '';
    const isActivityPubRequest = acceptHeader.includes('application/activity+json') ||
                                acceptHeader.includes('application/ld+json');
    
    if (isActivityPubRequest) {
      return res.status(406).json({ 
        error: 'ActivityPub requests should be handled by Fedify federation middleware' 
      });
    }
    
    const user = await userService.findByUsername(username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { followingCount, followersCount } = await followService.getFollowCounts(user.actorId);

    return res.json({
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      joinDate: user.createdAt,
      activityPubId: user.actorId,
      isPrivate: user.isPrivate,
      followingCount,
      followersCount,
    });
  } catch (error) {
    console.error('User profile endpoint error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;