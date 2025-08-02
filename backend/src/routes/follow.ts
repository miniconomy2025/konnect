import { getLogger } from '@logtape/logtape';
import { Router } from 'express';
import { blockFederationHeaders } from '../middlewares/blockFederationHeaders.ts';
import { FollowService } from '../services/followService.ts';
import { InboxService } from '../services/inboxService.ts';
import { UserService } from '../services/userService.ts';

const router = Router();
const userService = new UserService();
const inboxService = new InboxService();
const followService = new FollowService(userService, inboxService);
const logger = getLogger("follow");


router.get('/users/:username', blockFederationHeaders, async (req, res) => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const user = await userService.findByUsername(username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const followers = await followService.getPopulatedFollowsByObjectId(user.actorId, page, limit);
    const following = await followService.getPopulatedFollowsByActorId(user.actorId, page, limit);

    return res.json({
      followers,
      following,
      page,
      limit,
    });
  } catch (error) {
    logger.error('Get follow error: ', {error});
    return res.status(500).json({ error: 'Failed to fetch follows', message: (error as Error).message });
  }
});

export default router;