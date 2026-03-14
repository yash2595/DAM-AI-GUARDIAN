const express = require('express');
const router = express.Router();

// Mock PWA subscription
router.post('/subscribe', (req, res) => {
  const { subscription } = req.body;
  console.log('New push subscription:', subscription);
  res.json({ success: true, message: 'Subscription saved successfully' });
});

// Send notification
router.post('/send-notification', (req, res) => {
  const { title, body, data } = req.body;
  // In real app, use web-push here. For now, we rely on Socket.io handled in server.js
  res.json({ success: true, message: 'Notification scheduled' });
});

module.exports = router;
