const express = require('express');
const router = express.Router();
const socialMediaController = require('../controllers/socialMediaController');

// Social media posting routes
router.post('/twitter', socialMediaController.postToTwitter);
router.post('/facebook', socialMediaController.postToFacebook);
router.post('/post-all', socialMediaController.postToAll);

// Analytics and history routes
router.get('/analytics', socialMediaController.getAnalytics);
router.get('/posts', socialMediaController.getRecentPosts);

module.exports = router;
