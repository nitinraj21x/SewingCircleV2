const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema({
  content: { type: String, required: true, maxlength: 2000 },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const collaboratorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, default: 'Collaborator', maxlength: 100 },
  joinedAt: { type: Date, default: Date.now }
});

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 200 },
  aim: { type: String, required: true, maxlength: 500 },
  description: { type: String, required: true, maxlength: 5000 },
  techStack: [{ type: String, trim: true }],
  status: {
    type: String,
    enum: ['ongoing', 'completed', 'paused'],
    default: 'ongoing'
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  collaborators: [collaboratorSchema],
  updates: [updateSchema],
  tags: [{ type: String, trim: true }],
  repoUrl: { type: String, default: '' },
  demoUrl: { type: String, default: '' },
  // Users this project has been shared with (from groups/circle)
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

projectSchema.index({ owner: 1, createdAt: -1 });
projectSchema.index({ visibility: 1, status: 1 });

module.exports = mongoose.model('Project', projectSchema);
