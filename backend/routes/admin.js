const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');
const Admin = require('../models/Admin');
const Event = require('../models/Event');
const auth = require('../middleware/auth');
const {
  validateAdminLogin,
  validateRefreshToken,
  validateEventCreation,
  validateEventUpdate,
  validateEventId
} = require('../middleware/validation');
const {
  generateAccessToken,
  generateRefreshToken,
  getRefreshToken,
  revokeToken,
  revokeAllTokensForAdmin
} = require('../utils/tokenUtils');
const router = express.Router();

// Multer configuration for file uploads (memory storage for Cloudinary)
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'image',
        transformation: [
          { width: 2000, height: 2000, crop: 'limit' },
          { quality: 'auto' }
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    const readableStream = Readable.from(buffer);
    readableStream.pipe(uploadStream);
  });
};

// Admin login
router.post('/login', validateAdminLogin, async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is locked
    if (admin.isLocked) {
      return res.status(423).json({ 
        message: 'Account is locked due to too many failed login attempts. Please try again later.' 
      });
    }

    // Check if account is active
    if (!admin.isActive) {
      return res.status(403).json({ message: 'Account is inactive' });
    }

    // Update last login
    admin.lastLogin = new Date();
    admin.loginAttempts = 0;
    admin.lockUntil = null;
    await admin.save();

    // Generate tokens
    const ipAddress = req.ip || req.connection.remoteAddress;
    const accessToken = generateAccessToken(admin._id);
    const refreshToken = await generateRefreshToken(admin._id, ipAddress);

    res.json({ 
      accessToken,
      refreshToken,
      admin: { 
        id: admin._id, 
        username: admin.username,
        email: admin.email,
        role: admin.role
      } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Refresh access token
router.post('/refresh-token', validateRefreshToken, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    // Verify refresh token
    const tokenDoc = await getRefreshToken(refreshToken);
    
    if (!tokenDoc) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const { adminId } = tokenDoc;

    // Check if admin is still active
    if (!adminId.isActive) {
      return res.status(403).json({ message: 'Account is inactive' });
    }

    // Generate new tokens
    const ipAddress = req.ip || req.connection.remoteAddress;
    const newAccessToken = generateAccessToken(adminId._id);
    const newRefreshToken = await generateRefreshToken(adminId._id, ipAddress);

    // Revoke old refresh token and link to new one
    tokenDoc.revokedAt = Date.now();
    tokenDoc.revokedByIp = ipAddress;
    tokenDoc.replacedByToken = newRefreshToken;
    await tokenDoc.save();

    res.json({ 
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Logout (revoke refresh token)
router.post('/logout', validateRefreshToken, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const ipAddress = req.ip || req.connection.remoteAddress;
    const revoked = await revokeToken(refreshToken, ipAddress);

    if (!revoked) {
      return res.status(400).json({ message: 'Invalid refresh token' });
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Logout from all devices (revoke all refresh tokens)
router.post('/logout-all', auth, async (req, res) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    await revokeAllTokensForAdmin(req.admin.id, ipAddress);

    res.json({ message: 'Logged out from all devices successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify token (for session validation)
router.get('/verify', auth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: 'Invalid session' });
    }

    res.json({ 
      valid: true,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create event
router.post('/events', auth, upload.array('images', 10), validateEventCreation, async (req, res) => {
  try {
    const eventData = { ...req.body };
    
    // Upload images to Cloudinary
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => 
        uploadToCloudinary(file.buffer, 'sewing-circle/events')
      );
      
      const uploadResults = await Promise.all(uploadPromises);
      eventData.gallery = uploadResults.map(result => result.secure_url);
      eventData.coverImage = eventData.gallery[0];
    }

    const event = new Event(eventData);
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update event
router.put('/events/:id', auth, upload.array('images', 10), validateEventUpdate, async (req, res) => {
  try {
    const eventData = { ...req.body };
    
    // Upload new images to Cloudinary if provided
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => 
        uploadToCloudinary(file.buffer, 'sewing-circle/events')
      );
      
      const uploadResults = await Promise.all(uploadPromises);
      const newImages = uploadResults.map(result => result.secure_url);
      
      // Merge with existing gallery if present
      if (eventData.gallery && Array.isArray(eventData.gallery)) {
        eventData.gallery = [...eventData.gallery, ...newImages];
      } else {
        eventData.gallery = newImages;
      }
      
      // Update cover image if it's the first image
      if (!eventData.coverImage && eventData.gallery.length > 0) {
        eventData.coverImage = eventData.gallery[0];
      }
    }

    const event = await Event.findByIdAndUpdate(req.params.id, eventData, { new: true });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete event
router.delete('/events/:id', auth, validateEventId, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Collect Cloudinary public IDs to delete
    const imagesToDelete = [];
    
    if (event.coverImage && event.coverImage.includes('cloudinary')) {
      const publicId = event.coverImage.split('/').slice(-3).join('/').split('.')[0];
      imagesToDelete.push(publicId);
    }
    
    if (event.gallery && Array.isArray(event.gallery)) {
      event.gallery.forEach(img => {
        if (img.includes('cloudinary')) {
          const publicId = img.split('/').slice(-3).join('/').split('.')[0];
          if (!imagesToDelete.includes(publicId)) {
            imagesToDelete.push(publicId);
          }
        }
      });
    }

    // Delete the event
    await Event.findByIdAndDelete(req.params.id);

    // Delete associated images from Cloudinary
    const deletedImages = [];
    const failedImages = [];

    for (const publicId of imagesToDelete) {
      try {
        await cloudinary.uploader.destroy(publicId);
        deletedImages.push(publicId);
      } catch (error) {
        console.error(`Failed to delete image ${publicId}:`, error);
        failedImages.push(publicId);
      }
    }

    res.json({ 
      message: 'Event deleted successfully',
      deletedImages: deletedImages.length,
      failedImages: failedImages.length
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: error.message });
  }
});
        await fs.unlink(filePath);
        deletedImages.push(filename);
      } catch (error) {
        // Image might not exist or already deleted
        failedImages.push({ filename, error: error.message });
      }
    }

    res.json({ 
      message: 'Event deleted successfully',
      deletedImages: deletedImages.length,
      failedImages: failedImages.length > 0 ? failedImages : undefined
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;