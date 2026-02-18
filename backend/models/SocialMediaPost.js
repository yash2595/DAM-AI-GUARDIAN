const mongoose = require('mongoose');

const socialMediaPostSchema = new mongoose.Schema({
  platform: {
    type: String,
    enum: ['twitter', 'facebook', 'both'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  postIds: {
    twitter: String,
    facebook: String
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'posted', 'failed'],
    default: 'posted'
  },
  scheduledFor: Date,
  postedAt: Date,
  engagement: {
    likes: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    },
    reach: {
      type: Number,
      default: 0
    }
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SocialMediaPost', socialMediaPostSchema);
