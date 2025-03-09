const express = require('express');
const router = express.Router();
const {
  getTokens,
  getTokenById,
  getTokenBySymbol,
  createToken,
  updateToken,
} = require('../controllers/tokenController');
const { protect, admin, mockProtect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getTokens);
router.get('/:id', getTokenById);
router.get('/symbol/:symbol', getTokenBySymbol);

// Admin routes
router.route('/')
  .post(mockProtect, admin, createToken); // Use mockProtect for development

router.route('/:id')
  .put(mockProtect, admin, updateToken);

module.exports = router;