const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: String,
  startDate: Date,
  endDate: Date,
  current: { type: Boolean, default: false },
  description: String
});

const educationSchema = new mongoose.Schema({
  school: { type: String, required: true },
  degree: String,
  fieldOfStudy: String,
  startDate: Date,
  endDate: Date,
  current: { type: Boolean, default: false },
  description: String
});

const userSchema = new mongoose.Schema({
  // Authentication
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  // Basic Info
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  headline: {
    type: String,
    default: '',
    maxlength: 120
  },
  bio: {
    type: String,
    default: '',
    maxlength: 2000
  },
  location: {
    type: String,
    default: ''
  },
  
  // Profile Media
  profilePicture: {
    type: String,
    default: '/uploads/default-avatar.png'
  },
  coverPhoto: {
    type: String,
    default: '/uploads/default-cover.jpg'
  },
  
  // Professional Info
  skills: [{
    type: String,
    trim: true
  }],
  experience: [experienceSchema],
  education: [educationSchema],
  
  // Social
  connections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Account Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  rejectionReason: String,
  
  // Metadata
  lastLogin: Date,
  isOnline: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get full name
userSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
  return {
    _id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    headline: this.headline,
    bio: this.bio,
    location: this.location,
    profilePicture: this.profilePicture,
    coverPhoto: this.coverPhoto,
    skills: this.skills,
    experience: this.experience,
    education: this.education,
    connections: this.connections.length,
    followers: this.followers.length,
    following: this.following.length,
    status: this.status,
    createdAt: this.createdAt
  };
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
