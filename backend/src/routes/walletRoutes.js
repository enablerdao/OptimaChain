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
  .get(protect, getUserWallets)
  .post(protect, createWallet);

router.route('/:id')
  .get(protect, getWalletById)
  .put(protect, updateWallet);

router.route('/:id/transactions')
  .get(protect, getWalletTransactions);

router.route('/:id/send')
  .post(protect, sendTokens);

router.route('/:id/balance')
  .get(protect, getWalletBalance);

module.exports = router;
