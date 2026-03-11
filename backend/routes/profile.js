const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

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

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'user') {
      return res.status(403).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// @route   GET /api/profile/:userId
// @desc    Get user profile by ID
// @access  Public (for approved users)
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password')
      .populate('connections', 'firstName lastName profilePicture headline');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Only show approved users' profiles
    if (user.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Profile not available'
      });
    }

    res.json({
      success: true,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/profile
// @desc    Update own profile
// @access  Private
router.put('/', verifyUser, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      headline,
      bio,
      location,
      skills
    } = req.body;

    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (headline !== undefined) user.headline = headline;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (skills) user.skills = skills;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/profile/experience
// @desc    Add experience
// @access  Private
router.post('/experience', verifyUser, async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      startDate,
      endDate,
      current,
      description
    } = req.body;

    if (!title || !company) {
      return res.status(400).json({
        success: false,
        message: 'Title and company are required'
      });
    }

    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.experience.push({
      title,
      company,
      location,
      startDate,
      endDate: current ? null : endDate,
      current,
      description
    });

    await user.save();

    res.json({
      success: true,
      message: 'Experience added successfully',
      experience: user.experience
    });
  } catch (error) {
    console.error('Error adding experience:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/profile/experience/:expId
// @desc    Update experience
// @access  Private
router.put('/experience/:expId', verifyUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const experience = user.experience.id(req.params.expId);
    
    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      experience[key] = req.body[key];
    });

    await user.save();

    res.json({
      success: true,
      message: 'Experience updated successfully',
      experience: user.experience
    });
  } catch (error) {
    console.error('Error updating experience:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/profile/experience/:expId
// @desc    Delete experience
// @access  Private
router.delete('/experience/:expId', verifyUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.experience.pull(req.params.expId);
    await user.save();

    res.json({
      success: true,
      message: 'Experience deleted successfully',
      experience: user.experience
    });
  } catch (error) {
    console.error('Error deleting experience:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/profile/education
// @desc    Add education
// @access  Private
router.post('/education', verifyUser, async (req, res) => {
  try {
    const {
      school,
      degree,
      fieldOfStudy,
      startDate,
      endDate,
      current,
      description
    } = req.body;

    if (!school) {
      return res.status(400).json({
        success: false,
        message: 'School is required'
      });
    }

    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.education.push({
      school,
      degree,
      fieldOfStudy,
      startDate,
      endDate: current ? null : endDate,
      current,
      description
    });

    await user.save();

    res.json({
      success: true,
      message: 'Education added successfully',
      education: user.education
    });
  } catch (error) {
    console.error('Error adding education:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/profile/education/:eduId
// @desc    Update education
// @access  Private
router.put('/education/:eduId', verifyUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const education = user.education.id(req.params.eduId);
    
    if (!education) {
      return res.status(404).json({
        success: false,
        message: 'Education not found'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      education[key] = req.body[key];
    });

    await user.save();

    res.json({
      success: true,
      message: 'Education updated successfully',
      education: user.education
    });
  } catch (error) {
    console.error('Error updating education:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/profile/education/:eduId
// @desc    Delete education
// @access  Private
router.delete('/education/:eduId', verifyUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.education.pull(req.params.eduId);
    await user.save();

    res.json({
      success: true,
      message: 'Education deleted successfully',
      education: user.education
    });
  } catch (error) {
    console.error('Error deleting education:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/profile/skills
// @desc    Update skills
// @access  Private
router.put('/skills', verifyUser, async (req, res) => {
  try {
    const { skills } = req.body;

    if (!Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: 'Skills must be an array'
      });
    }

    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.skills = skills;
    await user.save();

    res.json({
      success: true,
      message: 'Skills updated successfully',
      skills: user.skills
    });
  } catch (error) {
    console.error('Error updating skills:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
