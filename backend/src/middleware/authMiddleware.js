const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Protect routes - middleware to check if user is authenticated
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id);

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Admin middleware - check if user is admin
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

// For development purposes, we'll create a mock authentication middleware
// This will bypass actual authentication for testing
const mockProtect = async (req, res, next) => {
  // Set a mock user
  req.user = {
    _id: 'user1',
    username: 'testuser',
    email: 'test@example.com',
    isAdmin: false,
  };
  
  next();
};

module.exports = { 
  protect, 
  admin,
  mockProtect // Use this for development
};