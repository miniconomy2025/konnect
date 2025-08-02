import { Router } from 'express';
import multer from 'multer';
import { PostService } from '../services/postserivce.js';
import { PostNormalizationService } from '../services/postNormalizationService.js';
import { requireAuth, optionalAuth } from '../middlewares/auth.js';
import type { IPost } from '../models/post.ts';
import { Types } from 'mongoose';
import type { IUser } from '../models/user.ts';

const router = Router();
const postService = new PostService();

function hasPopulatedAuthor(post: IPost): post is IPost & { author: IUser } {
  return post.author && !(post.author instanceof Types.ObjectId) && 'username' in post.author;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, 
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
  },
});

router.post('/', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const { caption } = req.body;
    
    if (!caption) {
      return res.status(400).json({ error: 'Caption is required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }

    if (caption.length > 2200) {
      return res.status(400).json({ error: 'Caption must be 2200 characters or less' });
    }

    const mediaUrl = await postService.uploadImage(
      req.file.buffer,
      req.file.mimetype,
      req.user!._id!.toString()
    );

    const post = await postService.createPost({
      authorId: req.user!._id!.toString(),
      caption,
      mediaUrl,
      mediaType: req.file.mimetype,
    });

    const populatedPost = await postService.getPostById(post._id.toString());
    
    if (!populatedPost || !hasPopulatedAuthor(populatedPost)) {
      return res.status(500).json({ error: 'Failed to retrieve created post' });
    }

    const unifiedPost = PostNormalizationService.localPostToUnified(
      populatedPost, 
      req.user!._id!.toString()
    );

    res.status(201).json(unifiedPost);
  } catch (error) {
    console.error('Post creation error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await postService.getPostById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (!hasPopulatedAuthor(post)) {
      return res.status(500).json({ error: 'Something went wrong' });
    }

    const unifiedPost = PostNormalizationService.localPostToUnified(
      post, 
      req.user?._id?.toString()
    );

    res.json(unifiedPost);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

router.get('/user/:username', optionalAuth, async (req, res) => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const { UserService } = await import('../services/userService.js');
    const userService = new UserService();
    const user = await userService.findByUsername(username);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const posts = await postService.getUserPosts(user._id.toString(), page, limit);
    
    const unifiedPosts = PostNormalizationService.localPostsToUnified(
      posts,
      req.user?._id?.toString()
    );

    res.json({
      user: {
        username: user.username,
        domain: user.domain,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        isLocal: user.isLocal
      },
      posts: unifiedPosts,
      page,
      limit,
      hasMore: posts.length === limit,
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ error: 'Failed to fetch user posts' });
  }
});

// Get feed (timeline)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const includeExternal = req.query.includeExternal === 'true';
    const feedType = req.query.type as string || 'local';

    if (includeExternal || feedType === 'mixed') {
      const localPosts = await postService.getFeedPosts(
        req.user?._id?.toString() || '',
        page,
        Math.ceil(limit / 2)
      );

      // TODO: When follows are implemented, get external posts
      // const followedUsers = await userService.getFollowedExternalUsers(req.user._id);
      // const externalPostsPromises = followedUsers.map(user => 
      //   externalPostService.getUserPosts(user.username, user.domain, Math.ceil(limit / 2))
      // );
      // const externalPostsArrays = await Promise.all(externalPostsPromises);
      // const externalPosts = externalPostsArrays.flat();

      const externalPosts: any[] = []; 

      const unifiedPosts = PostNormalizationService.mixAndSortPosts(
        localPosts,
        externalPosts,
        req.user?._id?.toString()
      );

      let filteredPosts = unifiedPosts;

      const finalPosts = filteredPosts.slice(0, limit);

      return res.json({
        posts: finalPosts,
        page,
        limit,
        hasMore: filteredPosts.length > limit,
        sources: {
          local: localPosts.length,
          external: externalPosts.length
        },
        type: 'mixed'
      });
    }

    const posts = await postService.getFeedPosts(
      req.user?._id?.toString() || '',
      page,
      limit
    );
    
    let unifiedPosts = PostNormalizationService.localPostsToUnified(
      posts,
      req.user?._id?.toString()
    );

    res.json({
      posts: unifiedPosts,
      page,
      limit,
      hasMore: posts.length === limit,
      sources: {
        local: unifiedPosts.length,
        external: 0
      },
      type: 'local'
    });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

router.post('/:id/like', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await postService.likePost(id, req.user!._id!.toString());
    
    res.json(result);
  } catch (error) {
    console.error('Like post error:', error);
    if (error instanceof Error && error.message === 'Post not found') {
      res.status(404).json({ error: 'Post not found' });
    } else {
      res.status(500).json({ error: 'Failed to like/unlike post' });
    }
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const success = await postService.deletePost(id, req.user!._id!.toString());
    
    if (!success) {
      return res.status(404).json({ error: 'Post not found or you are not the author' });
    }

    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

export default router;