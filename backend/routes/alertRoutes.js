const express = require('express');
const router = express.Router();
const { sendAlert, getAlertHistory, broadcastEmergency } = require('../controllers/alertController');

// GET /api/alerts/history — fetch backend alert history
router.get('/history', getAlertHistory);

// POST /api/alerts/send — send alert to specified (or all authority) recipients
router.post('/send', sendAlert);

// POST /api/alerts/broadcast — emergency broadcast to all authorities + communities
router.post('/broadcast', broadcastEmergency);

module.exports = router;
