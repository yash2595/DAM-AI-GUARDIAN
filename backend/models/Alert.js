const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['water_level', 'seismic', 'vibration', 'crack', 'weather', 'system'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  damId: {
    type: String,
    default: 'TEHRI_DAM_001'
  },
  sensorData: mongoose.Schema.Types.Mixed,
  status: {
    type: String,
    enum: ['active', 'acknowledged', 'resolved'],
    default: 'active'
  },
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  acknowledgedAt: Date,
  resolvedAt: Date,
  notificationsSent: [{
    recipient: String,
    channel: String,
    sentAt: Date,
    status: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

alertSchema.index({ damId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);
