const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Ensure uploads directories exist
const profilesDir = path.join(__dirname, '../uploads/profiles');
const coversDir = path.join(__dirname, '../uploads/covers');
[profilesDir, coversDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Disk storage for profile pictures
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, profilesDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `profile-${Date.now()}${ext}`);
  }
});

// Disk storage for cover photos
const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, coversDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `cover-${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

const uploadProfile = multer({ storage: profileStorage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadCover = multer({ storage: coverStorage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Middleware to verify user token
const verifyUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'user') return res.status(403).json({ success: false, message: 'Invalid token type' });

    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Helper to delete old local file
const deleteOldFile = (filePath) => {
  if (!filePath) return;
  // Only delete local files (not http URLs)
  if (filePath.startsWith('http')) return;
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    try { fs.unlinkSync(fullPath); } catch (e) { /* ignore */ }
  }
};

// POST /api/upload/profile-picture
router.post('/profile-picture', verifyUser, uploadProfile.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Delete old profile picture if it's a local file
    deleteOldFile(user.profilePicture);

    user.profilePicture = `/uploads/profiles/${req.file.filename}`;
    await user.save();

    res.json({ success: true, message: 'Profile picture uploaded successfully', profilePicture: user.profilePicture });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// POST /api/upload/cover-photo
router.post('/cover-photo', verifyUser, uploadCover.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Delete old cover photo if it's a local file
    deleteOldFile(user.coverPhoto);

    user.coverPhoto = `/uploads/covers/${req.file.filename}`;
    await user.save();

    res.json({ success: true, message: 'Cover photo uploaded successfully', coverPhoto: user.coverPhoto });
  } catch (error) {
    console.error('Error uploading cover photo:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Error handling for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File is too large. Maximum size is 5MB.' });
  }
  res.status(400).json({ success: false, message: error.message });
});

module.exports = router;
