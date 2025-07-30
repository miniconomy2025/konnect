import { Router } from 'express';
import { UserService } from '../services/userService.js';

const router = Router();
const userService = new UserService();

router.get('/.well-known/webfinger', async (req, res) => {
  try {
    const resource = req.query.resource as string;
    
    if (!resource) {
      return res.status(400).json({ error: 'Missing resource parameter' });
    }
    
    const match = resource.match(/^acct:([^@]+)@(.+)$/);
    if (!match) {
      return res.status(400).json({ error: 'Invalid resource format. Expected: acct:username@domain' });
    }
    
    const [, username, domain] = match;
    const expectedDomain = process.env.DOMAIN || 'localhost:8000';
    
    if (domain !== expectedDomain) {
      return res.status(404).json({ error: 'Domain not found' });
    }
    
    const user = await userService.findByUsername(username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      subject: resource,
      links: [
        {
          rel: 'self',
          type: 'application/activity+json',
          href: user.actorId,
        },
        {
          rel: 'http://webfinger.net/rel/profile-page',
          type: 'text/html',
          href: user.actorId,
        },
      ],
    });
  } catch (error) {
    console.error('WebFinger error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;