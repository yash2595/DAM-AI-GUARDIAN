/**
 * In-Memory Mock Database
 * Provides database functionality without requiring MongoDB installation
 */

// In-memory storage
const storage = {
  users: [
    {
      _id: 'user_admin',
      username: 'admin',
      email: 'admin@hydrolake.gov.in',
      password: '$2a$10$ZQYXqN.zF6lQD0rqJz.1wOmB5D3P3JY5cK8Xl6jQYxvMJE7wdZYl6', // admin123
      role: 'admin',
      phoneNumber: '8000824196',
      isActive: true,
      createdAt: new Date(),
      lastLogin: new Date()
    },
    {
      _id: 'user_operator',
      username: 'operator',
      email: 'operator@hydrolake.gov.in',
      password: '$2a$10$ZQYXqN.zF6lQD0rqJz.1wOmB5D3P3JY5cK8Xl6jQYxvMJE7wdZYl6', // operator123
      role: 'operator',
      phoneNumber: '9876543210',
      isActive: true,
      createdAt: new Date(),
      lastLogin: new Date()
    }
  ],
  communities: [
    {
      _id: 'comm_1',
      name: 'Village Tehri',
      distance: 5,
      population: 12000,
      contactPhone: '+917300389701',
      whatsappNumber: '+917300389701',
      coordinates: { latitude: 30.3753, longitude: 78.4804 },
      riskLevel: 'high',
      status: 'active',
      alertsSent: []
    },
    {
      _id: 'comm_2',
      name: 'Rishikesh Town',
      distance: 15,
      population: 85000,
      contactPhone: '+918000824196',
      whatsappNumber: '+918000824196',
      coordinates: { latitude: 30.0869, longitude: 78.2676 },
      riskLevel: 'medium',
      status: 'active',
      alertsSent: []
    }
  ],
  alerts: [],
  socialMediaPosts: [],
  complianceReports: [],
  chatConversations: [],
  sensorData: []
};

// Helper functions
const generateId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const find = (collection, query = {}) => {
  const items = storage[collection] || [];
  if (Object.keys(query).length === 0) return [...items];
  
  return items.filter(item => {
    return Object.keys(query).every(key => {
      if (key === '$or') {
        return query[key].some(orCondition => 
          Object.keys(orCondition).every(k => item[k] === orCondition[k])
        );
      }
      return item[key] === query[key];
    });
  });
};

const findOne = (collection, query) => {
  const results = find(collection, query);
  return results.length > 0 ? results[0] : null;
};

const findById = (collection, id) => {
  return findOne(collection, { _id: id });
};

const create = (collection, data) => {
  const item = {
    _id: data._id || generateId(collection.slice(0, 4)),
    ...data,
    createdAt: data.createdAt || new Date()
  };
  storage[collection].push(item);
  return item;
};

const updateOne = (collection, query, update) => {
  const items = storage[collection] || [];
  const index = items.findIndex(item => 
    Object.keys(query).every(key => item[key] === query[key])
  );
  
  if (index !== -1) {
    items[index] = { ...items[index], ...update, updatedAt: new Date() };
    return items[index];
  }
  return null;
};

const deleteOne = (collection, query) => {
  const items = storage[collection] || [];
  const index = items.findIndex(item => 
    Object.keys(query).every(key => item[key] === query[key])
  );
  
  if (index !== -1) {
    storage[collection].splice(index, 1);
    return true;
  }
  return false;
};

const countDocuments = (collection, query = {}) => {
  return find(collection, query).length;
};

// Mock database interface
const mockDB = {
  User: {
    find: (query) => Promise.resolve(find('users', query)),
    findOne: (query) => Promise.resolve(findOne('users', query)),
    findById: (id) => Promise.resolve(findById('users', id)),
    create: (data) => Promise.resolve(create('users', data)),
    countDocuments: (query) => Promise.resolve(countDocuments('users', query)),
  },
  
  Community: {
    find: (query) => Promise.resolve(find('communities', query)),
    findOne: (query) => Promise.resolve(findOne('communities', query)),
    findById: (id) => Promise.resolve(findById('communities', id)),
    create: (data) => Promise.resolve(create('communities', data)),
    updateOne: (query, update) => Promise.resolve(updateOne('communities', query, update)),
    deleteOne: (query) => Promise.resolve(deleteOne('communities', query)),
  },
  
  Alert: {
    find: (query) => Promise.resolve(find('alerts', query)),
    findOne: (query) => Promise.resolve(findOne('alerts', query)),
    findById: (id) => Promise.resolve(findById('alerts', id)),
    create: (data) => Promise.resolve(create('alerts', data)),
    countDocuments: (query) => Promise.resolve(countDocuments('alerts', query)),
  },
  
  SocialMediaPost: {
    find: (query) => Promise.resolve(find('socialMediaPosts', query)),
    findOne: (query) => Promise.resolve(findOne('socialMediaPosts', query)),
    create: (data) => Promise.resolve(create('socialMediaPosts', data)),
  },
  
  ComplianceReport: {
    find: (query) => Promise.resolve(find('complianceReports', query)),
    findOne: (query) => Promise.resolve(findOne('complianceReports', query)),
    findById: (id) => Promise.resolve(findById('complianceReports', id)),
    create: (data) => Promise.resolve(create('complianceReports', data)),
  },
  
  ChatConversation: {
    find: (query) => Promise.resolve(find('chatConversations', query)),
    findOne: (query) => Promise.resolve(findOne('chatConversations', query)),
    findById: (id) => Promise.resolve(findById('chatConversations', id)),
    create: (data) => Promise.resolve(create('chatConversations', data)),
    findByIdAndDelete: (id) => Promise.resolve(deleteOne('chatConversations', { _id: id })),
    countDocuments: (query) => Promise.resolve(countDocuments('chatConversations', query)),
    aggregate: (pipeline) => Promise.resolve([{ _id: null, total: storage.chatConversations.length }]),
  },
  
  SensorData: {
    find: (query) => Promise.resolve(find('sensorData', query)),
    findOne: (query) => Promise.resolve(findOne('sensorData', query)),
    create: (data) => Promise.resolve(create('sensorData', data)),
  },
};

// Initialize mock data
console.log('📦 Mock Database initialized with in-memory storage');
console.log(`👥 Users: ${storage.users.length}`);
console.log(`🏘️  Communities: ${storage.communities.length}`);

module.exports = mockDB;
