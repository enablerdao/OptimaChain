const Market = require('../models/marketModel');
const Token = require('../models/tokenModel');

// @desc    Get all markets
// @route   GET /api/market
// @access  Public
const getMarkets = async (req, res) => {
  try {
    const markets = await Market.find({ isActive: true });
    res.json(markets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get market by ID
// @route   GET /api/market/:id
// @access  Public
const getMarketById = async (req, res) => {
  try {
    const market = await Market.findById(req.params.id);

    if (!market) {
      return res.status(404).json({ message: 'Market not found' });
    }

    res.json(market);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get market by pair
// @route   GET /api/market/pair/:pair
// @access  Public
const getMarketByPair = async (req, res) => {
  try {
    const market = await Market.findOne({ pair: req.params.pair });

    if (!market) {
      return res.status(404).json({ message: 'Market not found' });
    }

    res.json(market);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get market orderbook
// @route   GET /api/market/:id/orderbook
// @access  Public
const getMarketOrderbook = async (req, res) => {
  try {
    const market = await Market.findById(req.params.id);

    if (!market) {
      return res.status(404).json({ message: 'Market not found' });
    }

    // Generate mock orderbook data
    const basePrice = market.lastPrice;
    const buyOrders = [];
    const sellOrders = [];

    // Generate buy orders (bids)
    for (let i = 0; i < 10; i++) {
      const price = Math.max(0, basePrice - (i * 0.01 * basePrice)).toFixed(2);
      const amount = (Math.random() * 100 + 50).toFixed(2);
      const total = (price * amount).toFixed(2);

      buyOrders.push({
        price,
        amount,
        total,
        depth: Math.random() * 80 + 20,
      });
    }

    // Generate sell orders (asks)
    for (let i = 0; i < 10; i++) {
      const price = (basePrice + (i * 0.01 * basePrice)).toFixed(2);
      const amount = (Math.random() * 100 + 50).toFixed(2);
      const total = (price * amount).toFixed(2);

      sellOrders.push({
        price,
        amount,
        total,
        depth: Math.random() * 80 + 20,
      });
    }

    // Sort orders
    buyOrders.sort((a, b) => parseFloat(b.price) - parseFloat(a.price)); // Highest first
    sellOrders.sort((a, b) => parseFloat(a.price) - parseFloat(b.price)); // Lowest first

    res.json({
      pair: market.pair,
      lastPrice: market.lastPrice,
      bids: buyOrders,
      asks: sellOrders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get market recent trades
// @route   GET /api/market/:id/trades
// @access  Public
const getMarketTrades = async (req, res) => {
  try {
    const market = await Market.findById(req.params.id);

    if (!market) {
      return res.status(404).json({ message: 'Market not found' });
    }

    // Generate mock trade data
    const trades = [];
    const basePrice = market.lastPrice;
    const types = ['buy', 'sell'];

    // Generate 20 random trades
    for (let i = 0; i < 20; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const price = (basePrice * (1 + (Math.random() * 0.1 - 0.05))).toFixed(2);
      const amount = (Math.random() * 100 + 10).toFixed(2);
      const total = (price * amount).toFixed(2);
      const timestamp = new Date(Date.now() - Math.random() * 3600000); // Random time within the last hour

      trades.push({
        id: `trade${i}`,
        type,
        price,
        amount,
        total,
        timestamp,
      });
    }

    // Sort by timestamp (newest first)
    trades.sort((a, b) => b.timestamp - a.timestamp);

    res.json(trades);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get market price chart data
// @route   GET /api/market/:id/chart
// @access  Public
const getMarketChartData = async (req, res) => {
  try {
    const market = await Market.findById(req.params.id);

    if (!market) {
      return res.status(404).json({ message: 'Market not found' });
    }

    const { interval = '1h', limit = 24 } = req.query;

    // Generate mock chart data
    const chartData = [];
    const basePrice = market.lastPrice;
    const now = Date.now();
    let timeStep;

    switch (interval) {
      case '1m':
        timeStep = 60 * 1000; // 1 minute
        break;
      case '5m':
        timeStep = 5 * 60 * 1000; // 5 minutes
        break;
      case '15m':
        timeStep = 15 * 60 * 1000; // 15 minutes
        break;
      case '1h':
        timeStep = 60 * 60 * 1000; // 1 hour
        break;
      case '4h':
        timeStep = 4 * 60 * 60 * 1000; // 4 hours
        break;
      case '1d':
        timeStep = 24 * 60 * 60 * 1000; // 1 day
        break;
      default:
        timeStep = 60 * 60 * 1000; // Default to 1 hour
    }

    // Generate candles
    let currentPrice = basePrice;
    for (let i = 0; i < limit; i++) {
      const timestamp = now - (limit - i - 1) * timeStep;
      const volatility = 0.02; // 2% price movement
      
      // Random price movement
      const change = currentPrice * (Math.random() * volatility * 2 - volatility);
      const open = currentPrice;
      const close = currentPrice + change;
      const high = Math.max(open, close) * (1 + Math.random() * 0.01);
      const low = Math.min(open, close) * (1 - Math.random() * 0.01);
      const volume = Math.random() * 1000 + 100;
      
      chartData.push({
        timestamp,
        open,
        high,
        low,
        close,
        volume,
      });
      
      currentPrice = close;
    }

    res.json({
      pair: market.pair,
      interval,
      data: chartData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new market (admin only)
// @route   POST /api/market
// @access  Private/Admin
const createMarket = async (req, res) => {
  try {
    const {
      pair,
      baseTokenId,
      quoteTokenId,
      lastPrice,
      priceChange24h,
      high24h,
      low24h,
      volume24h,
      liquidity,
      isActive,
    } = req.body;

    // Check if market already exists
    const marketExists = await Market.findOne({ pair });
    if (marketExists) {
      return res.status(400).json({ message: 'Market already exists' });
    }

    // Check if tokens exist
    const baseToken = await Token.findById(baseTokenId);
    const quoteToken = await Token.findById(quoteTokenId);

    if (!baseToken || !quoteToken) {
      return res.status(404).json({ message: 'Token not found' });
    }

    const market = await Market.create({
      pair,
      baseToken: baseTokenId,
      quoteToken: quoteTokenId,
      lastPrice: lastPrice || 0,
      priceChange24h: priceChange24h || 0,
      high24h: high24h || 0,
      low24h: low24h || 0,
      volume24h: volume24h || 0,
      liquidity: liquidity || 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json(market);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getMarkets,
  getMarketById,
  getMarketByPair,
  getMarketOrderbook,
  getMarketTrades,
  getMarketChartData,
  createMarket,
};