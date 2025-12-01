const express = require('express');
const router = express.Router();
const governmentController = require('../controllers/governmentController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

/**
 * Government Integration Routes
 * All routes require authentication
 */

// Compliance Reports
router.get('/reports', authMiddleware, governmentController.getAllReports);
router.post('/reports/submit', authMiddleware, governmentController.submitComplianceReport);
router.get('/reports/:reportId/status', authMiddleware, governmentController.getReportStatus);

// IMD (India Meteorological Department)
router.get('/imd/weather', authMiddleware, governmentController.getIMDWeatherData);

// NDMA (National Disaster Management Authority)
router.get('/ndma/alerts', authMiddleware, governmentController.getNDMAAlerts);

// CWC (Central Water Commission)
router.get('/cwc/water-data', authMiddleware, governmentController.getCWCWaterData);

// Data Synchronization
router.post('/sync', authMiddleware, adminMiddleware, governmentController.syncWithGovernment);

module.exports = router;
