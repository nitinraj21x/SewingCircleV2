const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const Event = require('../models/Event');
const eventsRouter = require('./events');

const app = express();
app.use(express.json());
app.use('/api/events', eventsRouter);

let mongoServer;
let testEvent;
let authToken;

// Setup test environment
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  
  // Create a test auth token
  process.env.JWT_SECRET = 'test-secret';
  authToken = jwt.sign({ id: 'test-admin-id' }, process.env.JWT_SECRET);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Create a test event before each test
  testEvent = await Event.create({
    type: 'upcoming',
    name: 'Test Event',
    date: '2024-12-25',
    time: '10:00 AM',
    venue: 'Test Venue',
    description: 'Test Description',
    status: 'draft'
  });
});

afterEach(async () => {
  // Clean up after each test
  await Event.deleteMany({});
});

describe('PATCH /api/events/:id/status', () => {
  describe('Authentication', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app)
        .patch(`/api/events/${testEvent._id}/status`)
        .send({ status: 'published' });
      
      expect(response.status).toBe(401);
      expect(response.body.code).toBe('NO_TOKEN');
    });

    it('should return 401 when invalid token is provided', async () => {
      const response = await request(app)
        .patch(`/api/events/${testEvent._id}/status`)
        .set('Authorization', 'Bearer invalid-token')
        .send({ status: 'published' });
      
      expect(response.status).toBe(401);
      expect(response.body.code).toBe('INVALID_TOKEN');
    });
  });

  describe('Validation', () => {
    it('should return 400 when status is missing', async () => {
      const response = await request(app)
        .patch(`/api/events/${testEvent._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.body.errors).toBeDefined();
      const statusError = response.body.errors.find(e => e.field === 'status');
      expect(statusError.message).toBe('Status is required');
    });

    it('should return 400 when status is invalid', async () => {
      const response = await request(app)
        .patch(`/api/events/${testEvent._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'invalid-status' });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.body.errors).toBeDefined();
      const statusError = response.body.errors.find(e => e.field === 'status');
      expect(statusError.message).toContain('draft, published, archived');
    });

    it('should return 404 when event does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .patch(`/api/events/${fakeId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'published' });
      
      expect(response.status).toBe(404);
      expect(response.body.code).toBe('EVENT_NOT_FOUND');
    });

    it('should return 400 when event ID format is invalid', async () => {
      const response = await request(app)
        .patch('/api/events/invalid-id/status')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'published' });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.body.errors).toBeDefined();
      const idError = response.body.errors.find(e => e.field === 'id');
      expect(idError.message).toBe('Invalid event ID format');
    });

    it('should return 400 when status is already the same', async () => {
      const response = await request(app)
        .patch(`/api/events/${testEvent._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'draft' });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe('NO_STATUS_CHANGE');
      expect(response.body.currentStatus).toBe('draft');
    });
  });

  describe('Status Transitions', () => {
    it('should successfully transition from draft to published', async () => {
      const response = await request(app)
        .patch(`/api/events/${testEvent._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'published' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('published');
      expect(response.body.message).toBe('Event status updated to published');
      
      // Verify in database
      const updatedEvent = await Event.findById(testEvent._id);
      expect(updatedEvent.status).toBe('published');
    });

    it('should successfully transition from draft to archived', async () => {
      const response = await request(app)
        .patch(`/api/events/${testEvent._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'archived' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('archived');
    });

    it('should successfully transition from published to draft', async () => {
      // First set to published
      testEvent.status = 'published';
      await testEvent.save();
      
      const response = await request(app)
        .patch(`/api/events/${testEvent._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'draft' });
      
      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('draft');
    });

    it('should successfully transition from published to archived', async () => {
      // First set to published
      testEvent.status = 'published';
      await testEvent.save();
      
      const response = await request(app)
        .patch(`/api/events/${testEvent._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'archived' });
      
      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('archived');
    });

    it('should successfully transition from archived to draft', async () => {
      // First set to archived
      testEvent.status = 'archived';
      await testEvent.save();
      
      const response = await request(app)
        .patch(`/api/events/${testEvent._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'draft' });
      
      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('draft');
    });

    it('should successfully transition from archived to published', async () => {
      // First set to archived
      testEvent.status = 'archived';
      await testEvent.save();
      
      const response = await request(app)
        .patch(`/api/events/${testEvent._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'published' });
      
      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('published');
    });
  });

  describe('Backward Compatibility', () => {
    it('should handle events without status field (legacy events)', async () => {
      // Create event without status field
      const legacyEvent = await Event.create({
        type: 'upcoming',
        name: 'Legacy Event',
        date: '2024-12-25',
        time: '10:00 AM',
        venue: 'Test Venue',
        description: 'Test Description'
      });
      
      // Remove status field to simulate legacy event
      await Event.updateOne({ _id: legacyEvent._id }, { $unset: { status: 1 } });
      
      const response = await request(app)
        .patch(`/api/events/${legacyEvent._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'archived' });
      
      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('archived');
    });
  });
});
