/**
 * OptimaChain Main JavaScript
 * This is the entry point for the application
 */

// Import dependencies
import './config.js';
import { initRouter } from './router.js';
import { setupValidatorUI } from './validator-setup.js';
import { initBlockchainVisual } from './blockchain-visual.js';
import { initErrorHandler } from './error-handler.js';
import { initNetworkStatsVisualization } from './network-stats.js';

// Log initialization
console.log('OptimaChain application initializing...');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  console.log('OptimaChain application initializing...');
  
  // Initialize error handling
  initErrorHandler();
  
  // Initialize the router
  initRouter();
  
  // Setup validator UI
  setupValidatorUI();
  
  // Initialize blockchain visualization if the canvas exists
  const blockchainCanvas = document.getElementById('blockchain-visual');
  if (blockchainCanvas) {
    initBlockchainVisual(blockchainCanvas);
  }
  
  // Initialize network statistics visualization if we're on a page that has it
  if (document.getElementById('network-stats-section')) {
    initNetworkStatsVisualization();
  }
  
  // Initialize performance monitoring
  if (window.performance && window.performance.mark) {
    window.performance.mark('app-initialized');
  }
});
