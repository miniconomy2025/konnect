import { Router } from 'express';
import { UserService } from '../services/userService.js';

const router = Router();
const userService = new UserService();

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
    
    res.json({
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      joinDate: user.createdAt,
      activityPubId: user.actorId,
      isPrivate: user.isPrivate,
    });
  } catch (error) {
    console.error('User profile endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;