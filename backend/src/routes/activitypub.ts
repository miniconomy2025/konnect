import { Router } from 'express';
import { UserService } from '../services/userService.js';

const router = Router();
const userService = new UserService();

// ActivityPub Actor endpoint (serves Person objects)
router.get('/users/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    // Check Accept header for ActivityPub content type
    const acceptHeader = req.headers.accept || '';
    const isActivityPubRequest = acceptHeader.includes('application/activity+json') ||
                                acceptHeader.includes('application/ld+json');
    
    const user = await userService.findByUsername(username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (isActivityPubRequest) {
      // Return ActivityPub Person object
      const person = {
        '@context': [
          'https://www.w3.org/ns/activitystreams',
          'https://w3id.org/security/v1',
        ],
        type: 'Person',
        id: user.actorId,
        preferredUsername: user.username,
        name: user.displayName,
        summary: user.bio || '',
        
        // Profile data
        icon: user.avatarUrl ? {
          type: 'Image',
          mediaType: 'image/jpeg', // TODO: detect actual type
          url: user.avatarUrl,
        } : undefined,
        
        // ActivityPub endpoints
        inbox: user.inboxUrl,
        outbox: user.outboxUrl,
        followers: user.followersUrl,
        following: user.followingUrl,
        
        // TODO: Add public key for HTTP signatures
        // publicKey: {
        //   id: `${user.actorId}#main-key`,
        //   owner: user.actorId,
        //   publicKeyPem: user.publicKeyPem,
        // },
        
        // Additional metadata
        published: user.createdAt.toISOString(),
        updated: user.updatedAt.toISOString(),
        
        // Discoverable in search results
        discoverable: !user.isPrivate,
        indexable: !user.isPrivate,
        
        // Manual approval required for follows (for private accounts)
        manuallyApprovesFollowers: user.isPrivate,
      };
      
      res.setHeader('Content-Type', 'application/activity+json');
      res.json(person);
    } else {
      // Return basic user profile for web browsers
      res.json({
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        joinDate: user.createdAt,
        activityPubId: user.actorId,
        // TODO: Add post count, follower count, etc.
      });
    }
  } catch (error) {
    console.error('Actor endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Placeholder endpoints for ActivityPub collections
// These will be implemented when we add posts and follows

router.get('/users/:username/outbox', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await userService.findByUsername(username);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // TODO: Implement actual outbox with user's posts
    const outbox = {
      '@context': 'https://www.w3.org/ns/activitystreams',
      type: 'OrderedCollection',
      id: user.outboxUrl,
      totalItems: 0,
      orderedItems: [],
    };
    
    res.setHeader('Content-Type', 'application/activity+json');
    res.json(outbox);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/users/:username/followers', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await userService.findByUsername(username);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // TODO: Implement actual followers collection
    const followers = {
      '@context': 'https://www.w3.org/ns/activitystreams',
      type: 'OrderedCollection',
      id: user.followersUrl,
      totalItems: 0,
      orderedItems: [],
    };
    
    res.setHeader('Content-Type', 'application/activity+json');
    res.json(followers);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/users/:username/following', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await userService.findByUsername(username);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // TODO: Implement actual following collection
    const following = {
      '@context': 'https://www.w3.org/ns/activitystreams',
      type: 'OrderedCollection',
      id: user.followingUrl,
      totalItems: 0,
      orderedItems: [],
    };
    
    res.setHeader('Content-Type', 'application/activity+json');
    res.json(following);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;