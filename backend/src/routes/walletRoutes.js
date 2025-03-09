const express = require('express');
const router = express.Router();
const {
  getUserWallets,
  getWalletById,
  createWallet,
  updateWallet,
  getWalletTransactions,
  sendTokens,
  getWalletBalance,
} = require('../controllers/walletController');
const { protect, mockProtect } = require('../middleware/authMiddleware');

// All routes are protected
router.route('/')
  .get(mockProtect, getUserWallets) // Use mockProtect for development
  .post(mockProtect, createWallet);

router.route('/:id')
  .get(mockProtect, getWalletById)
  .put(mockProtect, updateWallet);

router.route('/:id/transactions')
  .get(mockProtect, getWalletTransactions);

router.route('/:id/send')
  .post(mockProtect, sendTokens);

router.route('/:id/balance')
  .get(mockProtect, getWalletBalance);

module.exports = router;