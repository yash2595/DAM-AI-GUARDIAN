// Vercel Serverless Function - Sensor Data
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // Mock sensor data
    const sensorData = {
      waterLevel: 45.2,
      pressure: 1013.25,
      temperature: 22.5,
      flow: 120.5,
      turbidity: 5.2,
      pH: 7.4,
      timestamp: new Date().toISOString(),
      status: 'normal'
    };

    res.status(200).json({
      success: true,
      data: sensorData
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
