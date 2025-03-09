const Transaction = require('../models/transactionModel');
const Wallet = require('../models/walletModel');

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({ timestamp: -1 });
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if transaction belongs to user
    if (transaction.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get transaction by hash
// @route   GET /api/transactions/hash/:hash
// @access  Public
const getTransactionByHash = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ hash: req.params.hash });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a swap transaction
// @route   POST /api/transactions/swap
// @access  Private
const createSwapTransaction = async (req, res) => {
  try {
    const { fromWalletId, fromToken, fromAmount, toToken, toAmount } = req.body;
    
    // Validate input
    if (!fromWalletId || !fromToken || !fromAmount || !toToken || !toAmount) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    const wallet = await Wallet.findById(fromWalletId);
    
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }
    
    // Check if wallet belongs to user
    if (wallet.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Check if wallet has enough balance
    const fromTokenBalance = wallet.balances.find(b => b.token === fromToken);
    if (!fromTokenBalance || fromTokenBalance.amount < parseFloat(fromAmount)) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    
    // Create swap transaction
    const transaction = await Transaction.create({
      hash: `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      type: 'swap',
      status: 'pending',
      from: wallet.address,
      to: wallet.address, // In a swap, sender and receiver are the same
      token: `${fromToken}/${toToken}`,
      amount: parseFloat(fromAmount),
      fee: 0.001, // Fixed fee for demo
      user: req.user._id,
    });
    
    // Update wallet balances (in a real app, this would happen after transaction confirmation)
    fromTokenBalance.amount -= parseFloat(fromAmount);
    
    // Find or create toToken balance
    let toTokenBalance = wallet.balances.find(b => b.token === toToken);
    if (!toTokenBalance) {
      wallet.balances.push({
        token: toToken,
        amount: 0,
      });
      toTokenBalance = wallet.balances[wallet.balances.length - 1];
    }
    
    toTokenBalance.amount += parseFloat(toAmount);
    await wallet.save();
    
    // In a real app, we would broadcast the transaction to the blockchain here
    // For demo purposes, we'll just update the transaction status after a delay
    setTimeout(async () => {
      transaction.status = 'confirmed';
      transaction.blockNumber = Math.floor(Math.random() * 1000000);
      await transaction.save();
    }, 3000);
    
    res.status(201).json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  getTransactionByHash,
  createSwapTransaction,
};