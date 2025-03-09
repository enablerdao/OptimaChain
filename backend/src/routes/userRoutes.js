const express = require('express');
const router = express.Router();
const {
  loginUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
} = require('../controllers/userController');
const { protect, admin, mockProtect } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', loginUser);
router.post('/register', registerUser);

// Protected routes
router.route('/profile')
  .get(mockProtect, getUserProfile) // Use mockProtect for development
  .put(mockProtect, updateUserProfile);

// Admin routes
router.route('/')
  .get(mockProtect, admin, getUsers);

module.exports = router;