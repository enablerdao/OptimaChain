const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const transactionSchema = mongoose.Schema(
  {
    hash: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['send', 'receive', 'swap', 'stake', 'unstake'],
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'confirmed', 'failed'],
      default: 'pending',
    },
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    fee: {
      type: Number,
      required: true,
      default: 0.001,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    blockNumber: {
      type: Number,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// For development purposes, we'll create a mock Transaction model
// In a real application, you would use mongoose.model
const Transaction = {
  findById: (id) => {
    // Mock transaction data
    return Promise.resolve({
      _id: id,
      hash: `0x${uuidv4().replace(/-/g, '')}`,
      type: 'send',
      status: 'confirmed',
      from: '0x1234567890abcdef1234567890abcdef12345678',
      to: '0xabcdef1234567890abcdef1234567890abcdef12',
      token: 'OPT',
      amount: 100,
      fee: 0.001,
      timestamp: new Date(),
      blockNumber: 12345,
      user: 'user1',
    });
  },
  find: ({ user }) => {
    // Mock transaction data
    const transactions = [];
    const types = ['send', 'receive', 'swap'];
    const statuses = ['confirmed', 'pending', 'failed'];
    const tokens = ['OPT', 'USDT', 'ETH'];
    
    // Generate 10 random transactions
    for (let i = 0; i < 10; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const token = tokens[Math.floor(Math.random() * tokens.length)];
      const amount = Math.random() * 100;
      
      transactions.push({
        _id: `tx${i}`,
        hash: `0x${uuidv4().replace(/-/g, '')}`,
        type,
        status,
        from: type === 'receive' ? '0xabcdef1234567890abcdef1234567890abcdef12' : '0x1234567890abcdef1234567890abcdef12345678',
        to: type === 'send' ? '0xabcdef1234567890abcdef1234567890abcdef12' : '0x1234567890abcdef1234567890abcdef12345678',
        token,
        amount,
        fee: 0.001,
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within the last 30 days
        blockNumber: Math.floor(Math.random() * 1000000),
        user,
      });
    }
    
    // Sort by timestamp (newest first)
    transactions.sort((a, b) => b.timestamp - a.timestamp);
    
    return Promise.resolve(transactions);
  },
  create: (txData) => {
    // Mock transaction creation
    return Promise.resolve({
      _id: Math.random().toString(36).substring(7),
      hash: `0x${uuidv4().replace(/-/g, '')}`,
      status: 'pending',
      timestamp: new Date(),
      blockNumber: Math.floor(Math.random() * 1000000),
      ...txData,
    });
  },
};

// Uncomment the following line to use the real mongoose model
// const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;