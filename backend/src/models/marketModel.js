const mongoose = require('mongoose');

const marketSchema = mongoose.Schema(
  {
    pair: {
      type: String,
      required: true,
      unique: true,
    },
    baseToken: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Token',
      required: true,
    },
    quoteToken: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Token',
      required: true,
    },
    lastPrice: {
      type: Number,
      required: true,
    },
    priceChange24h: {
      type: Number,
      required: true,
    },
    high24h: {
      type: Number,
      required: true,
    },
    low24h: {
      type: Number,
      required: true,
    },
    volume24h: {
      type: Number,
      required: true,
    },
    liquidity: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// For development purposes, we'll create a mock Market model
// In a real application, you would use mongoose.model
const Market = {
  findById: (id) => {
    // Mock market data
    const markets = getMarkets();
    return Promise.resolve(markets.find(market => market._id === id) || null);
  },
  find: () => {
    // Mock market data
    return Promise.resolve(getMarkets());
  },
  findOne: ({ pair }) => {
    // Mock market data
    const markets = getMarkets();
    // Handle both formats: OPT/USDT and OPT-USDT
    const normalizedPair = pair.replace('-', '/');
    return Promise.resolve(markets.find(market => market.pair === normalizedPair) || null);
  },
  create: (marketData) => {
    // Mock market creation
    return Promise.resolve({
      _id: Math.random().toString(36).substring(7),
      ...marketData,
    });
  },
};

// Helper function to get mock markets
function getMarkets() {
  return [
    {
      _id: 'market1',
      pair: 'OPT/USDT',
      baseToken: 'token1',
      quoteToken: 'token2',
      lastPrice: 0.00,
      priceChange24h: 0.00,
      high24h: 0.00,
      low24h: 0.00,
      volume24h: 0,
      liquidity: 0,
      isActive: true,
    },
    {
      _id: 'market2',
      pair: 'ETH/USDT',
      baseToken: 'token3',
      quoteToken: 'token2',
      lastPrice: 1800.00,
      priceChange24h: -2.50,
      high24h: 1850.00,
      low24h: 1780.00,
      volume24h: 15000000,
      liquidity: 50000000,
      isActive: true,
    },
    {
      _id: 'market3',
      pair: 'BTC/USDT',
      baseToken: 'token4',
      quoteToken: 'token2',
      lastPrice: 30000.00,
      priceChange24h: 1.20,
      high24h: 30500.00,
      low24h: 29800.00,
      volume24h: 25000000,
      liquidity: 100000000,
      isActive: true,
    },
    {
      _id: 'market4',
      pair: 'SOL/USDT',
      baseToken: 'token5',
      quoteToken: 'token2',
      lastPrice: 20.00,
      priceChange24h: 5.30,
      high24h: 21.00,
      low24h: 19.00,
      volume24h: 8000000,
      liquidity: 20000000,
      isActive: true,
    },
    {
      _id: 'market5',
      pair: 'AVAX/USDT',
      baseToken: 'token6',
      quoteToken: 'token2',
      lastPrice: 10.50,
      priceChange24h: -1.80,
      high24h: 11.00,
      low24h: 10.20,
      volume24h: 5000000,
      liquidity: 15000000,
      isActive: true,
    },
  ];
}

// Uncomment the following line to use the real mongoose model
// const Market = mongoose.model('Market', marketSchema);

module.exports = Market;
