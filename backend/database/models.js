/**
 * Database Model Loader
 * Automatically uses MongoDB models or mock database based on configuration
 */

const useMockDB = process.env.USE_MOCK_DATABASE === 'true';

let User, Community, Alert, SocialMediaPost, ComplianceReport, ChatConversation, SensorData;

if (useMockDB) {
  // Use mock database
  const mockDB = require('../database/mockDatabase');
  User = mockDB.User;
  Community = mockDB.Community;
  Alert = mockDB.Alert;
  SocialMediaPost = mockDB.SocialMediaPost;
  ComplianceReport = mockDB.ComplianceReport;
  ChatConversation = mockDB.ChatConversation;
  SensorData = mockDB.SensorData;
  
  console.log('📦 Using mock database models');
} else {
  // Use MongoDB models
  User = require('../models/User');
  Community = require('../models/Community');
  Alert = require('../models/Alert');
  SocialMediaPost = require('../models/SocialMediaPost');
  ComplianceReport = require('../models/ComplianceReport');
  ChatConversation = require('../models/ChatConversation');
  SensorData = require('../models/SensorData');
  
  console.log('📊 Using MongoDB models');
}

module.exports = {
  User,
  Community,
  Alert,
  SocialMediaPost,
  ComplianceReport,
  ChatConversation,
  SensorData,
  useMockDB
};
