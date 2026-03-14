/**
 * In-Memory Mock Database
 * Provides database functionality without requiring MongoDB installation
 */

const bcrypt = require('bcryptjs');

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
  authorities: [
    { _id: 'auth_1', name: 'Dam Safety Officer', email: 'admin@hydrolake.gov.in', role: 'Primary', isActive: true, createdAt: new Date() },
    { _id: 'auth_2', name: 'District Collector', email: 'collector@gov.in', role: 'Secondary', isActive: true, createdAt: new Date() }
  ],
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

const attachDocumentMethods = (collection, doc) => {
  if (!doc || typeof doc !== 'object') return doc;

  const wrapped = { ...doc };

  wrapped.save = async function save() {
    const items = storage[collection] || [];
    const index = items.findIndex((item) => item._id === this._id);

    if (index !== -1) {
      const { save: _save, comparePassword: _comparePassword, ...persistable } = this;
      items[index] = { ...items[index], ...persistable, updatedAt: new Date() };
      return attachDocumentMethods(collection, items[index]);
    }

    const created = create(collection, this);
    return attachDocumentMethods(collection, created);
  };

  wrapped.comparePassword = async function comparePassword(candidatePassword) {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
  };

  return wrapped;
};

const createQuery = (collection, initialItems, options = {}) => {
  const single = options.single === true;
  let items = Array.isArray(initialItems) ? initialItems.map((item) => attachDocumentMethods(collection, item)) : [];

  const query = {
    sort(sortObj = {}) {
      const entries = Object.entries(sortObj);
      if (entries.length === 0) return query;

      const [field, directionRaw] = entries[0];
      const direction = directionRaw >= 0 ? 1 : -1;

      items = [...items].sort((a, b) => {
        const av = a?.[field];
        const bv = b?.[field];
        if (av === bv) return 0;
        if (av === undefined || av === null) return 1;
        if (bv === undefined || bv === null) return -1;
        return av > bv ? direction : -direction;
      });

      return query;
    },

    limit(limitValue) {
      const n = Number(limitValue);
      if (!Number.isNaN(n) && n >= 0) {
        items = items.slice(0, n);
      }
      return query;
    },

    select(fields = '') {
      if (!fields || typeof fields !== 'string') return query;

      const selectors = fields.split(/\s+/).filter(Boolean);

      selectors.forEach((selector) => {
        if (selector.startsWith('-')) {
          const key = selector.slice(1);
          items = items.map((item) => {
            const copy = { ...item };
            delete copy[key];
            return attachDocumentMethods(collection, copy);
          });
        }
      });

      return query;
    },

    populate() {
      return query;
    },

    exec() {
      return Promise.resolve(single ? (items[0] || null) : items);
    },

    then(onFulfilled, onRejected) {
      return query.exec().then(onFulfilled, onRejected);
    },

    catch(onRejected) {
      return query.exec().catch(onRejected);
    },

    finally(onFinally) {
      return query.exec().finally(onFinally);
    }
  };

  return query;
};

// Mock database interface
const mockDB = {
  User: {
    find: (query = {}) => createQuery('users', find('users', query)),
    findOne: (query = {}) => createQuery('users', [findOne('users', query)].filter(Boolean), { single: true }),
    findById: (id) => createQuery('users', [findById('users', id)].filter(Boolean), { single: true }),
    create: (data) => Promise.resolve(attachDocumentMethods('users', create('users', data))),
    countDocuments: (query) => Promise.resolve(countDocuments('users', query)),
  },
  
  Community: {
    find: (query = {}) => createQuery('communities', find('communities', query)),
    findOne: (query = {}) => createQuery('communities', [findOne('communities', query)].filter(Boolean), { single: true }),
    findById: (id) => createQuery('communities', [findById('communities', id)].filter(Boolean), { single: true }),
    create: (data) => Promise.resolve(attachDocumentMethods('communities', create('communities', data))),
    updateOne: (query, update) => Promise.resolve(updateOne('communities', query, update)),
    updateMany: (query, update) => {
      const matched = find('communities', query);
      let modifiedCount = 0;

      matched.forEach((community) => {
        const updatePayload = { ...update };
        if (update?.$push?.alertsSent) {
          const alertsSent = Array.isArray(community.alertsSent) ? [...community.alertsSent] : [];
          alertsSent.push(update.$push.alertsSent);
          updatePayload.alertsSent = alertsSent;
          delete updatePayload.$push;
        }

        const updated = updateOne('communities', { _id: community._id }, updatePayload);
        if (updated) modifiedCount += 1;
      });

      return Promise.resolve({ acknowledged: true, matchedCount: matched.length, modifiedCount });
    },
    findByIdAndUpdate: (id, update) => Promise.resolve(attachDocumentMethods('communities', updateOne('communities', { _id: id }, update))),
    deleteOne: (query) => Promise.resolve(deleteOne('communities', query)),
  },
  
  Alert: {
    find: (query = {}) => createQuery('alerts', find('alerts', query)),
    findOne: (query = {}) => createQuery('alerts', [findOne('alerts', query)].filter(Boolean), { single: true }),
    findById: (id) => createQuery('alerts', [findById('alerts', id)].filter(Boolean), { single: true }),
    create: (data) => Promise.resolve(attachDocumentMethods('alerts', create('alerts', data))),
    countDocuments: (query) => Promise.resolve(countDocuments('alerts', query)),
  },
  
  SocialMediaPost: {
    find: (query = {}) => createQuery('socialMediaPosts', find('socialMediaPosts', query)),
    findOne: (query = {}) => createQuery('socialMediaPosts', [findOne('socialMediaPosts', query)].filter(Boolean), { single: true }),
    create: (data) => Promise.resolve(attachDocumentMethods('socialMediaPosts', create('socialMediaPosts', data))),
  },
  
  ComplianceReport: {
    find: (query = {}) => createQuery('complianceReports', find('complianceReports', query)),
    findOne: (query = {}) => createQuery('complianceReports', [findOne('complianceReports', query)].filter(Boolean), { single: true }),
    findById: (id) => createQuery('complianceReports', [findById('complianceReports', id)].filter(Boolean), { single: true }),
    create: (data) => Promise.resolve(attachDocumentMethods('complianceReports', create('complianceReports', data))),
  },
  
  ChatConversation: {
    find: (query = {}) => createQuery('chatConversations', find('chatConversations', query)),
    findOne: (query = {}) => createQuery('chatConversations', [findOne('chatConversations', query)].filter(Boolean), { single: true }),
    findById: (id) => createQuery('chatConversations', [findById('chatConversations', id)].filter(Boolean), { single: true }),
    create: (data) => Promise.resolve(attachDocumentMethods('chatConversations', create('chatConversations', data))),
    findByIdAndDelete: (id) => Promise.resolve(deleteOne('chatConversations', { _id: id })),
    countDocuments: (query) => Promise.resolve(countDocuments('chatConversations', query)),
    aggregate: (pipeline) => Promise.resolve([{ _id: null, total: storage.chatConversations.length }]),
  },
  
  SensorData: {
    find: (query = {}) => createQuery('sensorData', find('sensorData', query)),
    findOne: (query = {}) => createQuery('sensorData', [findOne('sensorData', query)].filter(Boolean), { single: true }),
    create: (data) => Promise.resolve(attachDocumentMethods('sensorData', create('sensorData', data))),
  },

  Authority: {
    find: (query = {}) => createQuery('authorities', find('authorities', query)),
    findOne: (query = {}) => createQuery('authorities', [findOne('authorities', query)].filter(Boolean), { single: true }),
    findById: (id) => createQuery('authorities', [findById('authorities', id)].filter(Boolean), { single: true }),
    create: (data) => Promise.resolve(attachDocumentMethods('authorities', create('authorities', data))),
    findOneAndDelete: (query) => { const item = findOne('authorities', query); if (item) deleteOne('authorities', query); return Promise.resolve(item); },
    findByIdAndDelete: (id) => { const item = findById('authorities', id); if (item) deleteOne('authorities', { _id: id }); return Promise.resolve(item); },
  },
};

// Initialize mock data
console.log('📦 Mock Database initialized with in-memory storage');
console.log(`👥 Users: ${storage.users.length}`);
console.log(`🏘️  Communities: ${storage.communities.length}`);

module.exports = mockDB;
