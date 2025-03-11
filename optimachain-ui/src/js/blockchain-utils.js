/**
 * OptimaChain Blockchain Utilities
 * This module provides utility functions for blockchain visualizations and data processing.
 */

/**
 * Generates a random blockchain transaction for visualization purposes
 * @param {Object} options - Configuration options
 * @returns {Object} A transaction object
 */
export function generateRandomTransaction(options = {}) {
  const defaultOptions = {
    minValue: 0.001,
    maxValue: 100,
    senderTypes: ['wallet', 'contract', 'validator'],
    receiverTypes: ['wallet', 'contract', 'validator'],
    transactionTypes: ['transfer', 'swap', 'stake', 'unstake', 'contract_call']
  };
  
  const config = { ...defaultOptions, ...options };
  
  // Generate random addresses
  const senderAddress = generateRandomAddress();
  const receiverAddress = generateRandomAddress();
  
  // Generate random transaction type
  const transactionType = config.transactionTypes[
    Math.floor(Math.random() * config.transactionTypes.length)
  ];
  
  // Generate random value
  const value = config.minValue + Math.random() * (config.maxValue - config.minValue);
  
  // Generate random timestamp within the last hour
  const timestamp = Date.now() - Math.floor(Math.random() * 3600000);
  
  // Generate random gas
  const gas = Math.floor(Math.random() * 1000000) + 21000;
  
  return {
    hash: generateRandomHash(),
    sender: {
      address: senderAddress,
      type: config.senderTypes[Math.floor(Math.random() * config.senderTypes.length)]
    },
    receiver: {
      address: receiverAddress,
      type: config.receiverTypes[Math.floor(Math.random() * config.receiverTypes.length)]
    },
    value: value.toFixed(6),
    type: transactionType,
    timestamp,
    gas,
    status: Math.random() > 0.05 ? 'confirmed' : 'pending'
  };
}

/**
 * Generates a random blockchain block for visualization purposes
 * @param {Object} options - Configuration options
 * @returns {Object} A block object
 */
export function generateRandomBlock(options = {}) {
  const defaultOptions = {
    minTransactions: 1,
    maxTransactions: 20,
    previousBlockHash: null,
    blockNumber: null
  };
  
  const config = { ...defaultOptions, ...options };
  
  // Generate random number of transactions
  const transactionCount = Math.floor(
    Math.random() * (config.maxTransactions - config.minTransactions + 1) + config.minTransactions
  );
  
  // Generate transactions
  const transactions = [];
  for (let i = 0; i < transactionCount; i++) {
    transactions.push(generateRandomTransaction());
  }
  
  // Generate block hash
  const blockHash = generateRandomHash();
  
  // Generate timestamp within the last day
  const timestamp = Date.now() - Math.floor(Math.random() * 86400000);
  
  // Generate block number if not provided
  const blockNumber = config.blockNumber !== null ? 
    config.blockNumber : 
    Math.floor(Math.random() * 1000000);
  
  // Generate previous block hash if not provided
  const previousBlockHash = config.previousBlockHash || generateRandomHash();
  
  // Calculate total value
  const totalValue = transactions.reduce(
    (sum, tx) => sum + parseFloat(tx.value), 
    0
  ).toFixed(6);
  
  return {
    hash: blockHash,
    previousHash: previousBlockHash,
    number: blockNumber,
    timestamp,
    transactions,
    transactionCount,
    totalValue,
    size: Math.floor(Math.random() * 1000000) + 1000, // Block size in bytes
    validator: generateRandomAddress(),
    difficulty: Math.floor(Math.random() * 1000000000)
  };
}

/**
 * Generates a random blockchain address
 * @returns {String} A random blockchain address
 */
export function generateRandomAddress() {
  return '0x' + Array.from({ length: 40 }, () => 
    '0123456789abcdef'[Math.floor(Math.random() * 16)]
  ).join('');
}

/**
 * Generates a random transaction or block hash
 * @returns {String} A random hash
 */
export function generateRandomHash() {
  return '0x' + Array.from({ length: 64 }, () => 
    '0123456789abcdef'[Math.floor(Math.random() * 16)]
  ).join('');
}

/**
 * Formats a blockchain address for display
 * @param {String} address - The blockchain address
 * @param {Number} prefixLength - Number of characters to show at the beginning
 * @param {Number} suffixLength - Number of characters to show at the end
 * @returns {String} Formatted address
 */
export function formatAddress(address, prefixLength = 6, suffixLength = 4) {
  if (!address || address.length < prefixLength + suffixLength + 3) {
    return address;
  }
  
  return `${address.substring(0, prefixLength)}...${address.substring(address.length - suffixLength)}`;
}

/**
 * Formats a timestamp to a human-readable date
 * @param {Number} timestamp - Unix timestamp in milliseconds
 * @param {Boolean} includeTime - Whether to include time in the output
 * @returns {String} Formatted date string
 */
export function formatTimestamp(timestamp, includeTime = true) {
  const date = new Date(timestamp);
  
  if (includeTime) {
    return date.toLocaleString();
  }
  
  return date.toLocaleDateString();
}

/**
 * Formats a value with the appropriate token symbol
 * @param {Number|String} value - The value to format
 * @param {String} symbol - The token symbol
 * @returns {String} Formatted value with symbol
 */
export function formatValue(value, symbol = 'OPT') {
  const numValue = parseFloat(value);
  
  if (isNaN(numValue)) {
    return `0 ${symbol}`;
  }
  
  // Format with appropriate precision
  let formattedValue;
  if (numValue < 0.001) {
    formattedValue = numValue.toExponential(2);
  } else if (numValue < 1) {
    formattedValue = numValue.toFixed(6);
  } else if (numValue < 1000) {
    formattedValue = numValue.toFixed(2);
  } else {
    formattedValue = numValue.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  
  return `${formattedValue} ${symbol}`;
}

/**
 * Calculates the time elapsed since a timestamp
 * @param {Number} timestamp - Unix timestamp in milliseconds
 * @returns {String} Human-readable time elapsed
 */
export function timeElapsed(timestamp) {
  const now = Date.now();
  const elapsed = now - timestamp;
  
  const seconds = Math.floor(elapsed / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}日前`;
  } else if (hours > 0) {
    return `${hours}時間前`;
  } else if (minutes > 0) {
    return `${minutes}分前`;
  } else {
    return `${seconds}秒前`;
  }
}

/**
 * Calculates the gas price in GWEI
 * @param {Number} gas - Gas amount
 * @param {Number} gasPrice - Gas price in wei
 * @returns {String} Formatted gas price
 */
export function calculateGasPrice(gas, gasPrice) {
  const gweiPrice = gasPrice / 1e9;
  const totalGwei = gas * gweiPrice;
  
  return `${totalGwei.toFixed(6)} GWEI`;
}

/**
 * Validates a blockchain address
 * @param {String} address - The address to validate
 * @returns {Boolean} Whether the address is valid
 */
export function isValidAddress(address) {
  // Basic validation for Ethereum-style addresses
  return /^0x[0-9a-fA-F]{40}$/.test(address);
}
