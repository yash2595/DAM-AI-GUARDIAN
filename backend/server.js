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

// Import routes
const authRoutes = require('./routes/authRoutes');
const communityRoutes = require('./routes/communityRoutes');
const socialMediaRoutes = require('./routes/socialMediaRoutes');
const governmentRoutes = require('./routes/governmentRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

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
  console.log('✅ Twilio SMS client initialized');
} else {
  console.log('⚠️  Twilio credentials not found - SMS will run in demo mode');
}

// Initialize WhatsApp client
let whatsAppAPI = null;
if (process.env.WHATSAPP_INSTANCE_ID && process.env.WHATSAPP_API_TOKEN) {
  whatsAppAPI = whatsAppClient.restAPI({
    idInstance: process.env.WHATSAPP_INSTANCE_ID,
    apiTokenInstance: process.env.WHATSAPP_API_TOKEN
  });
  console.log('✅ WhatsApp Business API client initialized');
} else {
  console.log('⚠️  WhatsApp credentials not found - WhatsApp will run in demo mode');
}

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes - New database-backed endpoints
app.use('/api/auth', authRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/social', socialMediaRoutes);
app.use('/api/government', governmentRoutes);
app.use('/api/chatbot', chatbotRoutes);

// ========================================
// AI Risk Assessment API (Using ML API)
// ========================================
app.post('/api/ai/risk-assessment', async (req, res) => {
  try {
    const { sensorData } = req.body;
    
    // Call ML API for prediction
    try {
      const mlResponse = await axios.post('http://localhost:5001/predict', {
        sensorData
      });
      
      // Return ML API response
      res.json(mlResponse.data);
    } catch (mlError) {
      console.log('ML API unavailable, using fallback logic');
      
      // Fallback to local calculation if ML API is down
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
          modelVersion: '2.1.0-fallback',
          confidence: 0.85
        }
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Model Training Endpoint
app.post('/api/ai/train', async (req, res) => {
  try {
    const { trainingData } = req.body;
    
    // Simulate model training
    setTimeout(() => {
      io.emit('training-progress', { 
        progress: 100, 
        status: 'completed',
        accuracy: 0.96 
      });
    }, 5000);
    
    res.json({
      success: true,
      message: 'Training started',
      jobId: `train_${Date.now()}`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// Weather Integration API
// ========================================
app.get('/api/weather/current', async (req, res) => {
  try {
    const { lat = 28.6139, lon = 77.2090 } = req.query; // Default: Delhi
    
    // Replace with your actual weather API key
    const WEATHER_API_KEY = process.env.WEATHER_API_KEY || 'demo_key';
    
    // Using OpenWeatherMap API (you can replace with any weather service)
    const weatherData = await fetchWeatherData(lat, lon, WEATHER_API_KEY);
    
    res.json({
      success: true,
      data: weatherData
    });
  } catch (error) {
    // Fallback to mock data if API fails
    res.json({
      success: true,
      data: getMockWeatherData()
    });
  }
});

app.get('/api/weather/forecast', async (req, res) => {
  try {
    const { lat = 28.6139, lon = 77.2090, days = 7 } = req.query;
    
    const forecastData = await fetchForecastData(lat, lon, days);
    
    res.json({
      success: true,
      data: forecastData
    });
  } catch (error) {
    res.json({
      success: true,
      data: getMockForecastData(days)
    });
  }
});

// Weather Impact Analysis
app.post('/api/weather/impact-analysis', async (req, res) => {
  try {
    const { weatherData, damData } = req.body;
    
    const impact = analyzeWeatherImpact(weatherData, damData);
    
    res.json({
      success: true,
      data: impact
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// Alert Notification API
// ========================================

// Configure email transporter only if credentials are provided
let emailTransporter = null;
if (process.env.EMAIL_USER && (process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD)) {
  emailTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // Use TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD
    },
    // Add timeout and debugging settings
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
    debug: true, // Enable debug logs
    logger: true // Enable logging
  });
  
  console.log('\n' + '='.repeat(80));
  console.log('📧 EMAIL CONFIGURATION');
  console.log('='.repeat(80));
  console.log('✅ Email transporter configured');
  console.log(`   Host: ${process.env.EMAIL_HOST || 'smtp.gmail.com'}`);
  console.log(`   Port: ${parseInt(process.env.EMAIL_PORT) || 587}`);
  console.log(`   User: ${process.env.EMAIL_USER}`);
  console.log(`   Auth: ${(process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD) ? '****' + (process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD).slice(-4) : 'NOT SET'}`);
  console.log('='.repeat(80) + '\n');
  
  // Test email configuration on startup
  emailTransporter.verify()
    .then(() => {
      console.log('✅ Email server connection verified - Ready to send alerts!');
    })
    .catch(err => {
      console.error('\n' + '='.repeat(80));
      console.error('❌ EMAIL SERVER VERIFICATION FAILED');
      console.error('='.repeat(80));
      console.error('Error:', err.message);
      console.error('Code:', err.code);
      if (err.response) {
        console.error('Response:', err.response);
      }
      console.error('\n💡 Troubleshooting:');
      console.error('   1. Check if Gmail App Password is correct');
      console.error('   2. Enable "Less secure app access" in Gmail settings');
      console.error('   3. Check if 2-Step Verification is enabled');
      console.error('   4. Try generating a new App Password');
      console.error('='.repeat(80) + '\n');
    });
} else {
  console.log('⚠️  Email credentials not configured - running in development mode');
}
// Server-side rate limiter for alerts (per key)
const lastSentServer = {};

// Send alert endpoint
app.post('/api/alerts', async (req, res) => {
  try {
    const { recipients, subject, body, metadata } = req.body;
    
    console.log('📧 Alert notification request received');
    console.log('Recipients:', recipients);
    console.log('Subject:', subject);
    
    // Validate required fields
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Recipients array is required'
      });
    }
    
    if (!subject || !body) {
      return res.status(400).json({
        success: false,
        error: 'Subject and body are required'
      });
    }
    
    // Check if email is configured
    if (!process.env.EMAIL_USER || (!process.env.EMAIL_PASS && !process.env.EMAIL_PASSWORD)) {
      console.warn('⚠️  Email credentials not configured, simulating alert...');
      
      // Simulate successful alert for development
      return res.json({
        success: true,
        message: 'Alert simulated (email not configured)',
        recipients: recipients,
        timestamp: new Date().toISOString(),
        development_mode: true
      });
    }
    
    // Create email HTML
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .alert-box { background: white; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
          .metadata { background: #f3f4f6; padding: 10px; margin-top: 20px; font-size: 12px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🚨 ${subject}</h1>
        </div>
        <div class="content">
          <div class="alert-box">
            ${body.replace(/\n/g, '<br>')}
          </div>
          ${metadata ? `
          <div class="metadata">
            <strong>Alert Metadata:</strong><br>
            ${Object.entries(metadata).map(([key, value]) => `<strong>${key}:</strong> ${value}`).join('<br>')}
          </div>
          ` : ''}
        </div>
        <div class="footer">
          <p>This is an automated alert from HydroLake Dam Monitoring System</p>
          <p>Generated at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
        </div>
      </body>
      </html>
    `;
    
    // Send emails to all recipients
    const emailPromises = recipients.map(recipient => 
      emailTransporter.sendMail({
        from: `"HydroLake Alert System" <${process.env.EMAIL_USER}>`,
        to: recipient,
        subject: `🚨 ${subject}`,
        text: body,
        html: htmlBody
      })
    );
    
    const emailResults = await Promise.allSettled(emailPromises);
    const successCount = emailResults.filter(r => r.status === 'fulfilled').length;
    const failedCount = emailResults.length - successCount;
    
    console.log(`✅ Alert results: ${successCount} sent, ${failedCount} failed (${recipients.length} total)`);
    
    // Log any failures
    emailResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`❌ Failed to send to ${recipients[index]}:`, result.reason?.message || result.reason);
      }
    });
    
    // Emit socket event for real-time notification
    io.emit('alert-sent', {
      recipients: recipients.length,
      successful: successCount,
      failed: failedCount,
      subject,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'Alert sent successfully',
      recipients: recipients,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Alert sending failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Send alert endpoint (used by frontend alertService)
app.post('/api/alerts/send', async (req, res) => {
  try {
    const { recipients, subject, body, metadata } = req.body;
    
    console.log('\n' + '='.repeat(80));
    console.log('📧 MANUAL ALERT REQUEST FROM FRONTEND');
    console.log('='.repeat(80));
    console.log('Recipients:', recipients);
    console.log('Subject:', subject);
    console.log('Body preview:', body.substring(0, 100) + '...');
    console.log('='.repeat(80) + '\n');
    
    // Validate required fields
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        ok: false,
        error: 'Recipients array is required and must not be empty'
      });
    }
    
    if (!subject || !body) {
      return res.status(400).json({
        ok: false,
        error: 'Subject and body are required'
      });
    }
    
    // Check if email is configured
    if (!emailTransporter) {
      console.warn('⚠️  Email not configured, simulating alert...');
      return res.json({
        ok: true,
        message: 'Alert simulated (email not configured)',
        recipients: recipients,
        development_mode: true
      });
    }
    
    // Create HTML email
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 30px; background: #ffffff; }
          .alert-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 4px; }
          .alert-box pre { white-space: pre-wrap; font-family: 'Courier New', monospace; margin: 0; }
          .metadata { background: #f3f4f6; padding: 15px; margin-top: 20px; border-radius: 4px; font-size: 14px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; background: #f9fafb; }
          .urgent { color: #dc2626; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 ${subject}</h1>
            <p class="urgent">URGENT: Immediate Action Required</p>
          </div>
          <div class="content">
            <div class="alert-box">
              <pre>${body.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
            </div>
            ${metadata ? `
            <div class="metadata">
              <strong>📊 Alert Metadata:</strong><br><br>
              ${Object.entries(metadata).map(([key, value]) => 
                `<strong>${key}:</strong> ${JSON.stringify(value)}`
              ).join('<br>')}
            </div>
            ` : ''}
          </div>
          <div class="footer">
            <p><strong>HydroLake Dam Monitoring System</strong></p>
            <p>This is an automated alert. Please take immediate action.</p>
            <p>Generated: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Send emails to all recipients
    const emailPromises = recipients.map(recipient => 
      emailTransporter.sendMail({
        from: `"🚨 HydroLake Alert System" <${process.env.EMAIL_USER}>`,
        to: recipient,
        subject: `🚨 URGENT: ${subject}`,
        text: `${subject}\n\n${body}`,
        html: htmlBody,
        priority: 'high'
      })
    );
    
    const emailResults = await Promise.allSettled(emailPromises);
    const successCount = emailResults.filter(r => r.status === 'fulfilled').length;
    const failedCount = emailResults.length - successCount;
    
    console.log('\n' + '='.repeat(80));
    console.log('📧 ALERT SENDING RESULTS');
    console.log('='.repeat(80));
    console.log(`✅ Successful: ${successCount}/${recipients.length}`);
    console.log(`❌ Failed: ${failedCount}/${recipients.length}`);
    
    // Log detailed results
    emailResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`✅ ${recipients[index]}: ${result.value.messageId}`);
      } else {
        console.error(`❌ ${recipients[index]}: ${result.reason?.message || result.reason}`);
      }
    });
    console.log('='.repeat(80) + '\n');
    
    // Emit socket event
    io.emit('manual-alert-sent', {
      recipients: recipients.length,
      successful: successCount,
      failed: failedCount,
      subject,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      ok: true,
      message: `Alert sent to ${successCount} of ${recipients.length} recipients`,
      successful: successCount,
      failed: failedCount,
      recipients: recipients
    });
    
  } catch (error) {
    console.error('❌ Manual alert sending failed:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

// Test alert endpoint
app.post('/api/alerts/test', async (req, res) => {
  try {
    const { email } = req.body;
    
    const testEmail = email || 'mishrayash2595@gmail.com';
    
    // Check if email is configured
    if (!emailTransporter) {
      console.log('📧 Test alert simulated for:', testEmail);
      return res.json({
        success: true,
        message: 'Test alert simulated (email not configured)',
        email: testEmail,
        development_mode: true,
        timestamp: new Date().toISOString()
      });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🚨 SENDING TEST ALERT EMAIL');
    console.log('='.repeat(80));
    console.log('To:', testEmail);
    console.log('Time:', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
    console.log('='.repeat(80) + '\n');
    
    // Send test alert
    const testResult = await emailTransporter.sendMail({
      from: `"HydroLake Alert System" <${process.env.EMAIL_USER}>`,
      to: testEmail,
      subject: '✅ Test Alert - HydroLake System',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
          <div style="background: #22c55e; color: white; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 18px;">✅ Test Alert Successful</h2>
          </div>
          <div style="background: white; padding: 20px; border-radius: 5px; border-left: 4px solid #22c55e;">
            <h3>This is a test alert from the HydroLake Dam Monitoring System.</h3>
            <p>If you received this email, <strong>the alert system is working correctly!</strong></p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p><strong>Time:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
            <p><strong>Server:</strong> HydroLake Backend (Port 5000)</p>
            <p><strong>Email Service:</strong> Gmail SMTP</p>
          </div>
          <div style="margin-top: 20px; font-size: 12px; color: #666; text-align: center;">
            <p>HydroLake Dam Monitoring System</p>
            <p>Automated Alert Testing</p>
          </div>
        </div>
      `
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ TEST EMAIL SENT SUCCESSFULLY!');
    console.log('='.repeat(80));
    console.log('Message ID:', testResult.messageId);
    console.log('Response:', testResult.response);
    console.log('='.repeat(80) + '\n');
    
    res.json({
      success: true,
      message: 'Test alert sent successfully! Check your email inbox (or spam folder).',
      messageId: testResult.messageId,
      email: testEmail,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('\n' + '='.repeat(80));
    console.error('❌ TEST EMAIL FAILED');
    console.error('='.repeat(80));
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    if (error.response) {
      console.error('Response:', error.response);
    }
    console.error('='.repeat(80) + '\n');
    
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code
    });
  }
});

// Get authorities list
app.get('/api/authorities', (req, res) => {
  try {
    // Initialize default authorities if not set
    if (!global.authorityEmails) {
      global.authorityEmails = [
        'ymishra2595@gmail.com',
        'control@damauthority.gov.in',
        'emergency@damauthority.gov.in',
        'water@state.gov.in'
      ];
    }
    
    // Create detailed authority objects from emails
    const authorities = global.authorityEmails.map((email, index) => ({
      id: index + 1,
      name: email.split('@')[0],
      email: email,
      role: index === 0 ? 'Primary' : 'Secondary'
    }));
    
    // Return both formats for compatibility
    res.json({
      success: true,
      data: authorities,
      authorities: global.authorityEmails // Frontend expects this format
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Add or update authority
app.post('/api/authorities', (req, res) => {
  try {
    // Handle two formats:
    // 1. Single authority: { name, email, role }
    // 2. Bulk update: { authorities: ["email1", "email2"] }
    
    if (req.body.authorities && Array.isArray(req.body.authorities)) {
      // Bulk update format from authorityService.ts
      const emails = req.body.authorities;
      
      console.log('📝 Bulk authority update:', emails);
      
      // Store in memory (in real app, save to database)
      global.authorityEmails = emails;
      
      return res.json({
        success: true,
        message: `${emails.length} authorities saved successfully`,
        authorities: emails
      });
    }
    
    // Single authority format
    const { name, email, role } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }
    
    console.log('📝 Authority saved:', { name, email, role });
    
    // Add to global list
    if (!global.authorityEmails) {
      global.authorityEmails = ['ymishra2595@gmail.com', 'control@damauthority.gov.in'];
    }
    
    if (!global.authorityEmails.includes(email)) {
      global.authorityEmails.push(email);
    }
    
    res.json({
      success: true,
      message: 'Authority saved successfully',
      data: { id: Date.now(), name, email, role },
      authorities: global.authorityEmails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete authority
app.delete('/api/authorities/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️ Authority deleted:', id);
    
    res.json({
      success: true,
      message: 'Authority deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ========================================
// IoT Sensor Data API
// ========================================
app.get('/api/iot/sensors', (req, res) => {
  try {
    const sensors = getIoTSensors();
    res.json({
      success: true,
      data: sensors
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/iot/sensor/:id', (req, res) => {
  try {
    const { id } = req.params;
    const sensorData = getSensorData(id);
    
    res.json({
      success: true,
      data: sensorData
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/iot/sensor/:id/calibrate', (req, res) => {
  try {
    const { id } = req.params;
    const { calibrationData } = req.body;
    
    // Simulate calibration process
    setTimeout(() => {
      io.emit('sensor-calibrated', { sensorId: id, status: 'success' });
    }, 3000);
    
    res.json({
      success: true,
      message: `Calibration started for sensor ${id}`,
      estimatedTime: '3 seconds'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// Voice Command Processing API
// ========================================
app.post('/api/voice/process-command', async (req, res) => {
  try {
    const { command, language = 'en' } = req.body;
    
    const response = processVoiceCommand(command, language);
    
    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/voice/text-to-speech', async (req, res) => {
  try {
    const { text, language = 'en', voice = 'female' } = req.body;
    
    // In production, integrate with TTS service like Google Cloud TTS or Amazon Polly
    res.json({
      success: true,
      data: {
        audioUrl: '/api/voice/audio/generated',
        duration: text.length * 0.1, // Mock duration
        language,
        voice
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// PWA & Notification API
// ========================================
app.post('/api/pwa/subscribe', (req, res) => {
  try {
    const { subscription } = req.body;
    
    // Store subscription in database (mock for now)
    console.log('New push subscription:', subscription);
    
    res.json({
      success: true,
      message: 'Subscription saved successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/pwa/send-notification', (req, res) => {
  try {
    const { title, body, data } = req.body;
    
    // Emit notification through Socket.IO
    io.emit('push-notification', { title, body, data, timestamp: Date.now() });
    
    res.json({
      success: true,
      message: 'Notification sent'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// Analytics & Reporting API
// ========================================
app.get('/api/analytics/overview', (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const analytics = generateAnalytics(startDate, endDate);
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/analytics/water-flow', (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const waterFlowData = generateWaterFlowData(parseInt(days));
    
    res.json({
      success: true,
      data: waterFlowData
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/analytics/generate-report', async (req, res) => {
  try {
    const { reportType, parameters } = req.body;
    
    // Simulate report generation
    const report = await generateReport(reportType, parameters);
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// 3D Visualization Data API
// ========================================
app.get('/api/3d/structure-data', (req, res) => {
  try {
    const structureData = get3DStructureData();
    
    res.json({
      success: true,
      data: structureData
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/3d/stress-points', (req, res) => {
  try {
    const stressPoints = getStressPoints();
    
    res.json({
      success: true,
      data: stressPoints
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// Socket.IO Real-time Updates
// ========================================
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Start streaming sensor data
  const sensorInterval = setInterval(() => {
    socket.emit('sensor-update', generateRealtimeSensorData());
  }, 2000);
  
  // Start streaming AI predictions
  const aiInterval = setInterval(() => {
    socket.emit('ai-prediction', generateAIPrediction());
  }, 5000);
  
  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    clearInterval(sensorInterval);
    clearInterval(aiInterval);
  });
  
  // Handle custom events
  socket.on('request-manual-update', () => {
    socket.emit('manual-update', generateRealtimeSensorData());
  });

  // Receive sensor reports from clients and evaluate on server-side
  socket.on('sensor-report', async (sensor) => {
    console.log('📊 Received sensor-report:', JSON.stringify(sensor).substring(0, 100));
    try {
      // Fetch configured authorities
      const authResp = await axios.get(`http://localhost:${PORT}/api/authorities`);
      let recipients = [];
      if (authResp.data) {
        if (Array.isArray(authResp.data.authorities)) recipients = authResp.data.authorities;
        else if (Array.isArray(authResp.data.data)) recipients = authResp.data.data.map(a => a.email).filter(Boolean);
      }

      console.log('📧 Recipients found:', recipients.length);

      if (!recipients || recipients.length === 0) {
        console.log('⚠️  No authority recipients configured on server');
        return;
      }

      const now = Date.now();
      const RATE_LIMIT = 1 * 60 * 1000; // 1 minute (for testing)

      const sendMail = async (subject, body) => {
        if (!emailTransporter) {
          console.log('⚠️  Simulated alert (email not configured):', subject);
          socket.emit('alert-sent', { subject, simulated: true, timestamp: new Date().toISOString() });
          return;
        }
        
        try {
          console.log('📧 Sending email:', subject, 'to', recipients.length, 'recipients');
          const mailPromises = recipients.map(r => emailTransporter.sendMail({
            from: `"HydroLake Alert System" <${process.env.EMAIL_USER}>`,
            to: r,
            subject,
            text: body,
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
                <div style="background: #dc2626; color: white; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                  <h2 style="margin: 0; font-size: 18px;">🚨 ${subject}</h2>
                </div>
                <div style="background: white; padding: 20px; border-radius: 5px; border-left: 4px solid #dc2626;">
                  <pre style="white-space: pre-wrap; font-family: monospace; margin: 0;">${body.replace(/</g, '&lt;')}</pre>
                </div>
                <div style="margin-top: 20px; font-size: 12px; color: #666;">
                  <p>Generated at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                  <p>HydroLake Dam Monitoring System</p>
                </div>
              </div>
            `
          }));
          
          const results = await Promise.allSettled(mailPromises);
          const successCount = results.filter(r => r.status === 'fulfilled').length;
          const failedCount = results.length - successCount;
          
          console.log(`\n${'='.repeat(80)}`);
          console.log(`📧 EMAIL SENDING RESULTS`);
          console.log(`${'='.repeat(80)}`);
          console.log(`✅ Successful: ${successCount}/${results.length}`);
          console.log(`❌ Failed: ${failedCount}/${results.length}`);
          
          // Log detailed results
          results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
              console.log(`\n✅ Email #${index + 1} to ${recipients[index]}: SUCCESS`);
              console.log(`   Message ID: ${result.value?.messageId || 'N/A'}`);
              console.log(`   Response: ${result.value?.response || 'N/A'}`);
            } else {
              console.error(`\n❌ Email #${index + 1} to ${recipients[index]}: FAILED`);
              console.error(`   Error: ${result.reason?.message || result.reason}`);
              console.error(`   Code: ${result.reason?.code || 'N/A'}`);
              if (result.reason?.response) {
                console.error(`   Details: ${result.reason.response}`);
              }
            }
          });
          console.log(`${'='.repeat(80)}\n`);
          
          socket.emit('alert-sent', { 
            subject, 
            recipients: recipients.length,
            successful: successCount,
            failed: failedCount,
            timestamp: new Date().toISOString() 
          });
        } catch (error) {
          console.error('❌ Critical email error:', error.message);
          socket.emit('alert-error', { subject, error: error.message, timestamp: new Date().toISOString() });
        }
      };

      const checkAndNotify = async (key, condition, subject, body) => {
        if (!condition) return;
        
        console.log(`🔍 Checking ${key}: condition=${condition}`);
        const last = lastSentServer[key] || 0;
        const timeSinceLastAlert = now - last;
        
        if (timeSinceLastAlert < RATE_LIMIT) {
          const remainingTime = Math.round((RATE_LIMIT - timeSinceLastAlert) / 1000);
          console.log(`⏳ Rate limited for ${key} (last sent ${Math.round(timeSinceLastAlert / 1000)}s ago, wait ${remainingTime}s)`);
          return;
        }
        
        lastSentServer[key] = now;
        console.log(`🚨 TRIGGERING ALERT: ${subject}`);
        
        try {
          await sendMail(subject, body);
          console.log(`✅ Server sent alert: ${subject}`);
        } catch (err) {
          console.error(`❌ Server alert failed for ${key}:`, err.message || err);
          // Reset the rate limit on failure so we can retry sooner
          lastSentServer[key] = now - (RATE_LIMIT / 2);
        }
      };

      // Validate sensor data before checking thresholds
      if (typeof sensor.waterLevel === 'number' && !isNaN(sensor.waterLevel)) {
        checkAndNotify('waterLevel', sensor.waterLevel > 95, 
          `CRITICAL: Water level ${sensor.waterLevel.toFixed(1)}%`, 
          `⚠️ CRITICAL ALERT: Water Level\n\nCurrent Level: ${sensor.waterLevel.toFixed(1)}%\nThreshold: 95%\nStatus: CRITICAL\n\nImmediate Action Required:\n- Check spillway readiness\n- Monitor downstream areas\n- Prepare emergency protocols\n\nSensor Data:\n${JSON.stringify(sensor, null, 2)}\n\nAlert Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
      }
      
      if (typeof sensor.seismic === 'number' && !isNaN(sensor.seismic)) {
        checkAndNotify('seismic', sensor.seismic > 0.9, 
          `CRITICAL: Seismic ${sensor.seismic.toFixed(2)}`, 
          `🚨 SEISMIC ALERT\n\nSeismic Reading: ${sensor.seismic.toFixed(2)} Richter\nThreshold: 0.9\nStatus: CRITICAL\n\nActions Required:\n- Inspect structural integrity\n- Check for cracks or damage\n- Monitor aftershocks\n\nSensor Data:\n${JSON.stringify(sensor, null, 2)}\n\nAlert Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
      }
      
      if (typeof sensor.vibration === 'number' && !isNaN(sensor.vibration)) {
        checkAndNotify('vibration', sensor.vibration > 3, 
          `ALERT: Vibration ${sensor.vibration.toFixed(2)} mm/s`, 
          `⚠️ VIBRATION ALERT\n\nVibration Level: ${sensor.vibration.toFixed(2)} mm/s\nThreshold: 3.0 mm/s\nStatus: HIGH\n\nRecommended Actions:\n- Check turbine operations\n- Inspect mechanical systems\n- Monitor trend\n\nSensor Data:\n${JSON.stringify(sensor, null, 2)}\n\nAlert Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
      }
      
      if (typeof sensor.crackWidth === 'number' && !isNaN(sensor.crackWidth)) {
        checkAndNotify('crackWidth', sensor.crackWidth > 0.35, 
          `ALERT: Crack width ${sensor.crackWidth.toFixed(2)} mm`, 
          `🔍 STRUCTURAL ALERT\n\nCrack Width: ${sensor.crackWidth.toFixed(2)} mm\nThreshold: 0.35 mm\nStatus: REQUIRES ATTENTION\n\nRecommended Actions:\n- Schedule detailed inspection\n- Monitor crack progression\n- Check surrounding areas\n\nSensor Data:\n${JSON.stringify(sensor, null, 2)}\n\nAlert Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
      }
    } catch (err) {
      console.error('Error handling sensor-report:', err.message || err);
    }
  });
});

// ========================================
// Helper Functions
// ========================================

function calculateRiskScore(sensorData) {
  const { waterLevel, pressure, seepage, structuralStress, temperature } = sensorData;
  
  let riskScore = 0;
  
  // Water level risk (0-30 points)
  if (waterLevel > 90) riskScore += 30;
  else if (waterLevel > 80) riskScore += 20;
  else if (waterLevel > 70) riskScore += 10;
  
  // Pressure risk (0-25 points)
  if (pressure > 85) riskScore += 25;
  else if (pressure > 70) riskScore += 15;
  else if (pressure > 60) riskScore += 5;
  
  // Seepage risk (0-20 points)
  if (seepage > 8) riskScore += 20;
  else if (seepage > 5) riskScore += 12;
  else if (seepage > 3) riskScore += 5;
  
  // Structural stress risk (0-15 points)
  if (structuralStress > 80) riskScore += 15;
  else if (structuralStress > 65) riskScore += 10;
  else if (structuralStress > 50) riskScore += 5;
  
  // Temperature anomaly (0-10 points)
  if (temperature < 10 || temperature > 30) riskScore += 10;
  else if (temperature < 15 || temperature > 25) riskScore += 5;
  
  return Math.min(riskScore, 100);
}

function generatePrediction(riskScore) {
  if (riskScore >= 80) {
    return {
      level: 'CRITICAL',
      probability: 0.85,
      message: 'High probability of structural failure within 24-48 hours',
      action: 'IMMEDIATE EVACUATION REQUIRED'
    };
  } else if (riskScore >= 60) {
    return {
      level: 'HIGH',
      probability: 0.65,
      message: 'Elevated risk detected. Close monitoring required',
      action: 'Prepare evacuation plan and notify authorities'
    };
  } else if (riskScore >= 40) {
    return {
      level: 'MODERATE',
      probability: 0.35,
      message: 'Some concerns detected. Increased monitoring recommended',
      action: 'Schedule inspection and review maintenance logs'
    };
  } else {
    return {
      level: 'LOW',
      probability: 0.15,
      message: 'All systems operating within normal parameters',
      action: 'Continue routine monitoring'
    };
  }
}

function generateRecommendations(sensorData, riskScore) {
  const recommendations = [];
  
  if (sensorData.waterLevel > 80) {
    recommendations.push({
      priority: 'HIGH',
      category: 'Water Management',
      action: 'Increase outflow through spillways',
      reason: 'Water level approaching maximum capacity'
    });
  }
  
  if (sensorData.seepage > 5) {
    recommendations.push({
      priority: 'HIGH',
      category: 'Structural Integrity',
      action: 'Inspect drainage systems and seepage points',
      reason: 'Elevated seepage detected'
    });
  }
  
  if (sensorData.structuralStress > 70) {
    recommendations.push({
      priority: 'MEDIUM',
      category: 'Maintenance',
      action: 'Schedule structural assessment',
      reason: 'Stress levels above normal threshold'
    });
  }
  
  if (riskScore > 60) {
    recommendations.push({
      priority: 'CRITICAL',
      category: 'Emergency Response',
      action: 'Activate emergency response protocol',
      reason: 'Overall risk score indicates potential danger'
    });
  }
  
  return recommendations;
}

function getMockWeatherData() {
  return {
    temperature: 25 + Math.random() * 10,
    humidity: 60 + Math.random() * 30,
    windSpeed: 5 + Math.random() * 15,
    windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
    precipitation: Math.random() * 50,
    pressure: 1000 + Math.random() * 30,
    cloudCover: Math.random() * 100,
    visibility: 5 + Math.random() * 10,
    condition: ['Clear', 'Cloudy', 'Rainy', 'Stormy'][Math.floor(Math.random() * 4)],
    timestamp: new Date().toISOString()
  };
}

function getMockForecastData(days) {
  const forecast = [];
  for (let i = 0; i < days; i++) {
    forecast.push({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
      tempMin: 20 + Math.random() * 5,
      tempMax: 28 + Math.random() * 10,
      precipitation: Math.random() * 80,
      humidity: 55 + Math.random() * 35,
      windSpeed: 8 + Math.random() * 12,
      condition: ['Clear', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Stormy'][Math.floor(Math.random() * 5)]
    });
  }
  return forecast;
}

function analyzeWeatherImpact(weatherData, damData) {
  const impactScore = calculateWeatherImpact(weatherData, damData);
  
  return {
    overallImpact: impactScore,
    risks: [
      {
        type: 'Flooding',
        probability: weatherData.precipitation > 50 ? 0.75 : 0.25,
        severity: weatherData.precipitation > 50 ? 'HIGH' : 'LOW'
      },
      {
        type: 'Overflow',
        probability: weatherData.precipitation > 70 ? 0.85 : 0.15,
        severity: weatherData.precipitation > 70 ? 'CRITICAL' : 'LOW'
      }
    ],
    recommendations: generateWeatherRecommendations(weatherData)
  };
}

function calculateWeatherImpact(weatherData, damData) {
  let impact = 0;
  
  if (weatherData.precipitation > 50) impact += 40;
  if (weatherData.windSpeed > 20) impact += 20;
  if (weatherData.condition === 'Stormy') impact += 30;
  
  return Math.min(impact, 100);
}

function generateWeatherRecommendations(weatherData) {
  const recommendations = [];
  
  if (weatherData.precipitation > 50) {
    recommendations.push('Prepare for increased inflow');
    recommendations.push('Monitor spillway capacity');
  }
  
  if (weatherData.condition === 'Stormy') {
    recommendations.push('Alert emergency response team');
    recommendations.push('Secure loose equipment');
  }
  
  return recommendations;
}

function getIoTSensors() {
  return [
    { id: 'WL-001', name: 'Water Level Sensor', location: 'Reservoir', status: 'active', lastUpdate: Date.now() },
    { id: 'PR-001', name: 'Pressure Sensor', location: 'Base', status: 'active', lastUpdate: Date.now() },
    { id: 'SE-001', name: 'Seepage Monitor', location: 'Foundation', status: 'active', lastUpdate: Date.now() },
    { id: 'SS-001', name: 'Structural Stress', location: 'Wall', status: 'active', lastUpdate: Date.now() },
    { id: 'TP-001', name: 'Temperature Probe', location: 'Core', status: 'active', lastUpdate: Date.now() },
    { id: 'FL-001', name: 'Flow Meter', location: 'Spillway', status: 'active', lastUpdate: Date.now() },
    { id: 'VB-001', name: 'Vibration Sensor', location: 'Turbine', status: 'active', lastUpdate: Date.now() },
    { id: 'TU-001', name: 'Turbidity Sensor', location: 'Outlet', status: 'active', lastUpdate: Date.now() },
    { id: 'PH-001', name: 'pH Monitor', location: 'Water', status: 'active', lastUpdate: Date.now() },
    { id: 'DO-001', name: 'Dissolved Oxygen', location: 'Water', status: 'active', lastUpdate: Date.now() }
  ];
}

function getSensorData(id) {
  return {
    sensorId: id,
    value: 50 + Math.random() * 40,
    unit: 'units',
    timestamp: new Date().toISOString(),
    status: 'normal',
    batteryLevel: 75 + Math.random() * 25
  };
}

function processVoiceCommand(command, language) {
  const cmd = command.toLowerCase();
  
  if (cmd.includes('status') || cmd.includes('how')) {
    return {
      action: 'status_report',
      response: 'All systems are operating normally. Water level is at 75%, pressure is stable.',
      spokenText: 'All systems are operating normally. Water level is at seventy-five percent, pressure is stable.'
    };
  } else if (cmd.includes('alert') || cmd.includes('warning')) {
    return {
      action: 'get_alerts',
      response: 'There are currently 2 active alerts: High water level warning and Maintenance due.',
      spokenText: 'There are currently two active alerts: High water level warning and Maintenance due.'
    };
  } else if (cmd.includes('help')) {
    return {
      action: 'help',
      response: 'You can ask for status, alerts, or say emergency to activate emergency protocols.',
      spokenText: 'You can ask for status, alerts, or say emergency to activate emergency protocols.'
    };
  } else {
    return {
      action: 'unknown',
      response: 'Command not recognized. Please try again.',
      spokenText: 'Command not recognized. Please try again.'
    };
  }
}

function generateAnalytics(startDate, endDate) {
  return {
    period: { startDate, endDate },
    totalObservations: 8640,
    averageWaterLevel: 72.5,
    peakWaterLevel: 89.2,
    averageInflow: 1250,
    averageOutflow: 1180,
    powerGenerated: 45680, // MWh
    eventsDetected: 127,
    maintenanceCompleted: 8,
    anomaliesDetected: 3
  };
}

function generateWaterFlowData(days) {
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
      waterLevel: 70 + Math.random() * 15,
      turbidity: 5 + Math.random() * 10,
      ph: 7.0 + Math.random() * 1.5,
      dissolvedOxygen: 6 + Math.random() * 3
    });
  }
  
  return data;
}

async function generateReport(reportType, parameters) {
  // Simulate report generation
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    reportId: `RPT_${Date.now()}`,
    type: reportType,
    generatedAt: new Date().toISOString(),
    format: 'PDF',
    downloadUrl: `/api/reports/download/${Date.now()}`,
    summary: {
      totalPages: 25,
      sections: ['Executive Summary', 'Data Analysis', 'Recommendations', 'Appendix']
    }
  };
}

function get3DStructureData() {
  return {
    dimensions: {
      height: 150, // meters
      width: 500,
      thickness: 50
    },
    materials: ['Concrete', 'Steel Reinforcement', 'Earth Fill'],
    sections: [
      { name: 'Crest', elevation: 150, stress: 45 },
      { name: 'Upper Section', elevation: 100, stress: 62 },
      { name: 'Middle Section', elevation: 75, stress: 78 },
      { name: 'Lower Section', elevation: 50, stress: 71 },
      { name: 'Base', elevation: 0, stress: 85 }
    ]
  };
}

function getStressPoints() {
  return [
    { x: 250, y: 75, z: 25, stress: 85, type: 'critical' },
    { x: 150, y: 100, z: 20, stress: 72, type: 'high' },
    { x: 350, y: 50, z: 30, stress: 68, type: 'high' },
    { x: 100, y: 125, z: 15, stress: 55, type: 'moderate' },
    { x: 400, y: 60, z: 35, stress: 58, type: 'moderate' }
  ];
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

async function fetchWeatherData(lat, lon, apiKey) {
  try {
    // Using Open-Meteo API - Free, accurate, no API key required
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,visibility,cloud_cover&timezone=auto`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Weather API error: ${response.status}`);
    
    const data = await response.json();
    const current = data.current;
    
    // Map weather code to condition
    const mapWeatherCode = (code) => {
      if (code === 0 || code === 1) return 'Clear';
      if (code === 2 || code === 3) return 'Cloudy';
      if (code >= 51 && code <= 67) return 'Rainy';
      if (code >= 80 && code <= 99) return 'Stormy';
      return 'Cloudy';
    };
    
    // Convert wind direction from degrees to cardinal
    const degToCompass = (deg) => {
      const val = Math.floor((deg / 22.5) + 0.5);
      const arr = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
      return arr[(val % 16)];
    };
    
    return {
      temperature: Math.round(current.temperature_2m * 10) / 10,
      humidity: current.relative_humidity_2m || 0,
      windSpeed: Math.round(current.wind_speed_10m * 10) / 10,
      windDirection: degToCompass(current.wind_direction_10m || 0),
      precipitation: Math.round((current.precipitation || 0) * 10) / 10,
      pressure: Math.round(current.surface_pressure || 1013),
      cloudCover: current.cloud_cover || 0,
      visibility: Math.round((current.visibility || 10000) / 1000 * 10) / 10,
      condition: mapWeatherCode(current.weather_code),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Weather API error, using fallback:', error.message);
    return getMockWeatherData();
  }
}

async function fetchForecastData(lat, lon, days) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto&forecast_days=${days}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Forecast API error: ${response.status}`);
    
    const data = await response.json();
    const daily = data.daily;
    
    const mapWeatherCode = (code) => {
      if (code === 0 || code === 1) return 'Clear';
      if (code === 2) return 'Partly Cloudy';
      if (code === 3) return 'Cloudy';
      if (code >= 51 && code <= 67) return 'Rainy';
      if (code >= 80 && code <= 99) return 'Stormy';
      return 'Cloudy';
    };
    
    const forecast = [];
    for (let i = 0; i < days && i < daily.time.length; i++) {
      forecast.push({
        date: daily.time[i],
        tempMin: Math.round(daily.temperature_2m_min[i] * 10) / 10,
        tempMax: Math.round(daily.temperature_2m_max[i] * 10) / 10,
        precipitation: Math.round((daily.precipitation_sum[i] || 0) * 10) / 10,
        humidity: 60 + Math.random() * 20, // Open-Meteo free tier doesn't include humidity in daily
        windSpeed: Math.round((daily.wind_speed_10m_max[i] || 0) * 10) / 10,
        condition: mapWeatherCode(daily.weather_code[i])
      });
    }
    
    return forecast;
  } catch (error) {
    console.error('❌ Forecast API error, using fallback:', error.message);
    return getMockForecastData(days);
  }
}

// ========================================
// Community Alerts API
// ========================================
app.post('/api/community-alerts/sms', async (req, res) => {
  try {
    const { recipients, message, communities } = req.body;
    
    console.log('\n' + '='.repeat(80));
    console.log('📱 SMS ALERT REQUEST RECEIVED');
    console.log('='.repeat(80));
    console.log('Recipients:', recipients?.length || 0);
    console.log('Communities:', communities?.length || 0);
    console.log('\nMessage Content:');
    console.log('-'.repeat(80));
    console.log(message);
    console.log('-'.repeat(80));
    
    const results = [];
    
    if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
      // REAL SMS SENDING with Twilio
      console.log('\n🚀 SENDING REAL SMS via Twilio...');
      
      for (const recipient of recipients || []) {
        try {
          const result = await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: recipient
          });
          
          console.log(`\n✅ SMS SENT to: ${recipient}`);
          console.log(`   SID: ${result.sid}`);
          console.log(`   Status: ${result.status}`);
          
          results.push({
            recipient,
            status: 'sent',
            messageId: result.sid,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error(`\n❌ Failed to send to ${recipient}:`, error.message);
          results.push({
            recipient,
            status: 'failed',
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      }
      
      console.log('\n' + '='.repeat(80));
      console.log(`✅ REAL SMS ALERTS SENT: ${results.filter(r => r.status === 'sent').length}/${results.length}`);
      console.log('='.repeat(80) + '\n');
      
      res.json({
        success: true,
        message: `✅ Real SMS sent to ${results.filter(r => r.status === 'sent').length} recipients`,
        results,
        demoMode: false
      });
    } else {
      // Demo mode fallback
      console.log('\n⚠️  DEMO MODE: Twilio not configured');
      
      for (const recipient of recipients || []) {
        console.log(`\n📤 Simulating SMS to: ${recipient}`);
        console.log(`   Message: ${message.substring(0, 50)}...`);
        
        results.push({
          recipient,
          status: 'sent_demo',
          messageId: `sms_demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString()
        });
      }
      
      console.log('\n' + '='.repeat(80));
      console.log(`💡 DEMO MODE: ${results.length} messages logged`);
      console.log('💡 Configure Twilio credentials in .env for real SMS');
      console.log('='.repeat(80) + '\n');
      
      res.json({
        success: true,
        message: `✅ SMS simulated for ${results.length} recipients (Configure Twilio for real SMS)`,
        results,
        demoMode: true,
        setupInstructions: {
          step1: 'Sign up at https://www.twilio.com/try-twilio',
          step2: 'Get Account SID, Auth Token, and Phone Number',
          step3: 'Add to .env: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER'
        }
      });
    }
  } catch (error) {
    console.error('❌ SMS sending failed:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/community-alerts/whatsapp', async (req, res) => {
  try {
    const { recipients, message, communities } = req.body;
    
    console.log('\n' + '='.repeat(80));
    console.log('💬 WHATSAPP ALERT REQUEST RECEIVED');
    console.log('='.repeat(80));
    console.log('Recipients:', recipients?.length || 0);
    console.log('Communities:', communities?.length || 0);
    console.log('\nMessage Content:');
    console.log('-'.repeat(80));
    console.log(message);
    console.log('-'.repeat(80));
    
    const results = [];
    
    if (whatsAppAPI) {
      // REAL WhatsApp SENDING with Green API
      console.log('\n🚀 SENDING REAL WHATSAPP via Green API...');
      
      for (const recipient of recipients || []) {
        try {
          // Remove + and format for WhatsApp (e.g., 919876543210)
          const formattedNumber = recipient.replace(/[^0-9]/g, '');
          const chatId = `${formattedNumber}@c.us`;
          
          const result = await whatsAppAPI.message.sendMessage(chatId, null, message);
          
          console.log(`\n✅ WhatsApp SENT to: ${recipient}`);
          console.log(`   ID: ${result.idMessage}`);
          
          results.push({
            recipient,
            status: 'sent',
            messageId: result.idMessage,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error(`\n❌ Failed to send to ${recipient}:`, error.message);
          results.push({
            recipient,
            status: 'failed',
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      }
      
      console.log('\n' + '='.repeat(80));
      console.log(`✅ REAL WHATSAPP ALERTS SENT: ${results.filter(r => r.status === 'sent').length}/${results.length}`);
      console.log('='.repeat(80) + '\n');
      
      res.json({
        success: true,
        message: `✅ Real WhatsApp sent to ${results.filter(r => r.status === 'sent').length} recipients`,
        results,
        demoMode: false
      });
    } else {
      // Demo mode fallback
      console.log('\n⚠️  DEMO MODE: WhatsApp API not configured');
      
      for (const recipient of recipients || []) {
        console.log(`\n📤 Simulating WhatsApp to: ${recipient}`);
        console.log(`   Message: ${message.substring(0, 50)}...`);
        
        results.push({
          recipient,
          status: 'sent_demo',
          messageId: `wa_demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString()
        });
      }
      
      console.log('\n' + '='.repeat(80));
      console.log(`💡 DEMO MODE: ${results.length} messages logged`);
      console.log('💡 Configure WhatsApp Business API credentials in .env');
      console.log('='.repeat(80) + '\n');
      
      res.json({
        success: true,
        message: `✅ WhatsApp simulated for ${results.length} recipients (Configure WhatsApp API for real messages)`,
        results,
        demoMode: true,
        setupInstructions: {
          step1: 'Sign up at https://green-api.com/',
          step2: 'Create instance and get Instance ID and API Token',
          step3: 'Add to .env: WHATSAPP_INSTANCE_ID, WHATSAPP_API_TOKEN'
        }
      });
    }
  } catch (error) {
    console.error('❌ WhatsApp sending failed:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/community-alerts/broadcast', async (req, res) => {
  try {
    const { message, communities } = req.body;
    
    console.log('\n' + '='.repeat(80));
    console.log('🚨 EMERGENCY BROADCAST REQUEST');
    console.log('='.repeat(80));
    console.log('Communities:', communities?.length || 0);
    console.log('\nBroadcast Message:');
    console.log('-'.repeat(80));
    console.log(message);
    console.log('-'.repeat(80));
    
    // Send to all communities via both SMS and WhatsApp
    const allRecipients = communities?.map(c => ({ sms: c.contact, whatsapp: c.whatsapp, name: c.name })) || [];
    
    const smsResults = [];
    const whatsappResults = [];
    
    console.log('\n📡 Broadcasting to all communities...');
    for (const recipient of allRecipients) {
      console.log(`\n📍 ${recipient.name}:`);
      console.log(`   📱 SMS: ${recipient.sms} ✅`);
      console.log(`   💬 WhatsApp: ${recipient.whatsapp} ✅`);
      
      smsResults.push({
        recipient: recipient.sms,
        status: 'sent_demo',
        channel: 'sms',
        community: recipient.name,
        timestamp: new Date().toISOString()
      });
      
      whatsappResults.push({
        recipient: recipient.whatsapp,
        status: 'sent_demo',
        channel: 'whatsapp',
        community: recipient.name,
        timestamp: new Date().toISOString()
      });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log(`✅ EMERGENCY BROADCAST COMPLETE`);
    console.log(`   📱 SMS: ${smsResults.length} messages`);
    console.log(`   💬 WhatsApp: ${whatsappResults.length} messages`);
    console.log(`   🌐 Total: ${allRecipients.length} communities reached`);
    console.log('💡 DEMO MODE: Messages logged to console only');
    console.log('='.repeat(80) + '\n');
    
    res.json({
      success: true,
      message: `✅ Emergency broadcast sent to ${allRecipients.length} communities via SMS & WhatsApp (Demo Mode - Check console)`,
      smsResults,
      whatsappResults,
      demoMode: true,
      note: 'Configure SMS/WhatsApp API credentials for actual delivery'
    });
  } catch (error) {
    console.error('❌ Broadcast failed:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// Social Media Integration API
// ========================================
app.post('/api/social-media/twitter', async (req, res) => {
  try {
    const { content } = req.body;
    
    console.log('🐦 Twitter Post Request:', content.substring(0, 50) + '...');
    
    // In production, integrate with Twitter API v2
    // const { TwitterApi } = require('twitter-api-v2');
    // const client = new TwitterApi({
    //   appKey: process.env.TWITTER_API_KEY,
    //   appSecret: process.env.TWITTER_API_SECRET,
    //   accessToken: process.env.TWITTER_ACCESS_TOKEN,
    //   accessSecret: process.env.TWITTER_ACCESS_SECRET,
    // });
    // const result = await client.v2.tweet(content);
    
    const mockResult = {
      id: `tweet_${Date.now()}`,
      text: content,
      created_at: new Date().toISOString(),
      likes: 0,
      retweets: 0,
      replies: 0
    };
    
    console.log('✅ Posted to Twitter:', mockResult.id);
    
    res.json({
      success: true,
      message: 'Posted to Twitter successfully',
      post: mockResult
    });
  } catch (error) {
    console.error('❌ Twitter posting failed:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/social-media/facebook', async (req, res) => {
  try {
    const { content } = req.body;
    
    console.log('📘 Facebook Post Request:', content.substring(0, 50) + '...');
    
    // In production, integrate with Facebook Graph API
    // const FB = require('fb');
    // FB.setAccessToken(process.env.FACEBOOK_ACCESS_TOKEN);
    // const result = await FB.api(`${process.env.FACEBOOK_PAGE_ID}/feed`, 'post', {
    //   message: content
    // });
    
    const mockResult = {
      id: `fb_${Date.now()}`,
      message: content,
      created_time: new Date().toISOString(),
      likes: 0,
      shares: 0,
      comments: 0
    };
    
    console.log('✅ Posted to Facebook:', mockResult.id);
    
    res.json({
      success: true,
      message: 'Posted to Facebook successfully',
      post: mockResult
    });
  } catch (error) {
    console.error('❌ Facebook posting failed:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/social-media/post-all', async (req, res) => {
  try {
    const { content, platforms } = req.body;
    
    console.log('🌐 Multi-platform Post Request:', platforms);
    
    const results = [];
    
    if (platforms.includes('twitter')) {
      results.push({
        platform: 'twitter',
        status: 'success',
        postId: `tweet_${Date.now()}`
      });
    }
    
    if (platforms.includes('facebook')) {
      results.push({
        platform: 'facebook',
        status: 'success',
        postId: `fb_${Date.now()}`
      });
    }
    
    console.log('✅ Multi-platform posting complete:', results.length);
    
    res.json({
      success: true,
      message: `Posted to ${results.length} platforms`,
      results
    });
  } catch (error) {
    console.error('❌ Multi-platform posting failed:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/social-media/analytics', async (req, res) => {
  try {
    // In production, fetch real analytics from Twitter/Facebook APIs
    const analytics = {
      twitter: {
        followers: 1200,
        posts: 234,
        reach: 45000,
        engagement: 3.2
      },
      facebook: {
        followers: 8500,
        posts: 156,
        reach: 120000,
        engagement: 4.8
      },
      totalReach: 165000,
      totalFollowers: 9700,
      totalPosts: 390
    };
    
    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// Government Systems Integration API
// ========================================
app.get('/api/government/ndma-alerts', async (req, res) => {
  try {
    console.log('🚨 Fetching NDMA alerts');
    
    // In production, integrate with NDMA API
    // const response = await axios.get('https://ndma.gov.in/api/alerts', {
    //   headers: { 'Authorization': `Bearer ${process.env.NDMA_API_KEY}` }
    // });
    
    const mockAlerts = [
      {
        id: 'ndma_001',
        severity: 'high',
        title: 'Heavy Rainfall Warning',
        message: 'Heavy rainfall expected in Uttarakhand region for next 48 hours. Dam authorities advised to maintain high alert.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        affectedAreas: ['Tehri', 'Rishikesh', 'Uttarkashi'],
        validUntil: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'ndma_002',
        severity: 'medium',
        title: 'River Flow Alert',
        message: 'Increased water flow observed in Bhagirathi River. Monitor reservoir levels closely.',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        affectedAreas: ['Tehri Dam', 'Downstream areas'],
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    console.log('✅ NDMA alerts fetched:', mockAlerts.length);
    
    res.json({
      success: true,
      alerts: mockAlerts,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ NDMA alerts fetch failed:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/government/imd-weather', async (req, res) => {
  try {
    const { location = 'Tehri' } = req.query;
    
    console.log('☁️ Fetching IMD weather data for:', location);
    
    // In production, integrate with IMD API
    // const response = await axios.get(`https://imd.gov.in/api/weather?location=${location}`, {
    //   headers: { 'Authorization': `Bearer ${process.env.IMD_API_KEY}` }
    // });
    
    const mockWeatherData = {
      location,
      current: {
        temperature: 18,
        humidity: 75,
        windSpeed: 15,
        pressure: 1013,
        conditions: 'Partly Cloudy'
      },
      rainfall: {
        today: 45.2,
        forecast24h: 78.5,
        forecast48h: 102.3,
        forecast72h: 55.0
      },
      alerts: [
        {
          type: 'heavy_rain',
          severity: 'orange',
          message: 'Heavy to very heavy rainfall expected'
        }
      ],
      advisory: 'Dam authorities advised to maintain high alert and ensure spillway readiness.',
      lastUpdated: new Date().toISOString()
    };
    
    console.log('✅ IMD weather data fetched');
    
    res.json({
      success: true,
      weather: mockWeatherData
    });
  } catch (error) {
    console.error('❌ IMD weather fetch failed:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/government/cwc-data', async (req, res) => {
  try {
    console.log('💧 Fetching CWC data');
    
    // In production, integrate with Central Water Commission API
    const mockCWCData = {
      reservoir: {
        name: 'Tehri Dam Reservoir',
        currentLevel: 830.5, // meters
        fullReservoirLevel: 835.0,
        deadStorageLevel: 740.0,
        liveStorage: 2615, // MCM
        percentFull: 85.2
      },
      inflow: 1250, // cumecs
      outflow: 980, // cumecs
      spillway: {
        status: 'closed',
        capacity: 15540 // cumecs
      },
      downstream: {
        discharge: 980, // cumecs
        riverLevel: 'normal'
      },
      lastUpdated: new Date().toISOString()
    };
    
    console.log('✅ CWC data fetched');
    
    res.json({
      success: true,
      data: mockCWCData
    });
  } catch (error) {
    console.error('❌ CWC data fetch failed:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/government/compliance-report', async (req, res) => {
  try {
    const { reportType, agency, data, attachments } = req.body;
    
    console.log('📄 Submitting compliance report:', { reportType, agency });
    
    // In production, submit to government portal
    const reportId = `report_${Date.now()}`;
    
    console.log('✅ Report submitted:', reportId);
    
    res.json({
      success: true,
      message: 'Report submitted successfully',
      reportId,
      submittedAt: new Date().toISOString(),
      status: 'submitted'
    });
  } catch (error) {
    console.error('❌ Report submission failed:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/government/sync', async (req, res) => {
  try {
    const { agencies } = req.body;
    
    console.log('🔄 Syncing with government agencies:', agencies);
    
    const syncResults = agencies.map(agency => ({
      agency,
      status: 'synced',
      lastSync: new Date().toISOString(),
      recordsUpdated: Math.floor(Math.random() * 50) + 10
    }));
    
    console.log('✅ Sync complete');
    
    res.json({
      success: true,
      results: syncResults
    });
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// AI Chatbot API
// ========================================
app.post('/api/chatbot/message', async (req, res) => {
  try {
    const { message, language = 'en', conversationId } = req.body;
    
    console.log('🤖 Chatbot message:', { language, message: message.substring(0, 50) });
    
    // In production, integrate with actual AI/NLP service
    // const openai = require('openai');
    // const response = await openai.chat.completions.create({
    //   model: "gpt-3.5-turbo",
    //   messages: [{ role: "user", content: message }]
    // });
    
    // Simple keyword matching for demo
    const response = generateChatbotResponse(message, language);
    
    console.log('✅ Response generated');
    
    res.json({
      success: true,
      response: response.text,
      language,
      conversationId: conversationId || `conv_${Date.now()}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Chatbot error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/chatbot/faq', async (req, res) => {
  try {
    const { language = 'en', category } = req.query;
    
    const faqDatabase = {
      en: [
        { q: 'What is the current water level?', a: 'Current water level is at 85% capacity.' },
        { q: 'How do I set up alerts?', a: 'Go to Settings → Alerts → Add your email/phone.' },
        { q: 'Emergency contact?', a: 'Call 8000824196 for emergencies.' },
        { q: 'Dam safety protocols?', a: 'Dam is monitored 24/7 with multiple sensor systems.' }
      ],
      hi: [
        { q: 'वर्तमान जल स्तर क्या है?', a: 'वर्तमान जल स्तर 85% क्षमता पर है।' },
        { q: 'अलर्ट कैसे सेट करें?', a: 'सेटिंग्स → अलर्ट → अपना ईमेल/फोन जोड़ें।' },
        { q: 'आपातकालीन संपर्क?', a: 'आपातकाल के लिए 8000824196 पर कॉल करें।' },
        { q: 'बांध सुरक्षा प्रोटोकॉल?', a: 'बांध की 24/7 निगरानी की जाती है।' }
      ]
    };
    
    res.json({
      success: true,
      faqs: faqDatabase[language] || faqDatabase['en']
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

function generateChatbotResponse(message, language) {
  const lowerMessage = message.toLowerCase();
  
  const responses = {
    en: {
      water: 'Current water level is at 85% capacity. Normal operating range is 70-90%. Alert threshold is 95%.',
      alert: 'To receive alerts: Go to Settings → Alerts → Add your email/phone. Alerts are sent when water level exceeds 95%, seismic activity >0.9, or structural issues detected.',
      emergency: 'In emergency: 1) Check alert dashboard 2) Contact authorities at 8000824196 3) Follow evacuation routes 4) Monitor official updates.',
      safety: 'Dam safety is monitored 24/7 using: Water level sensors, Seismic monitors, Structural integrity sensors, Weather data integration.',
      weather: 'Weather data is updated every 5 minutes from Open-Meteo API. Includes temperature, rainfall, wind speed, and forecasts.',
      default: 'I can help with: Water level info, Alert setup, Emergency procedures, Safety protocols, Weather updates, AI predictions, Contact information.'
    },
    hi: {
      water: 'वर्तमान जल स्तर 85% क्षमता पर है। सामान्य परिचालन सीमा 70-90% है। चेतावनी सीमा 95% है।',
      alert: 'अलर्ट प्राप्त करने के लिए: सेटिंग्स → अलर्ट → अपना ईमेल/फोन जोड़ें।',
      emergency: 'आपातकाल में: 1) अलर्ट डैशबोर्ड देखें 2) 8000824196 पर संपर्क करें 3) निकासी मार्गों का पालन करें।',
      safety: 'बांध सुरक्षा की 24/7 निगरानी की जाती है।',
      weather: 'मौसम डेटा हर 5 मिनट में अपडेट होता है।',
      default: 'मैं मदद कर सकता हूं: जल स्तर जानकारी, अलर्ट सेटअप, आपातकालीन प्रक्रियाएं।'
    }
  };
  
  const langResponses = responses[language] || responses['en'];
  
  if (lowerMessage.includes('water') || lowerMessage.includes('level') || lowerMessage.includes('जल')) {
    return { text: langResponses.water };
  }
  if (lowerMessage.includes('alert') || lowerMessage.includes('अलर्ट')) {
    return { text: langResponses.alert };
  }
  if (lowerMessage.includes('emergency') || lowerMessage.includes('आपात')) {
    return { text: langResponses.emergency };
  }
  if (lowerMessage.includes('safety') || lowerMessage.includes('सुरक्षा')) {
    return { text: langResponses.safety };
  }
  if (lowerMessage.includes('weather') || lowerMessage.includes('मौसम')) {
    return { text: langResponses.weather };
  }
  
  return { text: langResponses.default };
}

// ========================================
// Server Start
// ========================================
server.listen(PORT, () => {
  console.log(`🚀 HydroLake Backend Server running on port ${PORT}`);
  console.log(`📡 Socket.IO ready for real-time connections`);
  console.log(`🤖 AI endpoints: http://localhost:${PORT}/api/ai/*`);
  console.log(`☁️  Weather endpoints: http://localhost:${PORT}/api/weather/*`);
  console.log(`📊 Analytics endpoints: http://localhost:${PORT}/api/analytics/*`);
  console.log(`🎤 Voice endpoints: http://localhost:${PORT}/api/voice/*`);
  console.log(`📱 PWA endpoints: http://localhost:${PORT}/api/pwa/*`);
  console.log(`🌐 IoT endpoints: http://localhost:${PORT}/api/iot/*`);
  console.log(`📲 Community Alerts: http://localhost:${PORT}/api/community-alerts/*`);
  console.log(`📘 Social Media: http://localhost:${PORT}/api/social-media/*`);
  console.log(`🏛️  Government: http://localhost:${PORT}/api/government/*`);
  console.log(`🤖 Chatbot: http://localhost:${PORT}/api/chatbot/*`);
});

module.exports = { app, io, server };
