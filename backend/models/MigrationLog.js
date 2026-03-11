const mongoose = require('mongoose');

const migrationLogSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['events_migration', 'schema_update', 'data_cleanup']
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed'],
    default: 'pending'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date,
    default: null
  },
  recordsProcessed: {
    type: Number,
    default: 0
  },
  recordsSuccessful: {
    type: Number,
    default: 0
  },
  recordsFailed: {
    type: Number,
    default: 0
  },
  errors: [{
    record: String,
    error: String,
    timestamp: { type: Date, default: Date.now }
  }],
  metadata: {
    version: String,
    initiatedBy: String,
    notes: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MigrationLog', migrationLogSchema);
