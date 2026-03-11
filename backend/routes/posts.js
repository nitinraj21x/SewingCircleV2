const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Multer configuration for post images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/posts/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'post-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Middleware to verify user token
const verifyUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists and is approved
    const user = await User.findById(decoded.userId);
    if (!user || user.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'User not authorized'
      });
    }

    req.userId = decoded.userId;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', verifyUser, upload.array('images', 5), async (req, res) => {
  try {
    const { content, type, visibility, tags } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Post content is required'
      });
    }

    const postData = {
      author: req.userId,
      content: content.trim(),
      type: type || 'text',
      visibility: visibility || 'public'
    };

    // Add images if uploaded
    if (req.files && req.files.length > 0) {
      postData.images = req.files.map(file => `/uploads/posts/${file.filename}`);
      postData.type = 'image';
    }

    // Add tags if provided
    if (tags) {
      postData.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
    }

    const post = new Post(postData);
    await post.save();

    // Populate author info
    await post.populate('author', 'firstName lastName profilePicture headline');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Error creating post:', error);
    
    // Clean up uploaded files on error
    if (req.files) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError);
        }
      }
    }

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/posts/feed
// @desc    Get feed posts (public + connections)
// @access  Private
router.get('/feed', verifyUser, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Get user's connections
    const user = await User.findById(req.userId);
    const connectionIds = [...user.following, req.userId];

    // Get posts from connections and public posts
    const posts = await Post.find({
      $or: [
        { author: { $in: connectionIds } },
        { visibility: 'public' }
      ]
    })
      .populate('author', 'firstName lastName profilePicture headline')
      .populate('comments.author', 'firstName lastName profilePicture')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Post.countDocuments({
      $or: [
        { author: { $in: connectionIds } },
        { visibility: 'public' }
      ]
    });

    res.json({
      success: true,
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/posts/user/:userId
// @desc    Get posts by specific user
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ author: req.params.userId })
      .populate('author', 'firstName lastName profilePicture headline')
      .populate('comments.author', 'firstName lastName profilePicture')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Post.countDocuments({ author: req.params.userId });

    res.json({
      success: true,
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/posts/:id
// @desc    Get single post
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'firstName lastName profilePicture headline')
      .populate('comments.author', 'firstName lastName profilePicture');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.json({
      success: true,
      post
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/posts/:id
// @desc    Update post
// @access  Private (author only)
router.put('/:id', verifyUser, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is the author
    if (post.author.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }

    const { content, visibility, tags } = req.body;

    if (content) post.content = content.trim();
    if (visibility) post.visibility = visibility;
    if (tags) {
      post.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
    }

    await post.save();
    await post.populate('author', 'firstName lastName profilePicture headline');

    res.json({
      success: true,
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete post
// @access  Private (author only)
router.delete('/:id', verifyUser, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is the author
    if (post.author.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    // Delete associated images
    if (post.images && post.images.length > 0) {
      for (const imagePath of post.images) {
        try {
          const filename = path.basename(imagePath);
          const filePath = path.join(__dirname, '../uploads/posts', filename);
          await fs.unlink(filePath);
        } catch (error) {
          console.error('Error deleting image:', error);
        }
      }
    }

    await post.deleteOne();

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/posts/:id/like
// @desc    Like/unlike a post
// @access  Private
router.post('/:id/like', verifyUser, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const isLiked = post.isLikedBy(req.userId);

    if (isLiked) {
      post.removeLike(req.userId);
    } else {
      post.addLike(req.userId);
    }

    await post.save();
    await post.populate('author', 'firstName lastName profilePicture headline');

    res.json({
      success: true,
      message: isLiked ? 'Post unliked' : 'Post liked',
      liked: !isLiked,
      likeCount: post.likeCount,
      post
    });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/posts/:id/comment
// @desc    Add comment to post
// @access  Private
router.post('/:id/comment', verifyUser, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    post.addComment(req.userId, content.trim());
    await post.save();
    
    await post.populate('author', 'firstName lastName profilePicture headline');
    await post.populate('comments.author', 'firstName lastName profilePicture');

    res.json({
      success: true,
      message: 'Comment added successfully',
      post
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/posts/:id/comment/:commentId
// @desc    Delete comment from post
// @access  Private (comment author or post author)
router.delete('/:id/comment/:commentId', verifyUser, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user is comment author or post author
    if (
      comment.author.toString() !== req.userId.toString() &&
      post.author.toString() !== req.userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    comment.deleteOne();
    await post.save();
    
    await post.populate('author', 'firstName lastName profilePicture headline');
    await post.populate('comments.author', 'firstName lastName profilePicture');

    res.json({
      success: true,
      message: 'Comment deleted successfully',
      post
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
