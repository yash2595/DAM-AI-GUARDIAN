const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  distance: {
    type: Number,
    required: true
  },
  population: {
    type: Number,
    required: true
  },
  contactPerson: String,
  contactPhone: {
    type: String,
    required: true
  },
  whatsappNumber: {
    type: String,
    required: true
  },
  email: String,
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  status: {
    type: String,
    enum: ['safe', 'alert', 'evacuate'],
    default: 'safe'
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  alertsSent: [{
    message: String,
    channel: String,
    sentAt: Date,
    recipients: Number
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Community', communitySchema);
