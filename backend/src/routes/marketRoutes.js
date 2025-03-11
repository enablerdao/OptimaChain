const express = require('express');
const router = express.Router();
const {
  getMarkets,
  getMarketById,
  getMarketByPair,
  getMarketOrderbook,
  getMarketTrades,
  getMarketChartData,
  createMarket,
} = require('../controllers/marketController');
const { protect, admin, mockProtect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getMarkets);
router.get('/:id', getMarketById);
router.get('/pair/:pair', getMarketByPair);
router.get('/:id/orderbook', getMarketOrderbook);
router.get('/:id/trades', getMarketTrades);
router.get('/:id/chart', getMarketChartData);

// Admin routes
router.route('/')
  .post(protect, admin, createMarket);

module.exports = router;
