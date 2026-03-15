const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware to verify admin token
const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // The admin token contains { id: adminId }
    // Store it for use in routes
    req.adminId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// @route   GET /api/admin/users/pending
// @desc    Get all pending user registrations
// @access  Private (Admin only)
router.get('/pending', verifyAdmin, async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: 'pending' })
      .select('-password')
      .sort({ createdAt: -1 });

    console.log(`Found ${pendingUsers.length} pending users`);

    res.json({
      success: true,
      count: pendingUsers.length,
      users: pendingUsers
    });
  } catch (error) {
    console.error('Error fetching pending users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with filters
// @access  Private (Admin only)
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/admin/users/profiles/detailed
// @desc    Get detailed user profiles with post counts
// @access  Private (Admin only)
router.get('/profiles/detailed', verifyAdmin, async (req, res) => {
  try {
    const Post = require('../models/Post');
    
    // Get all approved users
    const users = await User.find({ status: 'approved' })
      .select('-password')
      .sort({ createdAt: -1 });

    // Get post counts for each user
    const usersWithDetails = await Promise.all(
      users.map(async (user) => {
        const postCount = await Post.countDocuments({ author: user._id });
        return {
          ...user.toObject(),
          postCount,
          isOnline: user.isOnline || false
        };
      })
    );

    res.json({
      success: true,
      users: usersWithDetails,
      total: usersWithDetails.length
    });
  } catch (error) {
    console.error('Error fetching detailed profiles:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/admin/users/:id/posts
// @desc    Get all posts by a specific user
// @access  Private (Admin only)
router.get('/:id/posts', verifyAdmin, async (req, res) => {
  try {
    const Post = require('../models/Post');
    
    const posts = await Post.find({ author: req.params.id })
      .populate('author', 'firstName lastName profilePicture headline')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      posts,
      total: posts.length
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

// @route   GET /api/admin/users/stats/overview
// @desc    Get user statistics
// @access  Private (Admin only)
router.get('/stats/overview', verifyAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const pendingUsers = await User.countDocuments({ status: 'pending' });
    const approvedUsers = await User.countDocuments({ status: 'approved' });
    const rejectedUsers = await User.countDocuments({ status: 'rejected' });
    const suspendedUsers = await User.countDocuments({ status: 'suspended' });
    const onlineUsers = await User.countDocuments({ isOnline: true });

    res.json({
      success: true,
      stats: {
        total: totalUsers,
        pending: pendingUsers,
        approved: approvedUsers,
        rejected: rejectedUsers,
        suspended: suspendedUsers,
        online: onlineUsers
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get user by ID
// @access  Private (Admin only)
router.get('/:id', verifyAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/users/:id/approve
// @desc    Approve a user registration
// @access  Private (Admin only)
router.put('/:id/approve', verifyAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `User is already ${user.status}`
      });
    }

    user.status = 'approved';
    await user.save();

    // TODO: Send approval email to user

    res.json({
      success: true,
      message: 'User approved successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/users/:id/reject
// @desc    Reject a user registration
// @access  Private (Admin only)
router.put('/:id/reject', verifyAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `User is already ${user.status}`
      });
    }

    user.status = 'rejected';
    user.rejectionReason = reason || 'No reason provided';
    await user.save();

    // TODO: Send rejection email to user

    res.json({
      success: true,
      message: 'User rejected successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Error rejecting user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/users/:id/suspend
// @desc    Suspend a user account
// @access  Private (Admin only)
router.put('/:id/suspend', verifyAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.status = 'suspended';
    user.rejectionReason = reason || 'Account suspended by admin';
    await user.save();

    res.json({
      success: true,
      message: 'User suspended successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Error suspending user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/users/:id/reactivate
// @desc    Reactivate a suspended user account
// @access  Private (Admin only)
router.put('/:id/reactivate', verifyAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.status = 'approved';
    user.rejectionReason = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'User reactivated successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Error reactivating user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user account
// @access  Private (Admin only)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
