const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const Token = require('../models/tokenModel');
const Market = require('../models/marketModel');
const { v4: uuidv4 } = require('uuid');

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Token.deleteMany({});
    await Market.deleteMany({});

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: adminPassword,
      isAdmin: true,
    });

    // Create test user
    const userPassword = await bcrypt.hash('password123', 10);
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: userPassword,
      isAdmin: false,
    });

    // Create tokens
    const tokens = [
      {
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
    ];

    const createdTokens = await Token.insertMany(tokens);

    // Create markets
    const markets = [
      {
        pair: 'OPT/USDT',
        baseToken: createdTokens[0]._id,
        quoteToken: createdTokens[1]._id,
        lastPrice: 0.00,
        priceChange24h: 0.00,
        high24h: 0.00,
        low24h: 0.00,
        volume24h: 0,
        liquidity: 0,
        isActive: true,
      },
      {
        pair: 'ETH/USDT',
        baseToken: createdTokens[2]._id,
        quoteToken: createdTokens[1]._id,
        lastPrice: 1800.00,
        priceChange24h: -2.50,
        high24h: 1850.00,
        low24h: 1780.00,
        volume24h: 15000000,
        liquidity: 50000000,
        isActive: true,
      },
    ];

    await Market.insertMany(markets);

    console.log('Data seeded successfully');
  } catch (error) {
    console.error(`Error seeding data: ${error.message}`);
    process.exit(1);
  }
};

module.exports = seedData;
