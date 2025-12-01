const jwt = require('jsonwebtoken');
const { User } = require('../database/models');

/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user to request
 */

// Standard auth middleware - requires valid token
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hydrolake-secret-key-2024');
    
    // Get user from database
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token. User not found.' 
      });
    }
    
    if (!user.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'Account is deactivated.' 
      });
    }
    
    // Attach user to request
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      username: user.username
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token.' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired.' 
      });
    }
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication failed.' 
    });
  }
};

// Optional auth middleware - doesn't require token but attaches user if present
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hydrolake-secret-key-2024');
      const user = await User.findById(decoded.id);
      
      if (user && user.isActive) {
        req.user = {
          id: user._id,
          email: user.email,
          role: user.role,
          username: user.username
        };
      }
    }
    next();
  } catch (error) {
    // If token is invalid, just continue without user
    next();
  }
};

// Admin middleware - requires admin role
const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required.' 
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admin privileges required.' 
    });
  }
  
  next();
};

// Operator or admin middleware
const operatorMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required.' 
    });
  }
  
  if (req.user.role !== 'admin' && req.user.role !== 'operator') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Operator privileges required.' 
    });
  }
  
  next();
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  adminMiddleware,
  operatorMiddleware
};
