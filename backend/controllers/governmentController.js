const { ComplianceReport, SensorData } = require('../database/models');
const axios = require('axios');

/**
 * Government Integration Controller
 * Handles integration with NDMA, IMD, CWC and compliance reporting
 */

// Get all compliance reports
exports.getAllReports = async (req, res) => {
  try {
    const reports = await ComplianceReport.find()
      .sort({ submittedAt: -1 })
      .limit(100);
    
    res.json({ success: true, data: reports });
  } catch (error) {
    console.error('Error fetching compliance reports:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reports' });
  }
};

// Submit new compliance report to government
exports.submitComplianceReport = async (req, res) => {
  try {
    const { reportType, data, agencies } = req.body;
    
    // Create report in database
    const report = new ComplianceReport({
      reportType,
      data,
      agencies: agencies || ['NDMA', 'IMD', 'CWC'],
      submittedBy: req.user?.id || 'system',
      status: 'submitted'
    });
    
    await report.save();
    
    // Send to government agencies (mock implementation)
    const submissions = [];
    for (const agency of report.agencies) {
      try {
        const submission = await submitToAgency(agency, report);
        submissions.push({
          agency,
          status: 'success',
          trackingId: submission.trackingId
        });
        
        report.submissionIds[agency] = submission.trackingId;
      } catch (error) {
        submissions.push({
          agency,
          status: 'failed',
          error: error.message
        });
      }
    }
    
    report.status = submissions.every(s => s.status === 'success') ? 'submitted' : 'partial';
    await report.save();
    
    res.json({ 
      success: true, 
      message: 'Report submitted to government agencies',
      data: { report, submissions }
    });
  } catch (error) {
    console.error('Error submitting compliance report:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get report status and acknowledgments
exports.getReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    
    const report = await ComplianceReport.findById(reportId);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    
    // Fetch status from government agencies (mock)
    const statusUpdates = [];
    for (const agency of report.agencies) {
      const status = await checkAgencyStatus(agency, report.submissionIds[agency]);
      statusUpdates.push({
        agency,
        status: status.status,
        lastUpdated: status.timestamp,
        message: status.message
      });
      
      // Update acknowledgments
      if (status.status === 'acknowledged' && !report.acknowledgments.some(a => a.agency === agency)) {
        report.acknowledgments.push({
          agency,
          acknowledgedAt: new Date(),
          officerName: status.officerName,
          remarks: status.remarks
        });
      }
    }
    
    await report.save();
    
    res.json({ 
      success: true, 
      data: { 
        report,
        statusUpdates
      }
    });
  } catch (error) {
    console.error('Error fetching report status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch weather data from IMD
exports.getIMDWeatherData = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    
    // Mock IMD API call
    const weatherData = {
      location: { latitude, longitude },
      current: {
        temperature: 28 + Math.random() * 5,
        humidity: 65 + Math.random() * 20,
        windSpeed: 10 + Math.random() * 15,
        rainfall: Math.random() * 50,
        condition: 'Partly Cloudy'
      },
      forecast: {
        next24Hours: {
          rainfall: Math.random() * 100,
          maxTemp: 32,
          minTemp: 24,
          warning: null
        },
        next7Days: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
          maxTemp: 30 + Math.random() * 5,
          minTemp: 22 + Math.random() * 5,
          rainfall: Math.random() * 80,
          condition: ['Sunny', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 3)]
        }))
      },
      alerts: [],
      source: 'IMD'
    };
    
    res.json({ success: true, data: weatherData });
  } catch (error) {
    console.error('Error fetching IMD weather data:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch disaster alerts from NDMA
exports.getNDMAAlerts = async (req, res) => {
  try {
    // Mock NDMA API call
    const alerts = [
      {
        id: 'NDMA-2024-001',
        type: 'Flood Warning',
        severity: 'high',
        region: 'Maharashtra',
        issuedAt: new Date(),
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
        message: 'Heavy rainfall expected in the region. Monitor water levels closely.',
        advisories: [
          'Monitor dam water levels continuously',
          'Be prepared for controlled water release',
          'Alert downstream communities'
        ],
        source: 'NDMA'
      }
    ];
    
    res.json({ success: true, data: alerts });
  } catch (error) {
    console.error('Error fetching NDMA alerts:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch water resource data from CWC
exports.getCWCWaterData = async (req, res) => {
  try {
    const { damId } = req.query;
    
    // Get latest sensor data
    const sensorData = await SensorData.findOne({ damId })
      .sort({ timestamp: -1 });
    
    // Mock CWC API call for basin data
    const waterData = {
      dam: {
        id: damId,
        name: 'Hydrolake Dam',
        currentLevel: sensorData?.waterLevel || 0,
        capacity: 1000, // Million Cubic Meters
        currentStorage: sensorData?.waterLevel ? (sensorData.waterLevel / 100) * 1000 : 0
      },
      basin: {
        name: 'Krishna Basin',
        totalStorage: 5000,
        currentStorage: 3200,
        inflowRate: 150,
        outflowRate: 100
      },
      recommendations: {
        optimalLevel: 85,
        releaseRequired: false,
        releaseVolume: 0,
        reasoning: 'Current water level is within safe operational limits'
      },
      historicalData: {
        sameTimeLastYear: 72,
        averageLast5Years: 78,
        trend: 'stable'
      },
      source: 'CWC'
    };
    
    res.json({ success: true, data: waterData });
  } catch (error) {
    console.error('Error fetching CWC water data:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Sync data with government systems
exports.syncWithGovernment = async (req, res) => {
  try {
    const { dataType, startDate, endDate } = req.body;
    
    // Get data to sync
    let dataToSync;
    if (dataType === 'sensor') {
      dataToSync = await SensorData.find({
        timestamp: { $gte: new Date(startDate), $lte: new Date(endDate) }
      });
    }
    
    // Sync with each agency
    const syncResults = {
      NDMA: { status: 'success', recordsSynced: dataToSync?.length || 0 },
      IMD: { status: 'success', recordsSynced: dataToSync?.length || 0 },
      CWC: { status: 'success', recordsSynced: dataToSync?.length || 0 }
    };
    
    res.json({ 
      success: true, 
      message: 'Data synced with government systems',
      data: syncResults
    });
  } catch (error) {
    console.error('Error syncing with government:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to submit report to agency
async function submitToAgency(agency, report) {
  // Mock implementation - in production, this would call actual government APIs
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    trackingId: `${agency}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    status: 'submitted',
    timestamp: new Date()
  };
}

// Helper function to check agency status
async function checkAgencyStatus(agency, trackingId) {
  // Mock implementation
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const statuses = ['pending', 'acknowledged', 'processed'];
  return {
    status: statuses[Math.floor(Math.random() * statuses.length)],
    timestamp: new Date(),
    message: 'Report received and under review',
    officerName: 'Government Officer',
    remarks: 'All data received. No issues found.'
  };
}

module.exports = exports;
