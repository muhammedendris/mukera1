const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token and authenticate user
exports.isAuthenticated = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token found. Please login.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Please login again.'
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please login again.',
      error: error.message
    });
  }
};

// Check if user has specific role
exports.isRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This resource is only accessible to: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Check if user is verified
exports.isVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Your account is pending verification. Please wait for approval.'
    });
  }

  next();
};

// Check if user is admin
exports.isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'company-admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// Check if user is dean
exports.isDean = (req, res, next) => {
  if (!req.user || req.user.role !== 'dean') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Dean privileges required.'
    });
  }
  next();
};

// Check if user is advisor
exports.isAdvisor = (req, res, next) => {
  if (!req.user || req.user.role !== 'advisor') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Advisor privileges required.'
    });
  }
  next();
};

// Check if user is student
exports.isStudent = (req, res, next) => {
  if (!req.user || req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Student privileges required.'
    });
  }
  next();
};
