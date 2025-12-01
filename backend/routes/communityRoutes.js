const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');

// Community routes
router.get('/communities', communityController.getAllCommunities);
router.post('/communities', communityController.addCommunity);
router.put('/communities/:id', communityController.updateCommunity);

// Alert routes
router.post('/sms', communityController.sendSMSAlert);
router.post('/whatsapp', communityController.sendWhatsAppAlert);
router.post('/broadcast', communityController.sendEmergencyBroadcast);

module.exports = router;
