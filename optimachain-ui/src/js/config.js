/**
 * OptimaChain Global Configuration
 * This file contains global settings and configuration for the application.
 * It should be loaded before other scripts to ensure configuration is available.
 */

// Global configuration object
window.OPTIMACHAIN_CONFIG = {
  // API endpoints
  apiBaseUrl: 'https://api.optimachain.io',
  websocketUrl: 'wss://api.optimachain.io',
  
  // Environment settings
  environment: 'production', // 'development', 'staging', 'production'
  debug: false,
  
  // Feature flags
  features: {
    validatorSetup: true,
    walletIntegration: true,
    threeJsVisualization: true,
    darkMode: true,
    multiLanguage: true
  },
  
  // Performance settings
  performance: {
    throttleAnimations: true,
    maxFPS: 30,
    lazyLoadImages: true,
    prefetchAssets: true
  },
  
  // Default language
  defaultLanguage: 'ja',
  
  // Version information
  version: '1.0.0',
  buildDate: '2025-03-11'
};

// Vite compatibility helpers
window.__vite_is_modern_browser = true;

// Detect environment and override settings if needed
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.OPTIMACHAIN_CONFIG.environment = 'development';
  window.OPTIMACHAIN_CONFIG.apiBaseUrl = 'http://localhost:3000';
  window.OPTIMACHAIN_CONFIG.websocketUrl = 'ws://localhost:3000';
  window.OPTIMACHAIN_CONFIG.debug = true;
}

// Export configuration for ES modules
export default window.OPTIMACHAIN_CONFIG;
