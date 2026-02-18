const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/auth');

/**
 * AI Chatbot Routes
 * Most routes allow guest access, some require authentication
 */

// Send message (works for both authenticated and guest users)
router.post('/message', optionalAuthMiddleware, chatbotController.sendMessage);

// Get conversation history
router.get('/conversation/:conversationId', optionalAuthMiddleware, chatbotController.getConversation);

// Get all conversations for user
router.get('/conversations', optionalAuthMiddleware, chatbotController.getUserConversations);

// Delete conversation
router.delete('/conversation/:conversationId', authMiddleware, chatbotController.deleteConversation);

// Get analytics (admin only)
router.get('/analytics', authMiddleware, chatbotController.getAnalytics);

module.exports = router;
