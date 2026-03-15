const request = require('supertest');
const express = require('express');
const {
  validateEventCreation,
  validateEventUpdate,
  validateStatusUpdate,
  validateEventId,
  validateAdminLogin,
  validateRefreshToken
} = require('./validation');

// Create test app
const createTestApp = (validationMiddleware, handler) => {
  const app = express();
  app.use(express.json());
  app.post('/test', validationMiddleware, handler);
  app.put('/test/:id', validationMiddleware, handler);
  app.patch('/test/:id', validationMiddleware, handler);
  app.get('/test/:id', validationMiddleware, handler);
  return app;
};

const successHandler = (req, res) => {
  res.json({ success: true, body: req.body });
};

describe('Validation Middleware', () => {
  describe('validateEventCreation', () => {
    const app = createTestApp(validateEventCreation, successHandler);

    test('should accept valid upcoming event', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          type: 'upcoming',
          name: 'Test Event',
          date: '2024-12-25',
          time: '10:00 AM',
          venue: 'Test Venue',
          description: 'Test description'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should accept valid past event', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          type: 'past',
          header: 'Past Event Header',
          theme: 'Test Theme',
          teaser: 'Test teaser',
          fullDescription: 'Full description here',
          location: 'Test Location',
          duration: '2 hours',
          participants: 50,
          facilitator: 'John Doe'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should reject missing type', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          name: 'Test Event'
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.body.errors.length).toBeGreaterThanOrEqual(1);
      const typeError = response.body.errors.find(e => e.field === 'type');
      expect(typeError).toBeDefined();
      expect(typeError.message).toContain('Event type');
    });

    test('should reject invalid type', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          type: 'invalid',
          name: 'Test Event'
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.body.errors[0].field).toBe('type');
      expect(response.body.errors[0].message).toBe('Event type must be either "upcoming" or "past"');
    });

    test('should reject upcoming event without name', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          type: 'upcoming',
          date: '2024-12-25'
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      const nameError = response.body.errors.find(e => e.field === 'name');
      expect(nameError).toBeDefined();
      expect(nameError.message).toBe('Event name is required for upcoming events');
    });

    test('should reject name that is too short', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          type: 'upcoming',
          name: 'AB',
          date: '2024-12-25'
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      const nameError = response.body.errors.find(e => e.field === 'name');
      expect(nameError.message).toContain('between 3 and 200 characters');
    });

    test('should reject name that is too long', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          type: 'upcoming',
          name: 'A'.repeat(201),
          date: '2024-12-25'
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      const nameError = response.body.errors.find(e => e.field === 'name');
      expect(nameError.message).toContain('between 3 and 200 characters');
    });

    test('should reject past event without header', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          type: 'past',
          theme: 'Test Theme'
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      const headerError = response.body.errors.find(e => e.field === 'header');
      expect(headerError).toBeDefined();
      expect(headerError.message).toBe('Header is required for past events');
    });

    test('should reject invalid status', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          type: 'upcoming',
          name: 'Test Event',
          date: '2024-12-25',
          status: 'invalid'
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      const statusError = response.body.errors.find(e => e.field === 'status');
      expect(statusError.message).toContain('draft, published, archived');
    });

    test('should reject participants outside valid range', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          type: 'past',
          header: 'Test Header',
          participants: 10001
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      const participantsError = response.body.errors.find(e => e.field === 'participants');
      expect(participantsError.message).toContain('between 0 and 10000');
    });

    test('should sanitize HTML in input', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          type: 'upcoming',
          name: '<script>alert("xss")</script>Test Event',
          date: '2024-12-25'
        });

      expect(response.status).toBe(200);
      expect(response.body.body.name).not.toContain('<script>');
      expect(response.body.body.name).toContain('&lt;script&gt;');
    });

    test('should trim whitespace from inputs', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          type: '  upcoming  ',
          name: '  Test Event  ',
          date: '2024-12-25'
        });

      expect(response.status).toBe(200);
      expect(response.body.body.type).toBe('upcoming');
      expect(response.body.body.name).not.toMatch(/^\s|\s$/);
    });
  });

  describe('validateEventUpdate', () => {
    const app = createTestApp(validateEventUpdate, successHandler);

    test('should accept valid event update', async () => {
      const response = await request(app)
        .put('/test/507f1f77bcf86cd799439011')
        .send({
          name: 'Updated Event Name',
          description: 'Updated description'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should reject invalid MongoDB ID', async () => {
      const response = await request(app)
        .put('/test/invalid-id')
        .send({
          name: 'Updated Event Name'
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      const idError = response.body.errors.find(e => e.field === 'id');
      expect(idError.message).toBe('Invalid event ID format');
    });

    test('should accept partial updates', async () => {
      const response = await request(app)
        .put('/test/507f1f77bcf86cd799439011')
        .send({
          description: 'Only updating description'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should validate field lengths on update', async () => {
      const response = await request(app)
        .put('/test/507f1f77bcf86cd799439011')
        .send({
          description: 'A'.repeat(2001)
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      const descError = response.body.errors.find(e => e.field === 'description');
      expect(descError.message).toContain('must not exceed 2000 characters');
    });
  });

  describe('validateStatusUpdate', () => {
    const app = createTestApp(validateStatusUpdate, successHandler);

    test('should accept valid status update', async () => {
      const response = await request(app)
        .patch('/test/507f1f77bcf86cd799439011')
        .send({
          status: 'published'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should reject missing status', async () => {
      const response = await request(app)
        .patch('/test/507f1f77bcf86cd799439011')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      const statusError = response.body.errors.find(e => e.field === 'status');
      expect(statusError.message).toBe('Status is required');
    });

    test('should reject invalid status value', async () => {
      const response = await request(app)
        .patch('/test/507f1f77bcf86cd799439011')
        .send({
          status: 'invalid'
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      const statusError = response.body.errors.find(e => e.field === 'status');
      expect(statusError.message).toContain('draft, published, archived');
    });

    test('should reject invalid event ID', async () => {
      const response = await request(app)
        .patch('/test/invalid-id')
        .send({
          status: 'published'
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      const idError = response.body.errors.find(e => e.field === 'id');
      expect(idError.message).toBe('Invalid event ID format');
    });
  });

  describe('validateEventId', () => {
    const app = createTestApp(validateEventId, successHandler);

    test('should accept valid MongoDB ID', async () => {
      const response = await request(app)
        .get('/test/507f1f77bcf86cd799439011');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should reject invalid MongoDB ID', async () => {
      const response = await request(app)
        .get('/test/invalid-id');

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.body.errors[0].field).toBe('id');
      expect(response.body.errors[0].message).toBe('Invalid event ID format');
    });

    test('should reject empty ID', async () => {
      const response = await request(app)
        .get('/test/ ');

      expect(response.status).toBe(404); // Express routing will handle this
    });
  });

  describe('validateAdminLogin', () => {
    const app = createTestApp(validateAdminLogin, successHandler);

    test('should accept valid login credentials', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should reject missing username', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      const usernameError = response.body.errors.find(e => e.field === 'username');
      expect(usernameError.message).toBe('Username is required');
    });

    test('should reject missing password', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          username: 'testuser'
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      const passwordError = response.body.errors.find(e => e.field === 'password');
      expect(passwordError.message).toBe('Password is required');
    });

    test('should reject username that is too short', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          username: 'ab',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      const usernameError = response.body.errors.find(e => e.field === 'username');
      expect(usernameError.message).toContain('between 3 and 50 characters');
    });

    test('should reject password that is too short', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          username: 'testuser',
          password: 'short'
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      const passwordError = response.body.errors.find(e => e.field === 'password');
      expect(passwordError.message).toContain('at least 8 characters');
    });

    test('should reject username with invalid characters', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          username: 'test@user',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      const usernameError = response.body.errors.find(e => e.field === 'username');
      expect(usernameError.message).toContain('letters, numbers, underscores, and hyphens');
    });

    test('should sanitize username input', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          username: '  testuser  ',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.body.username).toBe('testuser');
    });
  });

  describe('validateRefreshToken', () => {
    const app = createTestApp(validateRefreshToken, successHandler);

    test('should accept valid JWT token', async () => {
      // Create a valid JWT token for testing
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      
      const response = await request(app)
        .post('/test')
        .send({
          refreshToken: validToken
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should reject missing refresh token', async () => {
      const response = await request(app)
        .post('/test')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      const tokenError = response.body.errors.find(e => e.field === 'refreshToken');
      expect(tokenError.message).toBe('Refresh token is required');
    });

    test('should reject invalid token format', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          refreshToken: 'invalid-token-format'
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      const tokenError = response.body.errors.find(e => e.field === 'refreshToken');
      expect(tokenError.message).toBe('Invalid refresh token format');
    });
  });

  describe('Error Response Format', () => {
    const app = createTestApp(validateEventCreation, successHandler);

    test('should return properly formatted error response', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          type: 'invalid',
          name: 'AB'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Validation failed');
      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body).toHaveProperty('errors');
      expect(response.body).toHaveProperty('errorCount');
      expect(Array.isArray(response.body.errors)).toBe(true);
      expect(response.body.errorCount).toBe(response.body.errors.length);
    });

    test('should include field, message, value, and location in errors', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          type: 'invalid'
        });

      expect(response.status).toBe(400);
      const error = response.body.errors[0];
      expect(error).toHaveProperty('field');
      expect(error).toHaveProperty('message');
      expect(error).toHaveProperty('value');
      expect(error).toHaveProperty('location');
    });

    test('should return multiple errors when multiple fields are invalid', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          type: 'upcoming',
          name: 'AB',
          description: 'A'.repeat(2001)
        });

      expect(response.status).toBe(400);
      expect(response.body.errors.length).toBeGreaterThan(1);
      expect(response.body.errorCount).toBeGreaterThan(1);
    });
  });
});
