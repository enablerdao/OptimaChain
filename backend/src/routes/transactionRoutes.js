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
  .get(protect, getTransactions);

router.route('/:id')
  .get(protect, getTransactionById);

router.route('/swap')
  .post(protect, createSwapTransaction);

module.exports = router;
