// API Service for OptimaDEX
const API_URL = 'http://localhost:3000/api';

// Helper function for making API requests
async function apiRequest(endpoint, method = 'GET', data = null, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Something went wrong');
    }

    return responseData;
  } catch (error) {
    console.error(`API Error: ${error.message}`);
    throw error;
  }
}

// Auth API
const authAPI = {
  login: async (email, password) => {
    return apiRequest('/users/login', 'POST', { email, password });
  },
  register: async (username, email, password) => {
    return apiRequest('/users/register', 'POST', { username, email, password });
  },
  getProfile: async (token) => {
    return apiRequest('/users/profile', 'GET', null, token);
  },
};

// Wallet API
const walletAPI = {
  getWallets: async (token) => {
    return apiRequest('/wallets', 'GET', null, token);
  },
  getWallet: async (id, token) => {
    return apiRequest(`/wallets/${id}`, 'GET', null, token);
  },
  getWalletBalance: async (id, token) => {
    return apiRequest(`/wallets/${id}/balance`, 'GET', null, token);
  },
};

// Token API
const tokenAPI = {
  getTokens: async () => {
    return apiRequest('/tokens', 'GET');
  },
  getToken: async (id) => {
    return apiRequest(`/tokens/${id}`, 'GET');
  },
  getTokenBySymbol: async (symbol) => {
    return apiRequest(`/tokens/symbol/${symbol}`, 'GET');
  },
};

// Market API
const marketAPI = {
  getMarkets: async () => {
    return apiRequest('/market', 'GET');
  },
  getMarket: async (id) => {
    return apiRequest(`/market/${id}`, 'GET');
  },
  getMarketByPair: async (pair) => {
    return apiRequest(`/market/pair/${pair}`, 'GET');
  },
  getOrderbook: async (id) => {
    return apiRequest(`/market/${id}/orderbook`, 'GET');
  },
  getTrades: async (id) => {
    return apiRequest(`/market/${id}/trades`, 'GET');
  },
  getChartData: async (id, interval = '1h', limit = 24) => {
    return apiRequest(`/market/${id}/chart?interval=${interval}&limit=${limit}`, 'GET');
  },
};

// Transaction API
const transactionAPI = {
  createSwap: async (fromWalletId, fromToken, fromAmount, toToken, toAmount, token) => {
    return apiRequest('/transactions/swap', 'POST', {
      fromWalletId,
      fromToken,
      fromAmount,
      toToken,
      toAmount,
    }, token);
  },
  createOrder: async (walletId, type, side, price, amount, pair, token) => {
    return apiRequest('/market/order', 'POST', {
      walletId,
      type, // 'limit' or 'market'
      side, // 'buy' or 'sell'
      price,
      amount,
      pair,
    }, token);
  },
};

// Export all API services
const API = {
  auth: authAPI,
  wallet: walletAPI,
  token: tokenAPI,
  market: marketAPI,
  transaction: transactionAPI,
};

// For development, we'll use mock data instead of actual API calls
// In a real application, you would use the API services above
const useMockData = true;

if (useMockData) {
  console.log('Using mock data instead of API calls');
}