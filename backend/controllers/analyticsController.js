const SensorData = require('../models/SensorData');
const Alert = require('../models/Alert');

// Get overview analytics
exports.getOverview = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // In a real app, query based on date range
    const totalObservations = await SensorData.countDocuments();
    const anomaliesDetected = await Alert.countDocuments({ severity: 'High' });
    
    // Derived analytics
    res.json({
      success: true,
      data: {
        totalObservations,
        averageWaterLevel: 72.5, // Mock derived for now
        peakWaterLevel: 89.2,   // Mock derived for now
        anomaliesDetected,
        status: 'calculated'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get water flow analytics
exports.getWaterFlow = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    // Return mock data for visualization if DB is sparse
    const mockData = generateMockWaterFlow(parseInt(days));
    
    res.json({
      success: true,
      data: mockData
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Helper for mock data (same as was in server.js)
function generateMockWaterFlow(days) {
  const data = [];
  const now = Date.now();
  for (let i = 0; i < days; i++) {
    const date = new Date(now - (days - i) * 24 * 60 * 60 * 1000);
    const seasonal = Math.sin((i / 365) * Math.PI * 2) * 200;
    data.push({
      timestamp: date.toISOString(),
      date: date.toLocaleDateString(),
      inflow: 1000 + seasonal + Math.random() * 300,
      outflow: 950 + seasonal + Math.random() * 250,
      waterLevel: 70 + Math.random() * 15
    });
  }
  return data;
}
