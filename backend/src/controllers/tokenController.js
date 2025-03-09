const Token = require('../models/tokenModel');

// @desc    Get all tokens
// @route   GET /api/tokens
// @access  Public
const getTokens = async (req, res) => {
  try {
    const tokens = await Token.find({});
    res.json(tokens);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get token by ID
// @route   GET /api/tokens/:id
// @access  Public
const getTokenById = async (req, res) => {
  try {
    const token = await Token.findById(req.params.id);

    if (!token) {
      return res.status(404).json({ message: 'Token not found' });
    }

    res.json(token);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get token by symbol
// @route   GET /api/tokens/symbol/:symbol
// @access  Public
const getTokenBySymbol = async (req, res) => {
  try {
    const token = await Token.findOne({ symbol: req.params.symbol.toUpperCase() });

    if (!token) {
      return res.status(404).json({ message: 'Token not found' });
    }

    res.json(token);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new token (admin only)
// @route   POST /api/tokens
// @access  Private/Admin
const createToken = async (req, res) => {
  try {
    const {
      symbol,
      name,
      address,
      decimals,
      totalSupply,
      circulatingSupply,
      iconUrl,
      description,
      website,
      isNative,
    } = req.body;

    const tokenExists = await Token.findOne({ symbol: symbol.toUpperCase() });

    if (tokenExists) {
      return res.status(400).json({ message: 'Token already exists' });
    }

    const token = await Token.create({
      symbol: symbol.toUpperCase(),
      name,
      address,
      decimals: decimals || 18,
      totalSupply,
      circulatingSupply,
      iconUrl,
      description,
      website,
      isNative: isNative || false,
    });

    res.status(201).json(token);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update token (admin only)
// @route   PUT /api/tokens/:id
// @access  Private/Admin
const updateToken = async (req, res) => {
  try {
    const token = await Token.findById(req.params.id);

    if (!token) {
      return res.status(404).json({ message: 'Token not found' });
    }

    const {
      name,
      address,
      decimals,
      totalSupply,
      circulatingSupply,
      iconUrl,
      description,
      website,
      isNative,
    } = req.body;

    token.name = name || token.name;
    token.address = address || token.address;
    token.decimals = decimals || token.decimals;
    token.totalSupply = totalSupply || token.totalSupply;
    token.circulatingSupply = circulatingSupply || token.circulatingSupply;
    token.iconUrl = iconUrl || token.iconUrl;
    token.description = description || token.description;
    token.website = website || token.website;
    token.isNative = isNative !== undefined ? isNative : token.isNative;

    const updatedToken = await token.save();

    res.json(updatedToken);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getTokens,
  getTokenById,
  getTokenBySymbol,
  createToken,
  updateToken,
};