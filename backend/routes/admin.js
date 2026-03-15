const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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

// Ensure events uploads directory exists
const eventsDir = path.join(__dirname, '../uploads/events');
if (!fs.existsSync(eventsDir)) fs.mkdirSync(eventsDir, { recursive: true });

// Disk storage for event images
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, eventsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `event-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image files allowed'), false);
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Helper to delete a local image file
const deleteLocalImage = (imgPath) => {
  if (!imgPath || imgPath.startsWith('http')) return;
  const fullPath = path.join(__dirname, '..', imgPath);
  if (fs.existsSync(fullPath)) {
    try { fs.unlinkSync(fullPath); } catch (e) { /* ignore */ }
  }
};

// Admin login
router.post('/login', validateAdminLogin, async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (admin.isLocked) {
      return res.status(423).json({ message: 'Account is locked due to too many failed login attempts.' });
    }
    if (!admin.isActive) {
      return res.status(403).json({ message: 'Account is inactive' });
    }

    admin.lastLogin = new Date();
    admin.loginAttempts = 0;
    admin.lockUntil = null;
    await admin.save();

    const ipAddress = req.ip || req.connection.remoteAddress;
    const accessToken = generateAccessToken(admin._id);
    const refreshToken = await generateRefreshToken(admin._id, ipAddress);

    res.json({
      accessToken,
      refreshToken,
      admin: { id: admin._id, username: admin.username, email: admin.email, role: admin.role }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Refresh access token
router.post('/refresh-token', validateRefreshToken, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'Refresh token is required' });

    const tokenDoc = await getRefreshToken(refreshToken);
    if (!tokenDoc) return res.status(401).json({ message: 'Invalid or expired refresh token' });

    const { adminId } = tokenDoc;
    if (!adminId.isActive) return res.status(403).json({ message: 'Account is inactive' });

    const ipAddress = req.ip || req.connection.remoteAddress;
    const newAccessToken = generateAccessToken(adminId._id);
    const newRefreshToken = await generateRefreshToken(adminId._id, ipAddress);

    tokenDoc.revokedAt = Date.now();
    tokenDoc.revokedByIp = ipAddress;
    tokenDoc.replacedByToken = newRefreshToken;
    await tokenDoc.save();

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Logout
router.post('/logout', validateRefreshToken, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const revoked = await revokeToken(refreshToken, ipAddress);
    if (!revoked) return res.status(400).json({ message: 'Invalid refresh token' });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Logout from all devices
router.post('/logout-all', auth, async (req, res) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    await revokeAllTokensForAdmin(req.admin.id, ipAddress);
    res.json({ message: 'Logged out from all devices successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify token
router.get('/verify', auth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    if (!admin || !admin.isActive) return res.status(401).json({ message: 'Invalid session' });
    res.json({ valid: true, admin: { id: admin._id, username: admin.username, email: admin.email, role: admin.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create event
router.post('/events', auth, upload.array('images', 10), validateEventCreation, async (req, res) => {
  try {
    const eventData = { ...req.body };

    if (req.files && req.files.length > 0) {
      eventData.gallery = req.files.map(f => `/uploads/events/${f.filename}`);
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

    // gallery field from body = the kept existing images (JSON string or array)
    let keptGallery = [];
    if (eventData.gallery) {
      try {
        keptGallery = typeof eventData.gallery === 'string'
          ? JSON.parse(eventData.gallery)
          : eventData.gallery;
      } catch { keptGallery = []; }
    }

    // Find removed images and delete them from disk
    const existing = await Event.findById(req.params.id);
    if (existing && existing.gallery) {
      existing.gallery.forEach(img => {
        if (!keptGallery.includes(img)) deleteLocalImage(img);
      });
    }

    const newImages = req.files ? req.files.map(f => `/uploads/events/${f.filename}`) : [];
    eventData.gallery = [...keptGallery, ...newImages];
    if (eventData.gallery.length > 0) {
      eventData.coverImage = eventData.gallery[0];
    } else {
      eventData.coverImage = '';
    }

    const event = await Event.findByIdAndUpdate(req.params.id, eventData, { new: true });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single event with populated registrations (admin)
router.get('/events/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('registrations.user', 'username email');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete event
router.delete('/events/:id', auth, validateEventId, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Collect local images to delete
    const imagesToDelete = [];
    if (event.coverImage) imagesToDelete.push(event.coverImage);
    if (event.gallery && Array.isArray(event.gallery)) {
      event.gallery.forEach(img => {
        if (!imagesToDelete.includes(img)) imagesToDelete.push(img);
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    // Delete local image files
    imagesToDelete.forEach(deleteLocalImage);

    res.json({ message: 'Event deleted successfully', deletedImages: imagesToDelete.length });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
