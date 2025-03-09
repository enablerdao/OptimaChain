const mongoose = require('mongoose');

const tokenSchema = mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
      unique: true,
    },
    decimals: {
      type: Number,
      required: true,
      default: 18,
    },
    totalSupply: {
      type: Number,
      required: true,
    },
    circulatingSupply: {
      type: Number,
      required: true,
    },
    iconUrl: {
      type: String,
    },
    description: {
      type: String,
    },
    website: {
      type: String,
    },
    isNative: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// For development purposes, we'll create a mock Token model
// In a real application, you would use mongoose.model
const Token = {
  findById: (id) => {
    // Mock token data
    const tokens = getTokens();
    return Promise.resolve(tokens.find(token => token._id === id) || null);
  },
  find: () => {
    // Mock token data
    return Promise.resolve(getTokens());
  },
  findOne: ({ symbol }) => {
    // Mock token data
    const tokens = getTokens();
    return Promise.resolve(tokens.find(token => token.symbol === symbol) || null);
  },
  create: (tokenData) => {
    // Mock token creation
    return Promise.resolve({
      _id: Math.random().toString(36).substring(7),
      ...tokenData,
    });
  },
};

// Helper function to get mock tokens
function getTokens() {
  return [
    {
      _id: 'token1',
      symbol: 'OPT',
      name: 'OptimaChain',
      address: '0x0000000000000000000000000000000000000001',
      decimals: 18,
      totalSupply: 1000000000,
      circulatingSupply: 250000000,
      iconUrl: '/img/tokens/opt.png',
      description: 'Native token of the OptimaChain network',
      website: 'https://optimachain.network',
      isNative: true,
    },
    {
      _id: 'token2',
      symbol: 'USDT',
      name: 'Tether USD',
      address: '0x0000000000000000000000000000000000000002',
      decimals: 6,
      totalSupply: 100000000000,
      circulatingSupply: 80000000000,
      iconUrl: '/img/tokens/usdt.png',
      description: 'Stablecoin pegged to the US Dollar',
      website: 'https://tether.to',
      isNative: false,
    },
    {
      _id: 'token3',
      symbol: 'ETH',
      name: 'Ethereum',
      address: '0x0000000000000000000000000000000000000003',
      decimals: 18,
      totalSupply: 120000000,
      circulatingSupply: 119000000,
      iconUrl: '/img/tokens/eth.png',
      description: 'Wrapped Ethereum on OptimaChain',
      website: 'https://ethereum.org',
      isNative: false,
    },
    {
      _id: 'token4',
      symbol: 'BTC',
      name: 'Bitcoin',
      address: '0x0000000000000000000000000000000000000004',
      decimals: 8,
      totalSupply: 21000000,
      circulatingSupply: 19000000,
      iconUrl: '/img/tokens/btc.png',
      description: 'Wrapped Bitcoin on OptimaChain',
      website: 'https://bitcoin.org',
      isNative: false,
    },
    {
      _id: 'token5',
      symbol: 'SOL',
      name: 'Solana',
      address: '0x0000000000000000000000000000000000000005',
      decimals: 9,
      totalSupply: 500000000,
      circulatingSupply: 350000000,
      iconUrl: '/img/tokens/sol.png',
      description: 'Wrapped Solana on OptimaChain',
      website: 'https://solana.com',
      isNative: false,
    },
    {
      _id: 'token6',
      symbol: 'AVAX',
      name: 'Avalanche',
      address: '0x0000000000000000000000000000000000000006',
      decimals: 18,
      totalSupply: 720000000,
      circulatingSupply: 360000000,
      iconUrl: '/img/tokens/avax.png',
      description: 'Wrapped Avalanche on OptimaChain',
      website: 'https://avax.network',
      isNative: false,
    },
  ];
}

// Uncomment the following line to use the real mongoose model
// const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;