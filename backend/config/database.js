const mongoose = require('mongoose');

const connectDB = async () => {
  // Check if we should use mock database
  if (process.env.USE_MOCK_DATABASE === 'true') {
    console.log('📦 Using in-memory mock database (MongoDB not required)');
    return;
  }
  
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hydrolake';
    
    await mongoose.connect(MONGODB_URI);
    
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.log('⚠️ Switching to in-memory mock database');
    process.env.USE_MOCK_DATABASE = 'true';
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB Disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB Error:', err.message);
});

module.exports = connectDB;