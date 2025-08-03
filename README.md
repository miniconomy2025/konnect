# Konnect Backend

ActivityPub-based social media platform with Instagram-like post feeds and cross-instance federation.

## Core Features

- Google OAuth authentication with username selection
- Image posts with captions (S3 storage)
- Follow/unfollow users (local and external)
- Timeline feeds with federated content
- ActivityPub federation with Mastodon, Pleroma, etc.

## Federation Flow

1. **User Discovery**: Search `@user@domain.com` → WebFinger lookup → Store external user
2. **Following**: Send ActivityPub Follow → External server sends Accept → Relationship stored
3. **Content**: External user posts → Create activity sent to our inbox → Appears in timeline
4. **Our Posts**: Local user posts → Create activity sent to external followers' inboxes

## API Endpoints

### Authentication

```http
GET /auth/google
# Redirects to Google OAuth, returns to frontend with token

GET /auth/me
Authorization: Bearer <token>
# Returns user profile with follow counts

PUT /auth/username
Authorization: Bearer <token>
Content-Type: application/json
{ "username": "newname" }
# Update username (one-time only)

GET /auth/check-username/:username
# Check if username is available
```

### Posts

```http
POST /posts
Authorization: Bearer <token>
Content-Type: multipart/form-data
# Form data: image (file), caption (string)
# Creates post, federates to external followers

GET /posts/:id
# Get specific post (unified format)

GET /posts/user/:username?page=1&limit=20
# Get user's posts (unified format)

GET /posts?type=timeline&page=1&limit=20
Authorization: Bearer <token>
# Timeline feed (posts from followed users)

GET /posts?type=public&page=1&limit=20
# Public feed (all local posts)

POST /posts/:id/like
Authorization: Bearer <token>
# Like/unlike post (local posts only)

DELETE /posts/:id
Authorization: Bearer <token>
# Delete own post
```

### Follow System

```http
GET /follows/users/:username?page=1&limit=20
# Get user's followers and following lists

POST /follows/follow
Authorization: Bearer <token>
Content-Type: application/json
{ "targetUserId": "user_id" }
# Follow user (local or external), sends ActivityPub Follow if external

POST /follows/unfollow
Authorization: Bearer <token>
Content-Type: application/json
{ "targetUserId": "user_id" }
# Unfollow user, sends ActivityPub Undo if external

GET /follows/status/:targetUserId
Authorization: Bearer <token>
# Check follow relationship status
```

### Search

```http
GET /search/users?q=alice
# Search local users

GET /search/users?q=@alice@mastodon.social
# Search external users via WebFinger

GET /search/external/:username/:domain
# Direct external user lookup
```

### User Profiles

```http
GET /users/:username
# Get user profile (web format, not ActivityPub)
```

## Response Formats

### Unified Post Response
```json
{
  "id": "post_id",
  "type": "local|external",
  "author": {
    "id": "user_id",
    "username": "alice",
    "domain": "localhost:8000",
    "displayName": "Alice Smith",
    "avatarUrl": "https://...",
    "isLocal": true
  },
  "content": {
    "text": "Post caption",
    "hasMedia": true,
    "mediaType": "image"
  },
  "media": {
    "type": "image",
    "url": "https://...",
    "altText": "Description"
  },
  "engagement": {
    "likesCount": 5,
    "isLiked": false,
    "canInteract": true
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "url": "https://...",
  "isReply": false
}
```

### User Profile Response
```json
{
  "id": "user_id",
  "username": "alice",
  "displayName": "Alice Smith",
  "email": "alice@example.com",
  "bio": "Bio text",
  "avatarUrl": "https://...",
  "actorId": "https://domain.com/users/alice",
  "followersCount": 10,
  "followingCount": 5,
  "postsCount": 0
}
```

## Testing Examples

### 1. Complete User Flow
```bash
# 1. Register/Login
curl "http://localhost:8000/auth/google"

# 2. Check profile
curl -H "Authorization: Bearer $TOKEN" \
     "http://localhost:8000/auth/me"

# 3. Create post
curl -X POST -H "Authorization: Bearer $TOKEN" \
     -F "image=@photo.jpg" \
     -F "caption=Hello world" \
     "http://localhost:8000/posts"

# 4. Get timeline
curl -H "Authorization: Bearer $TOKEN" \
     "http://localhost:8000/posts?type=timeline"
```

### 2. Follow External User
```bash
# 1. Search external user
curl "http://localhost:8000/search/users?q=@alice@mastodon.social"

# 2. Follow them (use returned user ID)
curl -X POST -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"targetUserId":"USER_ID"}' \
     "http://localhost:8000/follows/follow"

# 3. Check timeline for their posts
curl -H "Authorization: Bearer $TOKEN" \
     "http://localhost:8000/posts?type=timeline"
```

### 3. ActivityPub Federation Testing
```bash
# Test WebFinger discovery
curl "http://localhost:8000/.well-known/webfinger?resource=acct:alice@localhost:8000"

# Test ActivityPub profile
curl -H "Accept: application/activity+json" \
     "http://localhost:8000/users/alice"

# Test outbox
curl -H "Accept: application/activity+json" \
     "http://localhost:8000/users/alice/outbox"
```

## Federation Notes

- External users are cached locally when discovered via search
- Follow relationships work with any ActivityPub server
- Our posts federate to external followers automatically
- External posts appear in timeline for followed users

## Error Handling

All endpoints return consistent error format:
```json
{
  "error": "Error message",
  "message": "Additional details"
}
```

Common HTTP status codes: 400 (bad request), 401 (unauthorized), 404 (not found), 500 (server error)