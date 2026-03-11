const request = require('supertest');
const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const Event = require('../models/Event');
const Admin = require('../models/Admin');
const imagesRouter = require('./images');

// Mock auth middleware for testing
jest.mock('../middleware/auth', () => {
  return jest.fn((req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const mockJwt = require('jsonwebtoken');
    try {
      const decoded = mockJwt.verify(token, process.env.JWT_SECRET || 'test-secret');
      req.admin = { id: decoded.id };
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  });
});

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/images', imagesRouter);

let mongoServer;
let testAdmin;
let authToken;

// Setup test environment
beforeAll(async () => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Create test admin
  testAdmin = await Admin.create({
    username: 'testadmin',
    email: 'test@example.com',
    password: 'password123',
    role: 'admin',
    isActive: true
  });

  // Generate auth token
  authToken = jwt.sign(
    { id: testAdmin._id },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );

  // Create test uploads directory
  const uploadsDir = path.join(__dirname, '../uploads');
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  // Clean up test data
  await Event.deleteMany({});
});

describe('Image Management Endpoints', () => {
  describe('GET /api/images/:filename', () => {
    let testImagePath;
    const testFilename = 'test-image.jpg';

    beforeEach(async () => {
      // Create a test image file
      testImagePath = path.join(__dirname, '../uploads', testFilename);
      await fs.writeFile(testImagePath, 'fake image content');
    });

    afterEach(async () => {
      // Clean up test image
      try {
        await fs.unlink(testImagePath);
      } catch (error) {
        // File might not exist
      }
    });

    it('should serve an existing image file', async () => {
      const response = await request(app)
        .get(`/api/images/${testFilename}`)
        .expect(200);

      expect(response.headers['content-type']).toBe('image/jpeg');
      expect(response.headers['cache-control']).toContain('public');
    });

    it('should return 404 for non-existent image', async () => {
      const response = await request(app)
        .get('/api/images/nonexistent.jpg')
        .expect(404);

      expect(response.body.code).toBe('IMAGE_NOT_FOUND');
    });

    it('should reject invalid filename with directory traversal', async () => {
      const response = await request(app)
        .get('/api/images/..%2Ftest.jpg')
        .expect(400);

      expect(response.body.code).toBe('INVALID_FILENAME');
    });

    it('should reject invalid file type', async () => {
      const response = await request(app)
        .get('/api/images/test.exe')
        .expect(400);

      expect(response.body.code).toBe('INVALID_FILE_TYPE');
      expect(response.body.allowedTypes).toBeDefined();
    });

    it('should serve different image types', async () => {
      const imageTypes = [
        { ext: '.png', contentType: 'image/png' },
        { ext: '.gif', contentType: 'image/gif' },
        { ext: '.webp', contentType: 'image/webp' }
      ];

      for (const { ext, contentType } of imageTypes) {
        const filename = `test${ext}`;
        const filePath = path.join(__dirname, '../uploads', filename);
        await fs.writeFile(filePath, 'fake image content');

        const response = await request(app)
          .get(`/api/images/${filename}`)
          .expect(200);

        expect(response.headers['content-type']).toBe(contentType);

        await fs.unlink(filePath);
      }
    });
  });

  describe('DELETE /api/images/:filename', () => {
    let testImagePath;
    const testFilename = 'test-delete.jpg';

    beforeEach(async () => {
      // Create a test image file
      testImagePath = path.join(__dirname, '../uploads', testFilename);
      await fs.writeFile(testImagePath, 'fake image content');
    });

    afterEach(async () => {
      // Clean up test image if it still exists
      try {
        await fs.unlink(testImagePath);
      } catch (error) {
        // File might have been deleted by test
      }
    });

    it('should delete an image when authenticated', async () => {
      const response = await request(app)
        .delete(`/api/images/${testFilename}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.filename).toBe(testFilename);

      // Verify file is deleted
      await expect(fs.access(testImagePath)).rejects.toThrow();
    });

    it('should require authentication', async () => {
      await request(app)
        .delete(`/api/images/${testFilename}`)
        .expect(401);

      // Verify file still exists
      await fs.access(testImagePath);
    });

    it('should return 404 for non-existent image', async () => {
      const response = await request(app)
        .delete('/api/images/nonexistent.jpg')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.code).toBe('IMAGE_NOT_FOUND');
    });

    it('should reject invalid filename', async () => {
      const response = await request(app)
        .delete('/api/images/..%2Ftest.jpg')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.code).toBe('INVALID_FILENAME');
    });

    it('should prevent deletion of images in use by events', async () => {
      // Create an event using the test image
      await Event.create({
        type: 'upcoming',
        name: 'Test Event',
        date: '2024-12-25',
        coverImage: `/uploads/${testFilename}`
      });

      const response = await request(app)
        .delete(`/api/images/${testFilename}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(409);

      expect(response.body.code).toBe('IMAGE_IN_USE');
      expect(response.body.eventsCount).toBe(1);

      // Verify file still exists
      await fs.access(testImagePath);
    });

    it('should prevent deletion of images in event galleries', async () => {
      // Create an event with the image in gallery
      await Event.create({
        type: 'past',
        header: 'Test Event',
        gallery: [`/uploads/${testFilename}`, '/uploads/other.jpg']
      });

      const response = await request(app)
        .delete(`/api/images/${testFilename}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(409);

      expect(response.body.code).toBe('IMAGE_IN_USE');
      expect(response.body.eventsCount).toBe(1);
    });
  });

  describe('POST /api/images/cleanup', () => {
    let orphanedImage1, orphanedImage2, usedImage;

    beforeEach(async () => {
      // Create test images
      orphanedImage1 = path.join(__dirname, '../uploads', 'orphaned1.jpg');
      orphanedImage2 = path.join(__dirname, '../uploads', 'orphaned2.png');
      usedImage = path.join(__dirname, '../uploads', 'used.jpg');

      await fs.writeFile(orphanedImage1, 'orphaned image 1');
      await fs.writeFile(orphanedImage2, 'orphaned image 2');
      await fs.writeFile(usedImage, 'used image');

      // Create an event using one image
      await Event.create({
        type: 'upcoming',
        name: 'Test Event',
        date: '2024-12-25',
        coverImage: '/uploads/used.jpg'
      });
    });

    afterEach(async () => {
      // Clean up test images
      const images = [orphanedImage1, orphanedImage2, usedImage];
      for (const img of images) {
        try {
          await fs.unlink(img);
        } catch (error) {
          // File might have been deleted
        }
      }
    });

    it('should clean up orphaned images', async () => {
      const response = await request(app)
        .post('/api/images/cleanup')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.orphanedImages).toBe(2);
      expect(response.body.deletedImages).toBe(2);
      expect(response.body.usedImages).toBe(1);

      // Verify orphaned images are deleted
      await expect(fs.access(orphanedImage1)).rejects.toThrow();
      await expect(fs.access(orphanedImage2)).rejects.toThrow();

      // Verify used image still exists
      await fs.access(usedImage);
    });

    it('should require authentication', async () => {
      await request(app)
        .post('/api/images/cleanup')
        .expect(401);
    });

    it('should handle cleanup with no orphaned images', async () => {
      // Delete orphaned images manually
      await fs.unlink(orphanedImage1);
      await fs.unlink(orphanedImage2);

      const response = await request(app)
        .post('/api/images/cleanup')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.orphanedImages).toBe(0);
      expect(response.body.deletedImages).toBe(0);
    });

    it('should handle events with gallery images', async () => {
      // Create event with gallery
      await Event.create({
        type: 'past',
        header: 'Gallery Event',
        gallery: ['/uploads/orphaned1.jpg', '/uploads/used.jpg']
      });

      const response = await request(app)
        .post('/api/images/cleanup')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.orphanedImages).toBe(1); // Only orphaned2.png
      expect(response.body.deletedImages).toBe(1);

      // Verify orphaned1.jpg still exists (now used)
      await fs.access(orphanedImage1);
    });
  });

  describe('File Type and Size Validation', () => {
    it('should validate file types on GET', async () => {
      const invalidTypes = ['test.exe', 'test.php', 'test.sh', 'test.bat'];

      for (const filename of invalidTypes) {
        const response = await request(app)
          .get(`/api/images/${filename}`)
          .expect(400);

        expect(response.body.code).toBe('INVALID_FILE_TYPE');
      }
    });

    it('should validate file types on DELETE', async () => {
      const response = await request(app)
        .delete('/api/images/test.exe')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.code).toBe('INVALID_FILE_TYPE');
    });

    it('should accept all valid image types', async () => {
      const validTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

      for (const ext of validTypes) {
        const filename = `test${ext}`;
        const filePath = path.join(__dirname, '../uploads', filename);
        await fs.writeFile(filePath, 'fake image');

        await request(app)
          .get(`/api/images/${filename}`)
          .expect(200);

        await fs.unlink(filePath);
      }
    });
  });
});
