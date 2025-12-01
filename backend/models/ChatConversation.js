const mongoose = require('mongoose');

const chatConversationSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  language: {
    type: String,
    enum: ['en', 'hi'],
    default: 'en'
  },
  messages: [{
    sender: {
      type: String,
      enum: ['user', 'bot'],
      required: true
    },
    text: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Only index userId and lastMessageAt - conversationId index is created by unique: true
chatConversationSchema.index({ userId: 1, lastMessageAt: -1 });

module.exports = mongoose.model('ChatConversation', chatConversationSchema);
