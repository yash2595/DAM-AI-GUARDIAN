const express = require('express');
const router = express.Router();
const voiceController = require('../controllers/voiceController');

router.post('/process-command', voiceController.processCommand);
router.post('/text-to-speech', voiceController.textToSpeech);

module.exports = router;
