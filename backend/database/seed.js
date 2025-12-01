require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../models/User');
const Community = require('../models/Community');
const Alert = require('../models/Alert');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hydrolake');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedUsers = async () => {
  const users = [
    {
      username: 'admin',
      email: 'admin@hydrolake.gov.in',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin',
      phoneNumber: '+91-7300389702',
      department: 'Operations',
      isActive: true
    },
    {
      username: 'operator1',
      email: 'operator@hydrolake.gov.in',
      password: await bcrypt.hash('operator123', 10),
      role: 'operator',
      phoneNumber: '+91-9876543210',
      department: 'Monitoring',
      isActive: true
    },
    {
      username: 'viewer1',
      email: 'viewer@hydrolake.gov.in',
      password: await bcrypt.hash('viewer123', 10),
      role: 'viewer',
      phoneNumber: '+91-9876543211',
      department: 'Analytics',
      isActive: true
    }
  ];

  await User.deleteMany({});
  await User.insertMany(users);
  console.log('✅ Users seeded');
};

const seedCommunities = async () => {
  const communities = [
    {
      name: 'Tehri Town',
      distance: 2.5,
      population: 15000,
      contactPerson: 'Ram Kumar',
      contactPhone: '+91-9876543210',
      whatsappNumber: '+91-9876543210',
      email: 'sarpanch.tehritown@gov.in',
      coordinates: {
        latitude: 30.3783,
        longitude: 78.4806
      },
      status: 'safe',
      riskLevel: 'low'
    },
    {
      name: 'New Tehri',
      distance: 5.0,
      population: 25000,
      contactPerson: 'Sunita Devi',
      contactPhone: '+91-9876543211',
      whatsappNumber: '+91-9876543211',
      email: 'sarpanch.newtehri@gov.in',
      coordinates: {
        latitude: 30.3900,
        longitude: 78.4900
      },
      status: 'safe',
      riskLevel: 'low'
    },
    {
      name: 'Rishikesh',
      distance: 15.0,
      population: 100000,
      contactPerson: 'Vijay Singh',
      contactPhone: '+91-9876543212',
      whatsappNumber: '+91-9876543212',
      email: 'sarpanch.rishikesh@gov.in',
      coordinates: {
        latitude: 30.0869,
        longitude: 78.2676
      },
      status: 'alert',
      riskLevel: 'medium'
    },
    {
      name: 'Devprayag',
      distance: 8.0,
      population: 8000,
      contactPerson: 'Prakash Rawat',
      contactPhone: '+91-9876543213',
      whatsappNumber: '+91-9876543213',
      email: 'sarpanch.devprayag@gov.in',
      coordinates: {
        latitude: 30.1463,
        longitude: 78.5977
      },
      status: 'safe',
      riskLevel: 'low'
    }
  ];

  await Community.deleteMany({});
  await Community.insertMany(communities);
  console.log('✅ Communities seeded');
};

const seedAlerts = async () => {
  const alerts = [
    {
      type: 'water_level',
      severity: 'medium',
      title: 'Water Level Rising',
      message: 'Water level has increased to 87% due to recent rainfall. Monitoring closely.',
      damId: 'TEHRI_DAM_001',
      sensorData: {
        waterLevel: 87,
        timestamp: new Date()
      },
      status: 'active'
    },
    {
      type: 'weather',
      severity: 'high',
      title: 'Heavy Rainfall Expected',
      message: 'IMD predicts heavy rainfall in next 48 hours. Dam authorities on high alert.',
      damId: 'TEHRI_DAM_001',
      status: 'active'
    }
  ];

  await Alert.deleteMany({});
  await Alert.insertMany(alerts);
  console.log('✅ Alerts seeded');
};

const seedAll = async () => {
  try {
    await connectDB();
    
    console.log('🌱 Starting database seeding...');
    
    await seedUsers();
    await seedCommunities();
    await seedAlerts();
    
    console.log('✅ Database seeding completed successfully!');
    console.log('\n📝 Default Credentials:');
    console.log('   Admin: admin@hydrolake.gov.in / admin123');
    console.log('   Operator: operator@hydrolake.gov.in / operator123');
    console.log('   Viewer: viewer@hydrolake.gov.in / viewer123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedAll();
