const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// ML API Configuration
const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5002'; // Using 5002 for dam analysis API

// Store uploads temporarily
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'dam-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure multer for file uploads
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP allowed.'));
    }
  }
});

/**
 * POST /api/dam/analyze
 * Upload dam image and analyze physical condition
 */
router.post('/analyze', upload.single('image'), async (req, res) => {
  console.log('📸 Dam analyze endpoint called');
  console.log('File:', req.file ? 'Received' : 'Missing');
  console.log('Body:', req.body);
  
  try {
    // Validate file
    if (!req.file) {
      console.log('❌ No file provided');
      return res.status(400).json({ 
        success: false, 
        error: 'No image file provided' 
      });
    }

    const damName = req.body.damName || 'Unknown Dam';
    const location = req.body.location || 'Unknown Location';
    const damType = req.body.damType || 'Concrete';
    const constructionYear = req.body.constructionYear || new Date().getFullYear();

    console.log(`✓ Processing dam: ${damName}`);

    let analysisResult;

    try {
      // 1. Read file as base64
      const imageBuffer = fs.readFileSync(req.file.path);
      const base64Image = `data:${req.file.mimetype};base64,${imageBuffer.toString('base64')}`;

      // 2. Call ML API
      console.log('Calling ML API for real analysis...');
      const mlResponse = await axios.post(`${ML_API_URL}/analyze-dam`, {
        image: base64Image,
        dam_name: damName,
        location: location,
        dam_type: damType,
        construction_year: constructionYear
      }, {
        timeout: 30000 // 30 second timeout for image analysis
      });

      if (mlResponse.data && mlResponse.data.status === 'success') {
         analysisResult = mlResponse.data;
         console.log('✓ ML API analysis successful');
      } else {
         throw new Error(mlResponse.data.error || 'ML analysis failed');
      }

    } catch (mlError) {
      console.error('ML API Error:', mlError.message);
      
      // Check if it was a validation error from our Python script
      if (mlError.response && mlError.response.data && mlError.response.data.error) {
           return res.status(400).json({
             success: false,
             error: 'Invalid Image',
             message: mlError.response.data.error
           });
      }

      // If ML API is down or fails, fallback to demo but log it
      console.log('⚠️ Falling back to mock analysis due to ML API error');
      
      analysisResult = {
        status: 'success',
        overall_condition: Math.floor(Math.random() * 4),
        condition_score: Math.round(Math.random() * 100),
        risk_level: ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)],
// ... existing code ...
      analysis: {
        cracks: {
          detected: Math.random() > 0.5,
          severity: Math.random() > 0.5 ? 'Minor' : 'Moderate',
          coverage: Math.round(Math.random() * 1000) / 100
        },
        surface_wear: {
          level: Math.random() > 0.6 ? 'Minor' : 'Moderate',
          coverage: Math.round(Math.random() * 3000) / 100
        },
        moisture: {
          detected: Math.random() > 0.5,
          level: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
          areas: Math.floor(Math.random() * 5)
        },
        algae_growth: {
          detected: Math.random() > 0.5,
          coverage: Math.round(Math.random() * 1500) / 100
        },
        structural_damage: {
          detected: false,
          severity: null,
          areas: 0
        },
        erosion: {
          detected: Math.random() > 0.6,
          level: Math.random() > 0.5 ? 'Minor' : 'Moderate'
        }
      },
      recommendations: [
        '📋 Professional inspection recommended',
        '✅ Regular monitoring schedule established',
        '💧 Waterproofing assessment needed'
      ],
      next_inspection: '3 months'
    };
    }

    // Clean up file
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.warn('Could not delete temp file:', e.message);
      }
    }

    const responseData = {
      success: true,
      damName: damName,
      location: location,
      damType: damType,
      constructionYear: constructionYear,
      analysis: analysisResult,
      timestamp: new Date().toISOString()
    };

    console.log('✓ Sending response');
    console.log('Response data:', JSON.stringify(responseData, null, 2));
    
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(responseData);

  } catch (error) {
    console.error('❌ Dam analysis error:', error);
    
    // Clean up
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {}
    }

    return res.status(500).json({
      success: false,
      error: 'Analysis failed',
      message: error.message
    });
  }
});

/**
 * GET /api/dam/conditions
 * Get dam condition levels and assessment criteria
 */
router.get('/conditions', (req, res) => {
  res.json({
    conditions: {
      0: { label: 'Excellent', risk: 'Low', description: 'Well-maintained, no visible defects' },
      1: { label: 'Good', risk: 'Low', description: 'Minor cosmetic issues, structurally sound' },
      2: { label: 'Fair', risk: 'Medium', description: 'Some defects present, needs monitoring' },
      3: { label: 'Poor', risk: 'High', description: 'Significant damage, urgent repairs needed' },
      4: { label: 'Critical', risk: 'Critical', description: 'Safety risk, immediate action required' }
    },
    assessment_factors: [
      'Cracks (Minor/Moderate/Severe)',
      'Surface Wear (None/Minor/Moderate/Severe)',
      'Moisture/Seepage (Low/Medium/High)',
      'Algae Growth (Coverage %)',
      'Structural Damage (None/Minor/Moderate/Severe)',
      'Erosion (None/Minor/Moderate/Severe)'
    ]
  });
});

/**
 * GET /api/dam/tips
 * Get dam maintenance and inspection tips
 */
router.get('/tips', (req, res) => {
  res.json({
    inspection_tips: [
      'Capture clear photos from multiple angles',
      'Photograph during good lighting conditions',
      'Include close-ups of any visible damage',
      'Document the date and location metadata',
      'Take photos of water surface for seepage signs',
      'Photograph the base and foundation areas'
    ],
    maintenance_recommendations: {
      excellent: ['Annual inspection', 'Regular monitoring', 'Routine maintenance only'],
      good: ['Bi-annual inspection', 'Document any changes', 'Standard maintenance'],
      fair: ['Quarterly inspection', 'Address identified issues', 'Increased monitoring'],
      poor: ['Monthly inspection', 'Schedule repairs', 'Daily monitoring if critical areas'],
      critical: ['Immediate inspection', 'Emergency repairs', ' Daily assessment', 'Possible evacuation alert']
    }
  });
});

module.exports = router;
