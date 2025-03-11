// Authentication module for OptimaChain

// Token storage keys
const TOKEN_KEY = 'optimachain_token';
const USER_KEY = 'optimachain_user';

// Authentication service
const Auth = {
  // Store token in localStorage
  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token);
  },
  
  // Get token from localStorage
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },
  
  // Remove token from localStorage
  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY);
  },
  
  // Store user data in localStorage
  setUser: (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  
  // Get user data from localStorage
  getUser: () => {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },
  
  // Remove user data from localStorage
  removeUser: () => {
    localStorage.removeItem(USER_KEY);
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  },
  
  // Logout user
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = '/index.html';
  }
};

// Export Auth service
window.Auth = Auth;
