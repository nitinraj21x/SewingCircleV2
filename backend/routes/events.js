const express = require('express');
const Event = require('../models/Event');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validateEventId, validateStatusUpdate } = require('../middleware/validation');
const adminAuth = require('../middleware/auth');
const router = express.Router();

// User auth middleware for registration endpoints
const verifyUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user || user.status !== 'approved') return res.status(403).json({ message: 'Not authorized' });
    req.userId = decoded.userId;
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get upcoming events
router.get('/upcoming', async (req, res) => {
  try {
    const events = await Event.find({ type: 'upcoming' }).sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get past events
router.get('/past', async (req, res) => {
  try {
    const events = await Event.find({ type: 'past' }).sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single event
router.get('/:id', validateEventId, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update event status (admin only)
router.patch('/:id/status', adminAuth, validateStatusUpdate, async (req, res) => {
  try {
    const { status } = req.body;
    
    // Find the event
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ 
        message: 'Event not found',
        code: 'EVENT_NOT_FOUND'
      });
    }
    
    // Get current status (if exists, otherwise infer from type field)
    const currentStatus = event.status || (event.type === 'upcoming' ? 'published' : 'archived');
    
    // Validate status transitions
    const validTransitions = {
      'draft': ['published', 'archived'],
      'published': ['draft', 'archived'],
      'archived': ['draft', 'published']
    };
    
    if (currentStatus === status) {
      return res.status(400).json({ 
        message: `Event is already in ${status} status`,
        code: 'NO_STATUS_CHANGE',
        currentStatus
      });
    }
    
    if (!validTransitions[currentStatus].includes(status)) {
      return res.status(400).json({ 
        message: `Cannot transition from ${currentStatus} to ${status}`,
        code: 'INVALID_TRANSITION',
        currentStatus,
        requestedStatus: status,
        allowedTransitions: validTransitions[currentStatus]
      });
    }
    
    // Update the status
    event.status = status;
    await event.save();
    
    res.json({
      success: true,
      message: `Event status updated to ${status}`,
      data: event
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid event ID format',
        code: 'INVALID_ID'
      });
    }
    res.status(500).json({ 
      message: error.message,
      code: 'SERVER_ERROR'
    });
  }
});

// Register for an event (authenticated users)
router.post('/:id/register', verifyUser, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.type !== 'upcoming') return res.status(400).json({ message: 'Can only register for upcoming events' });

    const alreadyRegistered = event.registrations.some(
      reg => reg.user.toString() === req.userId.toString()
    );
    if (alreadyRegistered) return res.status(400).json({ message: 'Already registered for this event' });
    if (event.maxParticipants && event.registrations.length >= event.maxParticipants) {
      return res.status(400).json({ message: 'Event is full' });
    }

    event.registrations.push({ user: req.userId });
    await event.save();

    res.json({ success: true, message: 'Successfully registered for event', registrationCount: event.registrations.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Unregister from an event (authenticated users)
router.delete('/:id/register', verifyUser, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    event.registrations = event.registrations.filter(
      reg => reg.user.toString() !== req.userId.toString()
    );
    await event.save();

    res.json({ success: true, message: 'Successfully unregistered from event', registrationCount: event.registrations.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;