import { Follow } from '@fedify/fedify';
import { getLogger } from '@logtape/logtape';
import { Router } from 'express';
import federation from '../federation/federation.ts';
import { requireAuth } from '../middlewares/auth.ts';
import { blockFederationHeaders } from '../middlewares/blockFederationHeaders.ts';
import { InboxService } from '../services/inboxService.ts';
import { PostService } from '../services/postserivce.ts';
import { UserService } from '../services/userService.ts';
import { activityTypes } from '../types/inbox.ts';

const router = Router();
const postService = new PostService();
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
    logger.error('Get inbox error: ', {error});
    return res.status(500).json({ error: 'Failed to fetch inbox', message: (error as Error).message });
  }
});

router.post('/users/:username', blockFederationHeaders, requireAuth, async (req, res) => {
  try {
    const { username } = req.params;
    const { type, actor, object, summary } = req.body;

    const missingRequiredFields = [
      !type && 'type',
      !actor && 'actor',
      !object && 'object'
    ]

    if (!type || !actor || !object) {
      return res.status(400).json({ error: `Missing required fields: ${missingRequiredFields.join(',')}` });
    }

    if (activityTypes.indexOf(type) === -1) {
      return res.status(400).json({ error: `Invalid activity type. Supported types: ${activityTypes.join(', ')}` });
    }
    
    const user = await userService.findByUsername(username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const savedActivity = await inboxService.persistInboxActivityObject({
      type: type,
      summary: summary ?? await inboxService.defaultActivitySummary(type, actor, object),
      actor: actor,
      object: object
    });
    if (!savedActivity) {
      return res.status(500).json({ error: 'Failed to add activity to inbox' });
    }

    const isOutgoingToRemote = actor.includes(process.env.DOMAIN) &&
      !object.includes(process.env.DOMAIN);

    if (isOutgoingToRemote && type === 'Follow') {
      try {
        const domain = process.env.DOMAIN || 'localhost:8000';
        const protocol = domain.includes('localhost') ? 'http' : 'https';
        const baseUrl = `${protocol}://${domain}`;

        const ctx = federation.createContext(new URL(baseUrl), {});

        const actorUrl = new URL(actor);
        const actorUsername = actorUrl.pathname.split('/').pop();

        if (!actorUsername) {
          throw new Error('Could not extract username from actor URL');
        }

        const followActivity = new Follow({
          id: new URL(savedActivity.object.activityId),
          actor: new URL(actor),
          object: new URL(object),
        });

        await ctx.sendActivity(
          { identifier: actorUsername },
          {
            id: new URL(object),
            inboxId: new URL(`${object}/inbox`)
          },
          followActivity
        );
      } catch (federationError) {
        logger.error(`Failed to send ${type} activity to ${object}:`, {
          error: federationError instanceof Error ? federationError.message : String(federationError)
        });
        // Don't fail the request, just log the federation error
      }
    }

    return res.json({ 
      success: true, 
      message: 'Activity added to inbox', 
      activity: savedActivity
    });
  } catch (error) {
    logger.error('Add activity to inbox error', { error });
    return res.status(500).json({ error: 'Failed to add activity to inbox', message: (error as Error).message });
  }
});

export default router;