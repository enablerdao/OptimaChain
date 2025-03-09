const express = require('express');
const router = express.Router();
const {
  getTransactions,
  getTransactionById,
  getTransactionByHash,
  createSwapTransaction,
} = require('../controllers/transactionController');
const { protect, mockProtect } = require('../middleware/authMiddleware');

// Public routes
router.get('/hash/:hash', getTransactionByHash);

// Protected routes
router.route('/')
  .get(mockProtect, getTransactions); // Use mockProtect for development

router.route('/:id')
  .get(mockProtect, getTransactionById);

router.route('/swap')
  .post(mockProtect, createSwapTransaction);

module.exports = router;