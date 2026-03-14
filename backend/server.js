const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { Server } = require('socket.io');
const http = require('http');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const whatsAppClient = require('@green-api/whatsapp-api-client');
require('dotenv').config();

// Database connection
const connectDB = require('./config/database');
// Connect to MongoDB immediately at startup
connectDB();

// Import routes
const authRoutes = require('./routes/authRoutes');
const alertRoutes = require('./routes/alertRoutes');
const communityRoutes = require('./routes/communityRoutes');
const socialMediaRoutes = require('./routes/socialMediaRoutes');
const governmentRoutes = require('./routes/governmentRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const damAnalysisRoutes = require('./routes/damAnalysisRoutes');
const authorityRoutes = require('./routes/authorityRoutes');
const iotRoutes = require('./routes/iotRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const voiceRoutes = require('./routes/voiceRoutes');
const pwaRoutes = require('./routes/pwaRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Initialize Twilio client for SMS
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  console.log('OK. Twilio SMS client initialized');
} else {
  console.log('Notice: Twilio credentials not found - SMS will run in demo mode');
}

// Initialize WhatsApp client
let whatsAppAPI = null;
if (process.env.WHATSAPP_INSTANCE_ID && process.env.WHATSAPP_API_TOKEN) {
  whatsAppAPI = whatsAppClient.restAPI({
    idInstance: process.env.WHATSAPP_INSTANCE_ID,
    apiTokenInstance: process.env.WHATSAPP_API_TOKEN
  });
  console.log('OK. WhatsApp Business API client initialized');
} else {
  console.log('Notice: WhatsApp credentials not found - WhatsApp will run in demo mode');
}

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/social', socialMediaRoutes);
app.use('/api/government', governmentRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/dam', damAnalysisRoutes);
app.use('/api/authorities', authorityRoutes);
app.use('/api/iot', iotRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/pwa', pwaRoutes);

// ========================================
// AI Risk Assessment API (Using ML API)
// ========================================
app.post('/api/ai/risk-assessment', async (req, res) => {
  try {
    const { sensorData } = req.body;
    
    try {
      const mlResponse = await axios.post('http://localhost:5001/predict', {
        sensorData
      });
      res.json(mlResponse.data);
    } catch (mlError) {
      console.log('ML API unavailable, using fallback logic');
      const riskScore = calculateRiskScore(sensorData);
      const prediction = generatePrediction(riskScore);
      const recommendations = generateRecommendations(sensorData, riskScore);
      
      res.json({
        success: true,
        data: {
          riskScore,
          prediction,
          recommendations,
          timestamp: new Date().toISOString(),
          source: 'fallback'
        }
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// Weather API Integration
// ========================================
app.get('/api/weather/current', async (req, res) => {
  try {
    const { lat = 30.37, lon = 78.48 } = req.query;
    const weatherData = await fetchWeatherData(lat, lon);
    res.json({ success: true, data: weatherData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/weather/forecast', async (req, res) => {
  try {
    const { lat = 30.37, lon = 78.48, days = 7 } = req.query;
    const forecast = await fetchForecastData(lat, lon, days);
    res.json({ success: true, data: forecast });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// 3D Visualization Data API
// ========================================
app.get('/api/3d/dam-structure', (req, res) => {
  try {
    const structure = get3DStructureData();
    res.json({ success: true, data: structure });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/3d/stress-points', (req, res) => {
  try {
    const stressPoints = getStressPoints();
    res.json({ success: true, data: stressPoints });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// Socket.IO Real-time Updates
// ========================================
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  const sensorInterval = setInterval(() => {
    socket.emit('sensor-update', generateRealtimeSensorData());
  }, 2000);
  
  const aiInterval = setInterval(() => {
    socket.emit('ai-prediction', generateAIPrediction());
  }, 5000);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    clearInterval(sensorInterval);
    clearInterval(aiInterval);
  });
});

// ========================================
// Helper Functions
// ========================================

function calculateRiskScore(sensorData) {
  let score = 0;
  if (sensorData.waterLevel > 80) score += (sensorData.waterLevel - 80) * 2;
  if (sensorData.vibration > 2) score += (sensorData.vibration - 2) * 10;
  if (sensorData.seismicActivity > 0.5) score += sensorData.seismicActivity * 20;
  if (sensorData.crackWidth > 0.2) score += (sensorData.crackWidth - 0.2) * 50;
  return Math.min(score, 100);
}

function generatePrediction(riskScore) {
  if (riskScore < 20) return 'Low Risk - Normal Operations';
  if (riskScore < 50) return 'Moderate Risk - Increased Monitoring Required';
  if (riskScore < 80) return 'High Risk - Alert Authorities';
  return 'Critical Risk - Emergency Protocols Activated';
}

function generateRecommendations(sensorData, riskScore) {
  const recommendations = ['Continue standard monitoring'];
  if (sensorData.waterLevel > 90) recommendations.push('Activate secondary spillway');
  if (sensorData.vibration > 4) recommendations.push('Inspect turbine housing');
  if (riskScore > 70) recommendations.push('Notify local emergency services');
  return recommendations;
}

function generateRealtimeSensorData() {
  return {
    timestamp: Date.now(),
    waterLevel: 70 + Math.random() * 20,
    pressure: 60 + Math.random() * 30,
    temperature: 18 + Math.random() * 10,
    seepage: 2 + Math.random() * 5,
    structuralStress: 50 + Math.random() * 40,
    inflow: 1000 + Math.random() * 400,
    outflow: 900 + Math.random() * 350,
    turbidity: 5 + Math.random() * 10,
    ph: 7.0 + Math.random() * 1.5,
    dissolvedOxygen: 6 + Math.random() * 3
  };
}

function generateAIPrediction() {
  const riskScore = Math.random() * 100;
  return {
    timestamp: Date.now(),
    riskScore,
    prediction: generatePrediction(riskScore),
    confidence: 0.92 + Math.random() * 0.06
  };
}

async function fetchWeatherData(lat, lon) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,visibility,cloud_cover&timezone=auto`;
    const response = await axios.get(url);
    const current = response.data.current;
    
    return {
      temperature: Math.round(current.temperature_2m * 10) / 10,
      humidity: current.relative_humidity_2m || 0,
      windSpeed: Math.round(current.wind_speed_10m * 10) / 10,
      precipitation: Math.round((current.precipitation || 0) * 10) / 10,
      condition: 'Clear',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return { temperature: 20, humidity: 60, condition: 'Mock' };
  }
}

async function fetchForecastData(lat, lon, days) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=${days}`;
    const response = await axios.get(url);
    const data = response.data;
    return data.daily.time.map((t, i) => ({
      date: t,
      tempMin: data.daily.temperature_2m_min[i],
      tempMax: data.daily.temperature_2m_max[i]
    }));
  } catch (error) {
    return [];
  }
}

function get3DStructureData() {
  return {
    dimensions: { height: 150, width: 500, thickness: 50 },
    sections: [
      { name: 'Crest', elevation: 150, stress: 45 },
      { name: 'Middle Section', elevation: 75, stress: 78 },
      { name: 'Base', elevation: 0, stress: 85 }
    ]
  };
}

function getStressPoints() {
  return [
    { x: 250, y: 75, z: 25, stress: 85, type: 'critical' },
    { x: 150, y: 100, z: 20, stress: 72, type: 'high' }
  ];
}

server.listen(PORT, () => {
  console.log(`HydroLake Backend Server running on port ${PORT}`);
});

module.exports = { app, io, server };
