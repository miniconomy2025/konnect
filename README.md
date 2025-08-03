# Konnect API Documentation

#### Check Current User
```
GET /auth/me
```
Returns current user profile including follow counts.

**Response:**
```json
{
  "id": "user_id",
  "username": "johndoe",
  "displayName": "John Doe",
  "email": "john@example.com",
  "bio": "Hello world",
  "avatarUrl": "https://...",
  "actorId": "http://localhost:8000/users/johndoe",
  "followersCount": 25,
  "followingCount": 50,
  "postsCount": 0
}
```

### 2. User Search and Discovery

#### Search Users (Local and External)
```
GET /search/users?q=alex&page=1&limit=20
```

**Query Parameters:**
- `q`: Search query (username, display name, or @user@domain format)
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 50)

**Response:**
```json
{
  "query": "alex",
  "results": [
    {
      "username": "alex",
      "domain": "mastodon.social",
      "displayName": "Alex Smith",
      "avatarUrl": "https://...",
      "actorId": "https://mastodon.social/users/alex",
      "isLocal": false,
      "bio": "Developer from SF",
      "isPrivate": false
    }
  ],
  "page": 1,
  "limit": 20,
  "hasMore": false
}
```

#### Lookup Specific External User
```
GET /search/external/alex/mastodon.social
```
Returns detailed information about a specific external user.

### 3. User Profiles

#### Get User Profile
```
GET /users/username
```

**Response:**
```json
{
  "username": "johndoe",
  "displayName": "John Doe",
  "bio": "Hello world",
  "avatarUrl": "https://...",
  "joinDate": "2024-01-01T00:00:00.000Z",
  "activityPubId": "http://localhost:8000/users/johndoe",
  "isPrivate": false
}
```

### 4. Following System

#### Follow a User
```
POST /follows/follow
```

**Request Body:**
```json
{
  "targetUserActorID": "https://mastodon.social/users/alex"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully followed user",
  "following": true
}
```

#### Unfollow a User
```
POST /follows/unfollow
```

**Request Body:**
```json
{
  "targetUserActorID": "https://mastodon.social/users/alex"
}
```

#### Check Follow Status
```
GET /follows/status/user_id
```

**Response:**
```json
{
  "following": true,
  "followedBy": false
}
```

#### Get User's Followers and Following
```
GET /follows/users/username?page=1&limit=20
```

**Response:**
```json
{
  "followers": [
    {
      "actor": {
        "actorId": "https://mastodon.social/users/alex",
        "username": "alex",
        "displayName": "Alex Smith",
        "avatarUrl": "https://..."
      }
    }
  ],
  "following": [
    {
      "object": {
        "actorId": "https://mastodon.social/users/jane",
        "username": "jane",
        "displayName": "Jane Doe",
        "avatarUrl": "https://..."
      }
    }
  ],
  "page": 1,
  "limit": 20
}
```

### 5. Posts and Timeline

#### Create a Post
```
POST /posts
Content-Type: multipart/form-data
```

**Form Data:**
- `caption`: Text content (required, max 2200 chars)
- `image`: Image file (required, max 10MB, JPEG/PNG/WebP)

**Response:**
```json
{
  "id": "post_id",
  "type": "local",
  "author": {
    "id": "user_id",
    "username": "johndoe",
    "domain": "localhost:8000",
    "displayName": "John Doe",
    "avatarUrl": "https://...",
    "isLocal": true
  },
  "content": {
    "text": "Hello world!",
    "hasMedia": true,
    "mediaType": "image"
  },
  "media": {
    "type": "image",
    "url": "https://...",
    "altText": null
  },
  "engagement": {
    "likesCount": 0,
    "isLiked": false,
    "canInteract": true
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "url": "http://localhost:8000/posts/post_id",
  "isReply": false
}
```

#### Get Timeline Feed
```
GET /posts?page=1&limit=20&type=timeline
```

**Query Parameters:**
- `page`: Page number
- `limit`: Posts per page
- `type`: "timeline" (following) or "public" (all posts)

**Response:**
```json
{
  "posts": [
    {
      "id": "post_id",
      "type": "local",
      "author": {
        "id": "user_id",
        "username": "johndoe",
        "domain": "localhost:8000",
        "displayName": "John Doe",
        "avatarUrl": "https://...",
        "isLocal": true
      },
      "content": {
        "text": "Hello world!",
        "hasMedia": true,
        "mediaType": "image"
      },
      "engagement": {
        "likesCount": 5,
        "isLiked": false,
        "canInteract": true
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "hasMore": true,
  "sources": {
    "local": 10,
    "federated": 10
  },
  "type": "timeline"
}
```

#### Get User's Posts
```
GET /posts/user/username?page=1&limit=20
```

#### Get Single Post
```
GET /posts/post_id
```

#### Like/Unlike Post
```
POST /posts/post_id/like
```

**Response:**
```json
{
  "success": true,
  "likesCount": 6,
  "isLiked": true
}
```

### 6. External Content

#### Get External User's Posts
```
GET /search/posts/alex/mastodon.social?limit=20
```

**Response:**
```json
{
  "user": "alex@mastodon.social",
  "posts": [
    {
      "id": "external_post_id",
      "type": "external",
      "author": {
        "username": "alex",
        "domain": "mastodon.social",
        "displayName": "Alex Smith",
        "isLocal": false
      },
      "content": {
        "text": "Post content here",
        "hasMedia": false
      },
      "engagement": {
        "likesCount": 0,
        "isLiked": false,
        "canInteract": false
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

## Common UI Flows

### Search and Follow External User

1. **Search for user:**
   ```
   GET /search/users?q=alex@mastodon.social
   ```

2. **Display user in search results**

3. **View user profile:**
   ```
   GET /search/external/alex/mastodon.social
   ```

4. **Follow user:**
   ```
   POST /follows/follow
   Body: { "targetUserActorID": "https://mastodon.social/users/alex" }
   ```

5. **View their posts:**
   ```
   GET /search/posts/alex/mastodon.social
   ```

### Timeline Flow

1. **Get timeline:**
   ```
   GET /posts?type=timeline&page=1&limit=20
   ```

2. **Timeline includes both local and external posts from followed users**

3. **Like a post:**
   ```
   POST /posts/post_id/like
   ```

### User Profile Flow

1. **Get user info:**
   ```
   GET /users/username
   ```

2. **Get user's posts:**
   ```
   GET /posts/user/username
   ```

3. **Get follow relationships:**
   ```
   GET /follows/users/username
   ```

4. **Check if you follow them:**
   ```
   GET /follows/status/user_id
   ```

## Error Responses

All endpoints return errors in this format:
```json
{
  "error": "Error message here"
}
```