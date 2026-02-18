// Vercel Serverless Function - Alerts
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
    // Mock alerts data
    const alerts = [
      {
        id: 1,
        type: 'warning',
        title: 'Water Level Rising',
        message: 'Water level has increased by 5% in the last hour',
        severity: 'medium',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        acknowledged: false
      },
      {
        id: 2,
        type: 'info',
        title: 'Scheduled Maintenance',
        message: 'System maintenance scheduled for tomorrow',
        severity: 'low',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        acknowledged: true
      }
    ];

    res.status(200).json({
      success: true,
      data: alerts
    });
  } else if (req.method === 'POST') {
    // Handle alert creation
    res.status(201).json({
      success: true,
      message: 'Alert created successfully'
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
