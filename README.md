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

A fully federated social media platform built with ActivityPub, supporting cross-instance communication with platforms like Mastodon, Pleroma, and other fediverse applications.

## Features

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
- **Follow System** - Follow/unfollow users with ActivityPub federation
- **Inbox System** - Receive and store ActivityPub activities
- **Federation Middleware** - Proper ActivityPub request handling
- **Key Pair Management** - Cryptographic keys for ActivityPub signatures
- **Outgoing Federation** - Send activities to other servers
- **Incoming Federation** - Receive and process activities from other servers
- **Public Followers/Following Lists** - ActivityPub collections for social connections

## Quick Start

### 1. Environment Setup

Create a `.env` file in the `backend` directory:

```bash
# Domain Configuration (REQUIRED for federation)
DOMAIN=your-tunnel-url.ngrok.io
BASE_URL=https://your-tunnel-url.ngrok.io

# Database
MONGODB_URI=mongodb://localhost:27017/konnect

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# JWT Secret
JWT_SECRET=your-jwt-secret

# AWS S3 (for image uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=your-aws-region
S3_BUCKET_NAME=your-s3-bucket
```

### 2. Tunnel Setup (for federation testing)

For federation to work, you need a public URL. **Fedify tunnel is recommended** for ActivityPub testing:

#### Option 1: Fedify Tunnel (Recommended)

```bash
# Install Fedify CLI
npm install -g @fedify/cli

# Start your backend server
cd backend
npm run dev

# In another terminal, create Fedify tunnel
fedify tunnel <port>

# Copy the HTTPS URL (e.g., https://abc123.lhr.life)
# Update your .env file with this URL
DOMAIN=abc123.lhr.life
BASE_URL=https://abc123.fedify.dev
```

### 3. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 4. Start the Application

```bash
# Backend (from backend directory)
npm run dev

# Frontend (from frontend directory)
npm run dev
```

## Federation Testing

### Local Testing

```bash
# Test WebFinger discovery
curl "http://localhost:8000/.well-known/webfinger?resource=acct:alice@localhost:8000"

# Test ActivityPub profile
curl -H "Accept: application/activity+json" http://localhost:8000/users/alice

# Test followers/following lists
curl -H "Accept: application/activity+json" http://localhost:8000/users/alice/followers
curl -H "Accept: application/activity+json" http://localhost:8000/users/alice/following
```

### Cross-Instance Federation Testing

With your tunnel URL configured, you can test federation with other servers:

```bash
# Test outgoing follow to Mastodon
curl -X POST http://localhost:8000/inboxes/users/someuser/ \
--header 'Content-Type: application/json' \
--data-raw '{
    "type": "Follow",
    "actor": "https://your-tunnel-url.fedify.dev/users/someuser",
    "object": "https://mastodon.social/users/katlego_sekoele_bbd"
}'

# Test incoming follow from Mastodon
# (This happens automatically when someone follows your user from Mastodon)
```

### Federation with Fedify CLI

```bash
# Install Fedify CLI
npm install -g @fedify/cli

# Test your user's ActivityPub profile
fedify lookup https://your-tunnel-url.fedify.dev/users/someuser

# Test WebFinger discovery
fedify lookup acct:someuser@your-tunnel-url.fedify.dev

# Test followers/following collections
fedify lookup https://your-tunnel-url.fedify.dev/users/someuser/followers
fedify lookup https://your-tunnel-url.fedify.dev/users/someuser/following
```

## How it Works

### ActivityPub Federation Flow

1. **User Registration**: `alice` registers becomes `@alice@your-domain.com`
2. **WebFinger Discovery**: Other servers discover Alice via `/.well-known/webfinger?resource=acct:alice@your-domain.com`
3. **ActivityPub Profile**: Servers fetch Alice's profile with `Accept: application/activity+json`
4. **Post Creation**: Users upload images and create posts with captions
5. **Federation**: Posts appear in user outboxes as ActivityPub Create activities
6. **Likes**: Users can like/unlike posts with duplicate prevention
7. **User Discovery**: Search for local users or discover external users via WebFinger lookups
8. **External Content Browsing**: View posts from any fediverse user without following
9. **Follow System**: Users can follow each other with ActivityPub Follow/Accept activities
10. **Inbox Processing**: Incoming activities are stored and processed in user inboxes
11. **Federation Security**: ActivityPub requests are properly handled with cryptographic signatures

### Follow System

#### Incoming Follows
1. **Remote user follows local user** via ActivityPub Follow activity
2. **Automatic Accept response** sent back to the follower
3. **Follow relationship stored** in local database
4. **Activity logged** in user's inbox

#### Outgoing Follows
1. **Local user follows remote user** via API or inbox route
2. **Follow activity sent** to remote user's inbox
3. **Follow relationship stored** in local database
4. **Remote server processes** the follow request

### Inbox System

The inbox system handles both incoming and outgoing ActivityPub activities:

- **Incoming Activities**: Stored and processed automatically
- **Outgoing Activities**: Sent to remote servers when targeting external users
- **Activity Types**: Currently supports Follow activities

## API Testing

### Google OAuth Flow
```bash
# Visit in browser
http://localhost:8000/auth/google
```
**Expected**: Redirects to Google Login, returns JWT token and user info

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

### Test Follow System
```bash
# Get user's followers and following
curl "http://localhost:8000/follows/users/alice?page=1&limit=20"

# Follow a user
curl -X POST -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"targetUserId":"user_id_to_follow"}' \
     http://localhost:8000/follows
```

### Test Inbox System
```bash
# Get user's inbox activities
curl "http://localhost:8000/inboxes/users/alice?page=1&limit=20"

# Add activity to user's inbox (for testing)
curl -X POST -H "Content-Type: application/json" \
     -d '{
       "type": "Follow",
       "actor": "https://remote-server.com/users/bob",
       "object": "https://localhost:8000/users/alice",
       "summary": "Bob followed Alice"
     }' \
     http://localhost:8000/inboxes/users/alice

# Test outgoing follow to remote user
curl -X POST -H "Content-Type: application/json" \
     -d '{
       "type": "Follow",
       "actor": "https://localhost:8000/users/alice",
       "object": "https://mastodon.social/users/bob"
     }' \
     http://localhost:8000/inboxes/users/alice
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

### Test ActivityPub Federation
```bash
# Get ActivityPub Person object (what other servers see)
curl -H "Accept: application/activity+json" http://localhost:8000/users/alice

# Get regular web profile
curl -H "Accept: text/html" http://localhost:8000/users/alice

# Get user's outbox (shows posts as ActivityPub activities)
curl -H "Accept: application/activity+json" http://localhost:8000/users/alice/outbox

# Get user's inbox (shows received activities)
curl -H "Accept: application/activity+json" http://localhost:8000/users/alice/inbox

# Get user's followers (ActivityPub collection)
curl -H "Accept: application/activity+json" http://localhost:8000/users/alice/followers

# Get user's following (ActivityPub collection)
curl -H "Accept: application/activity+json" http://localhost:8000/users/alice/following

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

### Follow System
- `GET /follows/users/:username` - Get user's followers and following
- `POST /follows` - Follow a user (requires auth)

### Inbox System
- `GET /inboxes/users/:username` - Get user's inbox activities
- `POST /inboxes/users/:username` - Add activity to user's inbox

### Search
- `GET /search/users` - Search for users (local and external)
- `GET /search/external/:username/:domain` - Lookup specific external user
- `GET /search/posts/:username/:domain` - Browse external user's posts (unified format)
- `GET /search/post` - Get specific external post by URL (unified format)

### Federation
- `GET /.well-known/webfinger` - WebFinger user discovery
- `GET /users/:username` - User profile (web) or ActivityPub Person object
- `GET /users/:username/outbox` - User's posts as ActivityPub activities
- `GET /users/:username/inbox` - User's received activities (ActivityPub)
- `GET /users/:username/followers` - User's followers (ActivityPub collection)
- `GET /users/:username/following` - User's following (ActivityPub collection)
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
  keyPairs: [                // Cryptographic keys for ActivityPub
    {
      publicKey: JsonWebKey,
      privateKey: JsonWebKey
    }
  ],
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

### Inbox Activities Collection
```typescript
{
  _id: ObjectId,
  inboxId: string,           // User's inbox identifier
  object: {
    type: string,            // Activity type (e.g., "Follow")
    summary?: string,        // Human-readable summary
    actor: {
      id: string,            // Actor URI
      ref?: ObjectId         // Reference to local User (if local)
    },
    object: {
      id: string,            // Object URI
      ref?: ObjectId         // Reference to local User (if local)
    },
    target?: string,         // Target URI
    origin?: string,         // Origin URI (for duplicate detection)
    activityId: string       // Unique activity identifier
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Follows Collection
```typescript
{
  _id: ObjectId,
  actor: {
    id: string,              // Actor URI (who is following)
    ref?: ObjectId           // Reference to local User (if local)
  },
  object: {
    id: string,              // Object URI (who is being followed)
    ref?: ObjectId           // Reference to local User (if local)
  },
  activity: {
    id: string,              // Activity URI
    ref?: ObjectId           // Reference to InboxActivity
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Technical Details

### Content Negotiation
Same URL serves different content based on `Accept` header:
- `Accept: text/html` → Web profile/post (handled by Express route)
- `Accept: application/activity+json` → ActivityPub objects (handled by Fedify)

### Fedify Integration
- **Actor Dispatcher**: Serves ActivityPub Person objects from database
- **Collection Dispatchers**: Handle followers, following, outbox with posts
- **Inbox Dispatcher**: Serves user's inbox activities
- **Object Dispatcher**: Serves individual posts as Note objects
- **Inbox Listeners**: Process incoming Follow activities with automatic Accept responses
- **Key Pair Dispatcher**: Manages cryptographic keys for ActivityPub signatures
- **Automatic URL Generation**: Fedify generates proper ActivityPub URLs
- **Type Safety**: Uses Fedify's Person, Note, Create, Image, Follow, Accept classes

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
### Federation Security
- **Cryptographic Signatures**: All outgoing activities are signed with user's private key
- **Key Pair Management**: Each user has RSA key pairs for ActivityPub signatures
- **Signature Verification**: Incoming activities are verified against sender's public key
- **HTTPS Required**: Federation requires HTTPS for security

### S3 Configuration
- Public read access for uploaded images
- Write access restricted to authenticated API
- Images stored in `posts/{userId}/` structure
- Supports JPEG, PNG, WebP formats up to 10MB

## Troubleshooting

### Common Issues

1. **Federation not working**: Ensure `DOMAIN` environment variable is set to your tunnel URL
2. **Activities not sending**: Check that your tunnel URL is accessible from the internet
3. **Signature verification failing**: Ensure HTTPS is used for federation
4. **Follows not being accepted**: Check that the user exists
