import { Follow, Undo } from '@fedify/fedify';
import { getLogger } from '@logtape/logtape';
import { Router } from 'express';
import federation from '../federation/setup.ts';
import { requireAuth } from '../middlewares/auth.ts';
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
    logger.error('Get follow error: ', { error });
    return res.status(500).json({ error: 'Failed to fetch follows' });
  }
});

router.post('/follow', requireAuth, async (req, res) => {
  try {
    const { targetUserActorID } = req.body;
    const currentUser = req.user!;

    if (!targetUserActorID) {
      return res.status(400).json({ error: 'targetUserId is required' });
    }

    if (targetUserActorID === currentUser.actorId.toString()) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const targetUser = await userService.findByActorId(targetUserActorID);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existingFollow = await followService.getPopulatedFollowByActorIdAndObjectId(
      currentUser.actorId,
      targetUser.actorId
    );

    if (existingFollow) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    const followActivity = await inboxService.persistInboxActivityObject({
      type: 'Follow',
      actor: currentUser.actorId,
      object: targetUser.actorId,
      summary: `${currentUser.displayName} followed ${targetUser.displayName}`
    });

    if (!targetUser.isLocal) {
      try {
        const domain = process.env.DOMAIN || 'localhost:8000';
        const protocol = domain.includes('localhost') ? 'http' : 'https';
        const baseUrl = `${protocol}://${domain}`;

        const ctx = federation.createContext(new URL(baseUrl), {});

        const followActivityPub = new Follow({
          id: new URL(followActivity.object.activityId),
          actor: new URL(currentUser.actorId),
          object: new URL(targetUser.actorId),
        });

        await ctx.sendActivity(
          { identifier: currentUser.username },
          {
            id: new URL(targetUser.actorId),
            inboxId: new URL(targetUser.inboxUrl)
          },
          followActivityPub
        );
      } catch (federationError) {
        logger.error(`Failed to send Follow activity to ${targetUser.actorId}:`, {
          error: federationError instanceof Error ? federationError.message : String(federationError)
        });
      }
    }

    return res.json({ 
      success: true, 
      message: 'Successfully followed user',
      following: true
    });

  } catch (error) {
    logger.error('Follow user error:', { error });
    return res.status(500).json({ error: 'Failed to follow user' });
  }
});

router.post('/unfollow', requireAuth, async (req, res) => {
  try {
    const { targetUserActorID } = req.body;
    const currentUser = req.user!;

    if (!targetUserActorID) {
      return res.status(400).json({ error: 'targetUserActorID is required' });
    }

    const targetUser = await userService.findByActorId(targetUserActorID);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existingFollow = await followService.getPopulatedFollowByActorIdAndObjectId(
      currentUser.actorId,
      targetUser.actorId
    );

    if (!existingFollow) {
      return res.status(400).json({ error: 'Not following this user' });
    }

    await followService.removeFollow(currentUser.actorId, targetUser.actorId);

    if (!targetUser.isLocal && existingFollow.activity) {
      try {
        const domain = process.env.DOMAIN || 'localhost:8000';
        const protocol = domain.includes('localhost') ? 'http' : 'https';
        const baseUrl = `${protocol}://${domain}`;

        const ctx = federation.createContext(new URL(baseUrl), {});

        const undoActivity = new Undo({
          id: new URL(`${baseUrl}/activities/${Date.now()}`),
          actor: new URL(currentUser.actorId),
          object: new Follow({
            id: new URL(existingFollow.activity.object.activityId),
            actor: new URL(currentUser.actorId),
            object: new URL(targetUser.actorId),
          }),
        });

        await ctx.sendActivity(
          { identifier: currentUser.username },
          {
            id: new URL(targetUser.actorId),
            inboxId: new URL(targetUser.inboxUrl)
          },
          undoActivity
        );
      } catch (federationError) {
        logger.error(`Failed to send Undo activity to ${targetUser.actorId}:`, {
          error: federationError instanceof Error ? federationError.message : String(federationError)
        });
      }
    }

    return res.json({ 
      success: true, 
      message: 'Successfully unfollowed user',
      following: false
    });

  } catch (error) {
    logger.error('Unfollow user error:', { error });
    return res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

router.get('/status/:targetUserId', requireAuth, async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const currentUser = req.user!;

    const targetUser = await userService.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isFollowing = await followService.isFollowing(currentUser.actorId, targetUser.actorId);
    const isFollowedBy = await followService.isFollowing(targetUser.actorId, currentUser.actorId);

    return res.json({
      following: isFollowing,
      followedBy: isFollowedBy
    });

  } catch (error) {
    logger.error('Follow status error:', { error });
    return res.status(500).json({ error: 'Failed to get follow status' });
  }
});

export default router;