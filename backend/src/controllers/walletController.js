const Wallet = require('../models/walletModel');
const Transaction = require('../models/transactionModel');
const { v4: uuidv4 } = require('uuid');

// @desc    Get user wallets
// @route   GET /api/wallets
// @access  Private
const getUserWallets = async (req, res) => {
  try {
    const wallets = await Wallet.find({ user: req.user._id });
    res.json(wallets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get wallet by ID
// @route   GET /api/wallets/:id
// @access  Private
const getWalletById = async (req, res) => {
  try {
    const wallet = await Wallet.findById(req.params.id);

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    // Check if wallet belongs to user
    if (wallet.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(wallet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new wallet
// @route   POST /api/wallets
// @access  Private
const createWallet = async (req, res) => {
  try {
    const { name } = req.body;

    const wallet = await Wallet.create({
      user: req.user._id,
      name: name || 'My Wallet',
      address: `0x${uuidv4().replace(/-/g, '').substring(0, 40)}`,
      privateKey: uuidv4(),
      balances: [
        { token: 'OPT', amount: 0 },
        { token: 'USDT', amount: 0 },
        { token: 'ETH', amount: 0 },
      ],
    });

    res.status(201).json(wallet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update wallet
// @route   PUT /api/wallets/:id
// @access  Private
const updateWallet = async (req, res) => {
  try {
    const { name } = req.body;
    const wallet = await Wallet.findById(req.params.id);

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    // Check if wallet belongs to user
    if (wallet.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    wallet.name = name || wallet.name;
    const updatedWallet = await wallet.save();

    res.json(updatedWallet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get wallet transactions
// @route   GET /api/wallets/:id/transactions
// @access  Private
const getWalletTransactions = async (req, res) => {
  try {
    const wallet = await Wallet.findById(req.params.id);

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    // Check if wallet belongs to user
    if (wallet.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Get transactions where wallet is sender or receiver
    const transactions = await Transaction.find({
      $or: [
        { from: wallet.address },
        { to: wallet.address },
      ],
    }).sort({ timestamp: -1 });

    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send tokens from wallet
// @route   POST /api/wallets/:id/send
// @access  Private
const sendTokens = async (req, res) => {
  try {
    const { to, token, amount, fee } = req.body;
    const wallet = await Wallet.findById(req.params.id);

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    // Check if wallet belongs to user
    if (wallet.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Check if wallet has enough balance
    const tokenBalance = wallet.balances.find(b => b.token === token);
    if (!tokenBalance || tokenBalance.amount < parseFloat(amount) + parseFloat(fee || 0.001)) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Create transaction
    const transaction = await Transaction.create({
      hash: `0x${uuidv4().replace(/-/g, '')}`,
      type: 'send',
      status: 'pending',
      from: wallet.address,
      to,
      token,
      amount: parseFloat(amount),
      fee: parseFloat(fee || 0.001),
      user: req.user._id,
    });

    // Update wallet balance (in a real app, this would happen after transaction confirmation)
    tokenBalance.amount -= parseFloat(amount) + parseFloat(fee || 0.001);
    await wallet.save();

    // In a real app, we would broadcast the transaction to the blockchain here
    // For demo purposes, we'll just update the transaction status after a delay
    setTimeout(async () => {
      transaction.status = 'confirmed';
      transaction.blockNumber = Math.floor(Math.random() * 1000000);
      await transaction.save();
    }, 5000);

    res.json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get wallet balance
// @route   GET /api/wallets/:id/balance
// @access  Private
const getWalletBalance = async (req, res) => {
  try {
    const wallet = await Wallet.findById(req.params.id);

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    // Check if wallet belongs to user
    if (wallet.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(wallet.balances);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUserWallets,
  getWalletById,
  createWallet,
  updateWallet,
  getWalletTransactions,
  sendTokens,
  getWalletBalance,
};