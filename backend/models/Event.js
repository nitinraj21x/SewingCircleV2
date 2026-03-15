const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['upcoming', 'past'],
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  // Upcoming event fields
  name: String,
  date: String,
  time: String,
  venue: String,
  description: String,
  
  // Past event fields
  header: String,
  theme: String,
  teaser: String,
  fullDescription: String,
  location: String,
  duration: String,
  participants: Number,
  facilitator: String,
  coverImage: String,
  gallery: [String],
  
  // Registration fields
  registrations: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    }
  }],
  maxParticipants: {
    type: Number,
    default: null // null means unlimited
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);