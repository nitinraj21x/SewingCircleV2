const request = require('supertest');
const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const Event = require('../models/Event');
const Admin = require('../models/Admin');
const adminRouter = require('./admin');

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
app.use('/api/admin', adminRouter);

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

describe('Admin Event Deletion with Image Cleanup', () => {
  it('should delete event and associated images', async () => {
    // Create test images
    const coverImagePath = path.join(__dirname, '../uploads', 'cover-test.jpg');
    const galleryImage1Path = path.join(__dirname, '../uploads', 'gallery1-test.jpg');
    const galleryImage2Path = path.join(__dirname, '../uploads', 'gallery2-test.jpg');

    await fs.writeFile(coverImagePath, 'cover image content');
    await fs.writeFile(galleryImage1Path, 'gallery image 1 content');
    await fs.writeFile(galleryImage2Path, 'gallery image 2 content');

    // Create event with images
    const event = await Event.create({
      type: 'past',
      header: 'Test Event',
      coverImage: '/uploads/cover-test.jpg',
      gallery: ['/uploads/gallery1-test.jpg', '/uploads/gallery2-test.jpg']
    });

    // Verify images exist
    await fs.access(coverImagePath);
    await fs.access(galleryImage1Path);
    await fs.access(galleryImage2Path);

    // Delete event
    const response = await request(app)
      .delete(`/api/admin/events/${event._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.message).toBe('Event deleted successfully');
    expect(response.body.deletedImages).toBe(3);

    // Verify event is deleted
    const deletedEvent = await Event.findById(event._id);
    expect(deletedEvent).toBeNull();

    // Verify images are deleted
    await expect(fs.access(coverImagePath)).rejects.toThrow();
    await expect(fs.access(galleryImage1Path)).rejects.toThrow();
    await expect(fs.access(galleryImage2Path)).rejects.toThrow();
  });

  it('should handle deletion when images do not exist', async () => {
    // Create event with non-existent images
    const event = await Event.create({
      type: 'upcoming',
      name: 'Test Event',
      date: '2024-12-25',
      coverImage: '/uploads/nonexistent.jpg',
      gallery: ['/uploads/missing1.jpg', '/uploads/missing2.jpg']
    });

    // Delete event
    const response = await request(app)
      .delete(`/api/admin/events/${event._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.message).toBe('Event deleted successfully');
    expect(response.body.deletedImages).toBe(0);
    expect(response.body.failedImages).toBeDefined();
    expect(response.body.failedImages.length).toBe(3);
  });

  it('should handle deletion of event without images', async () => {
    // Create event without images
    const event = await Event.create({
      type: 'upcoming',
      name: 'Test Event',
      date: '2024-12-25',
      description: 'No images'
    });

    // Delete event
    const response = await request(app)
      .delete(`/api/admin/events/${event._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.message).toBe('Event deleted successfully');
    expect(response.body.deletedImages).toBe(0);
  });

  it('should not delete duplicate images twice', async () => {
    // Create test image
    const imagePath = path.join(__dirname, '../uploads', 'duplicate-test.jpg');
    await fs.writeFile(imagePath, 'image content');

    // Create event with same image in cover and gallery
    const event = await Event.create({
      type: 'past',
      header: 'Test Event',
      coverImage: '/uploads/duplicate-test.jpg',
      gallery: ['/uploads/duplicate-test.jpg', '/uploads/duplicate-test.jpg']
    });

    // Delete event
    const response = await request(app)
      .delete(`/api/admin/events/${event._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.message).toBe('Event deleted successfully');
    expect(response.body.deletedImages).toBe(1); // Should only delete once

    // Verify image is deleted
    await expect(fs.access(imagePath)).rejects.toThrow();
  });

  it('should require authentication', async () => {
    const event = await Event.create({
      type: 'upcoming',
      name: 'Test Event',
      date: '2024-12-25'
    });

    await request(app)
      .delete(`/api/admin/events/${event._id}`)
      .expect(401);

    // Verify event still exists
    const stillExists = await Event.findById(event._id);
    expect(stillExists).not.toBeNull();
  });

  it('should return 404 for non-existent event', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .delete(`/api/admin/events/${fakeId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);

    expect(response.body.message).toBe('Event not found');
  });
});
