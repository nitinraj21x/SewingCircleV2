const express = require('express');
const router = express.Router();
const User = require('../models/User');

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

// @route   POST /api/follow/:userId
// @desc    Follow/unfollow a user
// @access  Private
router.post('/:userId', verifyUser, async (req, res) => {
  try {
    const targetUserId = req.params.userId;

    // Can't follow yourself
    if (targetUserId === req.userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const currentUser = await User.findById(req.userId);

    // Check if already following
    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        id => id.toString() !== targetUserId
      );
      targetUser.followers = targetUser.followers.filter(
        id => id.toString() !== req.userId.toString()
      );
    } else {
      // Follow
      currentUser.following.push(targetUserId);
      targetUser.followers.push(req.userId);
    }

    await currentUser.save();
    await targetUser.save();

    res.json({
      success: true,
      message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully',
      isFollowing: !isFollowing,
      followingCount: currentUser.following.length,
      followersCount: targetUser.followers.length
    });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/follow/followers/:userId
// @desc    Get user's followers
// @access  Public
router.get('/followers/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('followers', 'firstName lastName profilePicture headline location');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      followers: user.followers,
      count: user.followers.length
    });
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/follow/following/:userId
// @desc    Get users that this user is following
// @access  Public
router.get('/following/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('following', 'firstName lastName profilePicture headline location');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      following: user.following,
      count: user.following.length
    });
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/follow/suggestions
// @desc    Get suggested users to follow
// @access  Private
router.get('/suggestions', verifyUser, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    
    // Get users that current user is not following
    const suggestions = await User.find({
      _id: { 
        $ne: req.userId,
        $nin: currentUser.following
      },
      status: 'approved'
    })
      .select('firstName lastName profilePicture headline location skills')
      .limit(10);

    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/follow/check/:userId
// @desc    Check if current user is following target user
// @access  Private
router.get('/check/:userId', verifyUser, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    const isFollowing = currentUser.following.includes(req.params.userId);

    res.json({
      success: true,
      isFollowing
    });
  } catch (error) {
    console.error('Error checking follow status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
