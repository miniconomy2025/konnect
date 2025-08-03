import { getLogger } from '@logtape/logtape';
import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.ts';
import { blockFederationHeaders } from '../middlewares/blockFederationHeaders.ts';
import { InboxService } from '../services/inboxService.ts';
import { UserService } from '../services/userService.ts';

const router = Router();
const userService = new UserService();
const inboxService = new InboxService();
const logger = getLogger("inbox");

router.get('/users/:username', blockFederationHeaders, requireAuth, async (req, res) => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const user = await userService.findByUsername(username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const inbox = await inboxService.getPaginatedInboxActivities(username, page, limit);

    return res.json(inbox);
  } catch (error) {
    logger.error('Get inbox error: ', { error });
    return res.status(500).json({ error: 'Failed to fetch inbox' });
  }
});

export default router;