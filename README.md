# konnect

## Current

### Working
- **Google OAuth Authentication** - Users register/login with Google
- **Federated Identity** - Each user gets a unique ActivityPub identity
- **WebFinger Discovery** - Other servers can find your users
- **ActivityPub Actor Profiles** - Users have proper ActivityPub Person objects
- **JWT Authentication** - API access with Bearer tokens
- **Username Management** - Check availability, update usernames

### How it Works

1. **User Registration**: `alice` registers becomes `@alice@localhost:8000`
2. **WebFinger**: Other servers discover Alice via `/.well-known/webfinger?resource=acct:alice@localhost:8000`
3. **ActivityPub Profile**: Servers fetch Alice's profile with `Accept: application/activity+json`
4. **Future**: Other instances can follow Alice, see her posts, send likes/comments


### Google OAuth Flow
```bash
# Visit in browser
http://localhost:8000/auth/google
```
**Expected**: Redirects to Google  Login  Returns JWT token and user info

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
```

## Current Endpoints work in progress

### Authentication
- `GET /auth/google` - Start Google OAuth flow
- `GET /auth/google/callback` - OAuth callback
- `GET /auth/me` - Get current user (requires auth)
- `PUT /auth/username` - Update username (requires auth)
- `GET /auth/check-username/:username` - Check availability

### Federation
- `GET /.well-known/webfinger` - WebFinger user discovery
- `GET /users/:username` - User profile (web) or ActivityPub Person object, depends on activity+json
- `GET /users/:username/outbox` - User's posts (ActivityPub, empty for now)
- `GET /users/:username/followers` - User's followers (ActivityPub, empty for now)
- `GET /users/:username/following` - User's following (ActivityPub, empty for now)

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
  createdAt: Date,
  updatedAt: Date
}
```

### Content Negotiation
Same URL serves different content based on `Accept` header:
- `Accept: text/html` → Web profile (handled by Express route)
- `Accept: application/activity+json` → ActivityPub Person object (handled by Fedify)

### Fedify use
- **Actor Dispatcher**: Serves ActivityPub Person objects from database
- **Collection Dispatchers**: Handle followers, following, outbox (empty for now)
- **Automatic URL Generation**: Fedify generates proper ActivityPub URLs
- **Type Safety**: Uses Fedify's `Person` and `Image` classes

### Federation Flow (Current)
1. Other server discovers user via WebFinger
2. Fetches ActivityPub profile with proper Accept header
3. Fedify automatically serves correct Person object
4. (Future) Other servers can send Follow, Like, Create activities
