import { Router } from 'express';
import { AuthService } from '../services/authservice.js';
import { UserService } from '../services/userService.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();
const authService = new AuthService();
const userService = new UserService();

router.get('/google', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const domain = process.env.DOMAIN || 'localhost:8000';
  const protocol = domain.includes('localhost') ? 'http' : 'https';
  const redirectUri = `${protocol}://${domain}/auth/google/callback`;
  
  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId!);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'email profile');
  googleAuthUrl.searchParams.set('access_type', 'offline');
  
  res.redirect(googleAuthUrl.toString());
});

router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' });
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code: code as string,
        grant_type: 'authorization_code',
        redirect_uri: `${req.protocol}://${req.get('host')}/auth/google/callback`,
      }),
    });

    const tokens = await tokenResponse.json();
    
    if (!tokens.access_token) {
      return res.status(400).json({ error: 'Failed to get access token' });
    }

    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const profile = await profileResponse.json();

    const { user, isNewUser } = await authService.handleGoogleCallback({
      id: profile.id,
      emails: [{ value: profile.email, verified: true }],
      name: { givenName: profile.given_name, familyName: profile.family_name },
      photos: [{ value: profile.picture }],
    });

    const token = authService.generateToken(user);
    const frontendUrl = new URL('https://konnect.tevlen.co.za/Login');
    frontendUrl.searchParams.set('token', token);
    frontendUrl.searchParams.set('user', JSON.stringify({
        id: user._id?.toString(),
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        avatarUrl: user.avatarUrl,
        actorId: user.actorId,
    }));
    frontendUrl.searchParams.set('isNewUser', isNewUser.toString());

    res.redirect(frontendUrl.toString());
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

router.get('/check-username/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const validation = userService.validateUsername(username);
    if (!validation.valid) {
      return res.json({ available: false, error: validation.error });
    }
    
    const available = await userService.isUsernameAvailable(username);
    res.json({ available });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check username' });
  }
});

router.put('/display-name', requireAuth, async (req, res) => {
  try {
    const { displayName } = req.body;
    const user = req.user;
    
    if (!displayName || typeof displayName !== 'string') {
      return res.status(400).json({ error: 'Display name is required' });
    }

    const trimmedDisplayName = displayName.trim();
    
    if (trimmedDisplayName.length === 0) {
      return res.status(400).json({ error: 'Display name cannot be empty' });
    }
    
    if (trimmedDisplayName.length > 100) {
      return res.status(400).json({ error: 'Display name must be 100 characters or less' });
    }
    
    const updatedUser = await userService.updateUser(user!._id?.toString()!, {
      displayName: trimmedDisplayName
    });
    
    if (updatedUser) {
      const { ActivityService } = await import('../services/activityservice.js');
      const activityService = new ActivityService();
      const federationContext = (req as any).federationContext;
      
      if (federationContext) {
        await activityService.publishUpdateActivity(updatedUser, federationContext);
      }
    }
    
    res.json({ 
      success: true, 
      user: {
        id: updatedUser?._id?.toString(),
        username: updatedUser?.username,
        displayName: updatedUser?.displayName,
        bio: updatedUser?.bio,
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update display name' });
  }
});

router.put('/username', requireAuth, async (req, res) => {
  try {
    const { username } = req.body;
    const user = req.user;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    const validation = userService.validateUsername(username);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }
    
    const available = await userService.isUsernameAvailable(username);
    if (!available) {
      return res.status(400).json({ error: 'Username is not available' });
    }
    
    const domain = process.env.DOMAIN || 'localhost:8000';
    const protocol = domain.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${domain}`;
    
    const updatedUser = await userService.updateUser(user!._id?.toString()!, {
      username,
      actorId: `${baseUrl}/users/${username}`,
      inboxUrl: `${baseUrl}/users/${username}/inbox`,
      outboxUrl: `${baseUrl}/users/${username}/outbox`,
      followersUrl: `${baseUrl}/users/${username}/followers`,
      followingUrl: `${baseUrl}/users/${username}/following`,
    });
    
    res.json({ 
      success: true, 
      user: {
        id: updatedUser?._id?.toString(),
        username: updatedUser?.username,
        displayName: updatedUser?.displayName,
        actorId: updatedUser?.actorId,
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update username' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  const user = req.user;
  
  const { FollowService } = await import('../services/followService.js');
  const { InboxService } = await import('../services/inboxService.js');
  const followService = new FollowService(userService, new InboxService());
  
  const { followingCount, followersCount } = await followService.getFollowCounts(user!.actorId);
  
  res.json({
    id: user!._id?.toString(),
    username: user!.username,
    displayName: user!.displayName,
    email: user!.email,
    bio: user!.bio,
    avatarUrl: user!.avatarUrl,
    actorId: user!.actorId,
    followersCount,
    followingCount,
    postsCount: 0,
  });
});

router.put('/bio', requireAuth, async (req, res) => {
  try {
    const { bio } = req.body;
    const user = req.user;
    
    if (bio !== undefined && bio.length > 500) {
      return res.status(400).json({ error: 'Bio must be 500 characters or less' });
    }
    
    const updatedUser = await userService.updateUser(user!._id?.toString()!, {
      bio: bio || ''
    });
    
    if (updatedUser) {
      const { ActivityService } = await import('../services/activityservice.js');
      const activityService = new ActivityService();
      const federationContext = (req as any).federationContext;
      
      if (federationContext) {
        await activityService.publishUpdateActivity(updatedUser, federationContext);
      }
    }
    
    res.json({ 
      success: true, 
      user: {
        id: updatedUser?._id?.toString(),
        username: updatedUser?.username,
        displayName: updatedUser?.displayName,
        bio: updatedUser?.bio,
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update bio' });
  }
});

router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;