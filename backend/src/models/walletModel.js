const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const walletSchema = mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
      unique: true,
    },
    privateKey: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      default: 'My Wallet',
    },
    balances: [
      {
        token: {
          type: String,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Comment out mock Wallet model
/*
const Wallet = {
  findById: (id) => {
    // Mock wallet data
    return Promise.resolve({
      _id: id,
      address: `0x${uuidv4().replace(/-/g, '').substring(0, 40)}`,
      name: 'My Wallet',
      balances: [
        { token: 'OPT', amount: 1250 },
        { token: 'USDT', amount: 0 },
        { token: 'ETH', amount: 0 },
      ],
      user: 'user1',
    });
  },
  find: ({ user }) => {
    // Mock wallet data
    return Promise.resolve([
      {
        _id: 'wallet1',
        address: `0x${uuidv4().replace(/-/g, '').substring(0, 40)}`,
        name: 'Main Wallet',
        balances: [
          { token: 'OPT', amount: 1250 },
          { token: 'USDT', amount: 0 },
          { token: 'ETH', amount: 0 },
        ],
        user: user,
      },
      {
        _id: 'wallet2',
        address: `0x${uuidv4().replace(/-/g, '').substring(0, 40)}`,
        name: 'Secondary Wallet',
        balances: [
          { token: 'OPT', amount: 500 },
          { token: 'USDT', amount: 100 },
          { token: 'ETH', amount: 0.1 },
        ],
        user: user,
      },
    ]);
  },
  create: (walletData) => {
    // Mock wallet creation
    return Promise.resolve({
      _id: Math.random().toString(36).substring(7),
      address: `0x${uuidv4().replace(/-/g, '').substring(0, 40)}`,
      privateKey: uuidv4(),
      ...walletData,
      balances: [
        { token: 'OPT', amount: 0 },
        { token: 'USDT', amount: 0 },
        { token: 'ETH', amount: 0 },
      ],
    });
  },
};
*/

// Use real mongoose model
const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;
