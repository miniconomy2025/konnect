import { Router } from 'express';
import multer from 'multer';
import { PostService } from '../services/postserivce.ts';
import { requireAuth, optionalAuth } from '../middlewares/auth.js';
import type { PostResponse } from '../types/post.js';
import type { IPost } from '../models/post.ts';
import { Types } from 'mongoose';
import type { IUser } from '../models/user.ts';

const router = Router();
const postService = new PostService();

function hasPopulatedAuthor(post: IPost): post is IPost & { author: IUser } {
  return post.author && !(post.author instanceof Types.ObjectId) && 'username' in post.author;
}

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
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

// Get presigned URL for direct upload to S3
router.post('/upload-url', requireAuth, async (req, res) => {
  try {
    const { mimeType } = req.body;
    
    if (!mimeType) {
      return res.status(400).json({ error: 'mimeType is required' });
    }

    const { uploadUrl, imageUrl } = await postService.getPresignedUploadUrl(
      mimeType,
      req.user!._id!.toString()
    );

    res.json({ uploadUrl, imageUrl });
  } catch (error) {
    console.error('Upload URL generation error:', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to generate upload URL' });
  }
});

// Upload image through backend (alternative to presigned URL)
router.post('/upload', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imageUrl = await postService.uploadImage(
      req.file.buffer,
      req.file.mimetype,
      req.user!._id!.toString()
    );

    res.json({ imageUrl });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to upload image' });
  }
});

// Create a new post
router.post('/', requireAuth, async (req, res) => {
  try {
    const { caption, mediaUrl, mediaType } = req.body;
    
    if (!caption || !mediaUrl || !mediaType) {
      return res.status(400).json({ error: 'caption, mediaUrl, and mediaType are required' });
    }

    if (caption.length > 2200) {
      return res.status(400).json({ error: 'Caption must be 2200 characters or less' });
    }

    const post = await postService.createPost({
      authorId: req.user!._id!.toString(),
      caption,
      mediaUrl,
      mediaType,
    });

    const populatedPost = await postService.getPostById(post._id.toString());

    if (!populatedPost || !hasPopulatedAuthor(populatedPost)) {
      return res.status(500).json({ error: 'Failed to retrieve created post' });
    }
    
    const response: PostResponse = {
      id: populatedPost!._id.toString(),
      author: {
        id: populatedPost!.author._id.toString(),
        username: populatedPost!.author.username,
        displayName: populatedPost!.author.displayName,
        avatarUrl: populatedPost!.author.avatarUrl,
      },
      caption: populatedPost!.caption,
      mediaUrl: populatedPost!.mediaUrl,
      mediaType: populatedPost!.mediaType,
      activityId: populatedPost!.activityId,
      likesCount: populatedPost!.likesCount,
      isLiked: false, // User just created it, so not liked yet
      createdAt: populatedPost!.createdAt,
      updatedAt: populatedPost!.updatedAt,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Post creation error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Get a specific post
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await postService.getPostById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const isLiked = req.user ? 
      await postService.isPostLikedByUser(id, req.user._id!.toString()) : 
      false;
    
    if (!hasPopulatedAuthor(post)) {
      return res.status(500).json({ error: 'Something went wrong retrieving post' });
    }

    const response: PostResponse = {
      id: post._id.toString(),
      author: {
        id: post.author._id.toString(),
        username: post.author.username,
        displayName: post.author.displayName,
        avatarUrl: post.author.avatarUrl,
      },
      caption: post.caption,
      mediaUrl: post.mediaUrl,
      mediaType: post.mediaType,
      activityId: post.activityId,
      likesCount: post.likesCount,
      isLiked,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };

    res.json(response);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Get user's posts
router.get('/user/:username', optionalAuth, async (req, res) => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    // First find the user by username
    const { UserService } = await import('../services/userService.js');
    const userService = new UserService();
    const user = await userService.findByUsername(username);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const posts = await postService.getUserPosts(user._id.toString(), page, limit);
    const postsWithLikeStatus = await postService.getPostsWithLikeStatus(
      posts,
      req.user?._id?.toString()
    );

    res.json({
      posts: postsWithLikeStatus,
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

    const posts = req.user ?
      await postService.getFeedPosts(req.user._id!.toString(), page, limit) :
      await postService.getFeedPosts('', page, limit);
    
    const postsWithLikeStatus = await postService.getPostsWithLikeStatus(
      posts,
      req.user?._id?.toString()
    );

    res.json({
      posts: postsWithLikeStatus,
      page,
      limit,
      hasMore: posts.length === limit,
    });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

// Like/unlike a post
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

// Delete a post
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