// Vercel Serverless Function - Weather Data
const axios = require('axios');

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      // Mock weather data (replace with actual API call)
      const weatherData = {
        temperature: 28.5,
        humidity: 65,
        rainfall: 5.2,
        windSpeed: 12.5,
        pressure: 1013.25,
        condition: 'partly cloudy',
        forecast: [
          { day: 'Today', temp: 28, rain: 10, condition: 'sunny' },
          { day: 'Tomorrow', temp: 26, rain: 40, condition: 'rainy' },
          { day: 'Day 3', temp: 27, rain: 20, condition: 'cloudy' }
        ],
        timestamp: new Date().toISOString()
      };

      res.status(200).json({
        success: true,
        data: weatherData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch weather data'
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
