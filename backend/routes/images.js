const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const auth = require('../middleware/auth');
const Event = require('../models/Event');
const router = express.Router();

// Allowed image file types
const ALLOWED_TYPES = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * GET /api/images/:filename
 * Serve an image file
 * Public endpoint - no authentication required
 */
router.get('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Validate filename to prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ 
        message: 'Invalid filename',
        code: 'INVALID_FILENAME'
      });
    }

    // Check file extension
    const ext = path.extname(filename).toLowerCase();
    if (!ALLOWED_TYPES.includes(ext)) {
      return res.status(400).json({ 
        message: 'Invalid file type',
        code: 'INVALID_FILE_TYPE',
        allowedTypes: ALLOWED_TYPES
      });
    }

    // Construct file path
    const filePath = path.join(__dirname, '../uploads', filename);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({ 
        message: 'Image not found',
        code: 'IMAGE_NOT_FOUND'
      });
    }

    // Get file stats to check size
    const stats = await fs.stat(filePath);
    if (stats.size > MAX_FILE_SIZE) {
      return res.status(413).json({ 
        message: 'File too large',
        code: 'FILE_TOO_LARGE',
        maxSize: MAX_FILE_SIZE
      });
    }

    // Set appropriate content type
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };

    res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    // Send the file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ 
      message: 'Error serving image',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * DELETE /api/images/:filename
 * Delete an image file
 * Admin only - requires authentication
 */
router.delete('/:filename', auth, async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Validate filename to prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ 
        message: 'Invalid filename',
        code: 'INVALID_FILENAME'
      });
    }

    // Check file extension
    const ext = path.extname(filename).toLowerCase();
    if (!ALLOWED_TYPES.includes(ext)) {
      return res.status(400).json({ 
        message: 'Invalid file type',
        code: 'INVALID_FILE_TYPE',
        allowedTypes: ALLOWED_TYPES
      });
    }

    // Construct file path
    const filePath = path.join(__dirname, '../uploads', filename);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({ 
        message: 'Image not found',
        code: 'IMAGE_NOT_FOUND'
      });
    }

    // Check if image is being used by any events
    const imageUrl = `/uploads/${filename}`;
    const eventsUsingImage = await Event.find({
      $or: [
        { coverImage: imageUrl },
        { gallery: imageUrl }
      ]
    });

    if (eventsUsingImage.length > 0) {
      return res.status(409).json({ 
        message: 'Cannot delete image: it is being used by one or more events',
        code: 'IMAGE_IN_USE',
        eventsCount: eventsUsingImage.length,
        eventIds: eventsUsingImage.map(e => e._id)
      });
    }

    // Delete the file
    await fs.unlink(filePath);

    res.json({ 
      success: true,
      message: 'Image deleted successfully',
      filename
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ 
      message: 'Error deleting image',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * POST /api/images/cleanup
 * Clean up orphaned images (images not referenced by any events)
 * Admin only - requires authentication
 */
router.post('/cleanup', auth, async (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '../uploads');
    
    // Get all image files in uploads directory
    const files = await fs.readdir(uploadsDir);
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ALLOWED_TYPES.includes(ext);
    });

    // Get all events
    const events = await Event.find({});
    
    // Collect all image URLs used by events
    const usedImages = new Set();
    events.forEach(event => {
      if (event.coverImage) {
        const filename = path.basename(event.coverImage);
        usedImages.add(filename);
      }
      if (event.gallery && Array.isArray(event.gallery)) {
        event.gallery.forEach(img => {
          const filename = path.basename(img);
          usedImages.add(filename);
        });
      }
    });

    // Find orphaned images
    const orphanedImages = imageFiles.filter(file => !usedImages.has(file));

    // Delete orphaned images
    const deletedImages = [];
    const errors = [];

    for (const file of orphanedImages) {
      try {
        const filePath = path.join(uploadsDir, file);
        await fs.unlink(filePath);
        deletedImages.push(file);
      } catch (error) {
        errors.push({ file, error: error.message });
      }
    }

    res.json({
      success: true,
      message: 'Cleanup completed',
      totalImages: imageFiles.length,
      usedImages: usedImages.size,
      orphanedImages: orphanedImages.length,
      deletedImages: deletedImages.length,
      deletedFiles: deletedImages,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
    res.status(500).json({ 
      message: 'Error during cleanup',
      code: 'SERVER_ERROR'
    });
  }
});

module.exports = router;
