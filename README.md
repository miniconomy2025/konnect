# Konnect

By NoTeamCosts

## Team

NoTeamCosts Members:

- Alexander van der Leek
- Daniël van Zyl
- Katlego Sekoele
- Shen Reddy
- Tevlen Naidoo

# konnect

## Current

### Working
- **Google OAuth Authentication** - Users register/login with Google
- **Federated Identity** - Each user gets a unique ActivityPub identity
- **WebFinger Discovery** - Other servers can find your users
- **ActivityPub Actor Profiles** - Users have proper ActivityPub Person objects
- **JWT Authentication** - API access with Bearer tokens
- **Username Management** - Check availability, update usernames
- **Post Creation** - Create posts with images and captions
- **Image Upload** - Direct S3 upload with proper permissions
- **Like System** - Like/unlike posts with user tracking
- **ActivityPub Posts** - Posts federate as Note objects
- **User Search** - Search local and external users via WebFinger
- **External Post Browsing** - View posts from any ActivityPub user
- **Unified Post Format** - integration of local and external content

### How it Works

1. **User Registration**: `alice` registers becomes `@alice@localhost:8000`
2. **WebFinger**: Other servers discover Alice via `/.well-known/webfinger?resource=acct:alice@localhost:8000`
3. **ActivityPub Profile**: Servers fetch Alice's profile with `Accept: application/activity+json`
4. **Post Creation**: Users upload images and create posts with captions
5. **Federation**: Posts appear in user outboxes as ActivityPub Create activities
6. **Likes**: Users can like/unlike posts with duplicate prevention
7. **User Discovery**: Search for local users or discover external users via WebFinger lookups
8. **External Content Browsing**: View posts from any fediverse user without following

### Google OAuth Flow
```bash
# Visit in browser
http://localhost:8000/auth/google
```
**Expected**: Redirects to Google Login Returns JWT token and user info

### Test API with Authentication
```bash
# Save your JWT token from OAuth response
export TOKEN="your_jwt_token_here"

# Get your profile
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/auth/me

# Check username availability
curl http://localhost:8000/auth/check-username/testuser

# Update username
curl -X PUT -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"username":"newusername"}' \
     http://localhost:8000/auth/username
```

### Test Post Creation and Feeds
```bash
# Create post with image
curl -X POST -H "Authorization: Bearer $TOKEN" \
     -F "image=@test-image.jpg" \
     -F "caption=My first post" \
     http://localhost:8000/posts

# Get specific post (unified format)
curl http://localhost:8000/posts/POST_ID

# Get user's posts (unified format)
curl http://localhost:8000/posts/user/username

# Get local feed (default)
curl http://localhost:8000/posts

# Get mixed feed (local + external)
curl http://localhost:8000/posts?type=mixed

# Like a post
curl -X POST -H "Authorization: Bearer $TOKEN" \
     http://localhost:8000/posts/POST_ID/like

# Delete a post
curl -X DELETE -H "Authorization: Bearer $TOKEN" \
     http://localhost:8000/posts/POST_ID
```

### Test User Search and External Posts
```bash
# Search for local users
curl "http://localhost:8000/search/users?q=alice"

# Search for external users using WebFinger
curl "http://localhost:8000/search/users?q=@alice@mastodon.social"

# Direct external user lookup
curl "http://localhost:8000/search/external/alice/mastodon.social"

# Browse external user's posts (unified format)
curl "http://localhost:8000/search/posts/alice/mastodon.social?limit=10"

# Get a specific external post
curl "http://localhost:8000/search/post?url=https://mastodon.social/@alice/123456"

### Test WebFinger Discovery
```bash
# Replace 'alice' with actual username from your OAuth registration
curl "http://localhost:8000/.well-known/webfinger?resource=acct:alice@localhost:8000"
```
**Expected**: Returns WebFinger response with ActivityPub links

### Test ActivityPub Federation
```bash
# Get ActivityPub Person object (what other servers see)
curl -H "Accept: application/activity+json" http://localhost:8000/users/alice

# Get regular web profile
curl -H "Accept: text/html" http://localhost:8000/users/alice

# Get user's outbox (shows posts as ActivityPub activities)
curl -H "Accept: application/activity+json" http://localhost:8000/users/alice/outbox

# Get individual post as ActivityPub Note
curl -H "Accept: application/activity+json" http://localhost:8000/posts/POST_ID
```

## Current Endpoints

### Authentication
- `GET /auth/google` - Start Google OAuth flow
- `GET /auth/google/callback` - OAuth callback
- `GET /auth/me` - Get current user (requires auth)
- `PUT /auth/username` - Update username (requires auth)
- `GET /auth/check-username/:username` - Check availability
- `POST /auth/logout` - Logout user

### Posts
- `POST /posts` - Create post with media upload (requires auth)
- `GET /posts/:id` - Get specific post (unified format)
- `GET /posts/user/:username` - Get user's posts (unified format)
- `GET /posts` - Get feed/timeline (supports ?type=mixed for future external content)
- `POST /posts/:id/like` - Like/unlike post (requires auth)
- `DELETE /posts/:id` - Delete post (requires auth)

### Search
- `GET /search/users` - Search for users (local and external)
- `GET /search/external/:username/:domain` - Lookup specific external user
- `GET /search/posts/:username/:domain` - Browse external user's posts (unified format)
- `GET /search/post` - Get specific external post by URL (unified format)

### Federation
- `GET /.well-known/webfinger` - WebFinger user discovery
- `GET /users/:username` - User profile (web) or ActivityPub Person object
- `GET /users/:username/outbox` - User's posts as ActivityPub activities
- `GET /users/:username/followers` - User's followers (ActivityPub, empty for now)
- `GET /users/:username/following` - User's following (ActivityPub, empty for now)
- `GET /posts/:id` - Individual post as ActivityPub Note object

### Health
- `GET /health` - Server health check

## Database Schema

### Users Collection
```typescript
{
  _id: ObjectId,
  googleId: string,          // Google OAuth ID
  email: string,
  username: string,          // Local username 
  domain: string,            // instance domain
  actorId: string,           // Full ActivityPub actor URI
  displayName: string,
  bio?: string,
  avatarUrl?: string,
  inboxUrl: string,          // ActivityPub inbox
  outboxUrl: string,         // ActivityPub outbox
  followersUrl: string,      // Followers collection
  followingUrl: string,      // Following collection
  isLocal: boolean,          // Local vs remote user
  isPrivate: boolean,        // Private account setting
  createdAt: Date,
  updatedAt: Date
}
```

### Posts Collection
```typescript
{
  _id: ObjectId,
  author: ObjectId,          // Reference to User
  caption: string,           // Post caption (max 2200 chars)
  mediaUrl: string,          // S3 image URL
  mediaType: string,         // image/jpeg, image/png, image/webp
  activityId: string,        // ActivityPub object URI
  likes: ObjectId[],         // Array of user IDs who liked
  likesCount: number,        // Cached like count
  createdAt: Date,
  updatedAt: Date
}
```

### Content Negotiation
Same URL serves different content based on `Accept` header:
- `Accept: text/html` → Web profile/post (handled by Express route)
- `Accept: application/activity+json` → ActivityPub objects (handled by Fedify)

### Fedify Integration
- **Actor Dispatcher**: Serves ActivityPub Person objects from database
- **Collection Dispatchers**: Handle followers, following, outbox with posts
- **Object Dispatcher**: Serves individual posts as Note objects
- **Automatic URL Generation**: Fedify generates proper ActivityPub URLs
- **Type Safety**: Uses Fedify's Person, Note, Create, Image classes

### Federation Flow (Current)
1. Other server discovers user via WebFinger
2. Fetches ActivityPub profile with proper Accept header
3. Fedify automatically serves correct Person object
4. Server fetches user's outbox to see posts
5. Posts appear as Create activities containing Note objects with image attachments
6. Individual posts accessible as standalone Note objects


### Unified Post Response Format
All posts (local and external) return the same structure for consistent frontend development:

```typescript
{
  id: string,                    // Local: MongoDB ID, External: ActivityPub URL
  type: 'local' | 'external',    // Source indicator
  author: {
    id: string,                  // Author identifier
    username: string,            // Username without domain
    domain: string,              // "localhost:8000" or "mastodon.social"
    displayName: string,         // Display name
    avatarUrl?: string,          // Profile picture
    isLocal: boolean             // Local vs external user
  },
  content: {
    text: string,                // Plain text content
    hasMedia: boolean,           // Whether post has attachments
    mediaType?: 'image' | 'video' | null
  },
  media?: {
    type: 'image' | 'video',     // Media type
    url: string,                 // Media URL
    width?: number,              // Dimensions
    height?: number,
    altText?: string             // Accessibility text
  },
  engagement: {
    likesCount: number,          // Like count (0 for external)
    isLiked: boolean,            // User's like status (false for external)
    canInteract: boolean         // Whether user can like/reply
  },
  createdAt: Date,               // Publication date
  updatedAt?: Date,              // Last modified
  url?: string,                  // Web URL for post
  isReply: boolean,              // Reply status
}
```

## Current Architecture

### Services Overview
- **UserService**: Local and external user management, search, caching
- **PostService**: Local post CRUD, likes, media upload, ActivityPub publishing
- **ExternalPostService**: Fetch and parse posts from external ActivityPub servers
- **SearchService**: WebFinger discovery, external user lookup and caching
- **PostNormalizationService**: Convert local and external posts to unified format
- **ActivityService**: Handle ActivityPub federation activities (Create, Like, Delete)
- **S3Service**: Media upload, storage, and CDN management
- **RedisService**: Caching, rate limiting, session management
- **ActorParser**: Parse and normalize ActivityPub Actor objects across platforms
- **PostParser**: Parse and normalize ActivityPub Note/Article objects across platforms