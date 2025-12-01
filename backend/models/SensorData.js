const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
  damId: {
    type: String,
    required: true,
    default: 'TEHRI_DAM_001'
  },
  waterLevel: {
    type: Number,
    required: true
  },
  seismicActivity: {
    type: Number,
    required: true
  },
  vibration: {
    type: Number,
    required: true
  },
  crackWidth: {
    type: Number,
    required: true
  },
  temperature: Number,
  pressure: Number,
  flowRate: Number,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
sensorDataSchema.index({ damId: 1, timestamp: -1 });

module.exports = mongoose.model('SensorData', sensorDataSchema);
