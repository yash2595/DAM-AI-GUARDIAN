const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/overview', analyticsController.getOverview);
router.get('/water-flow', analyticsController.getWaterFlow);

module.exports = router;
