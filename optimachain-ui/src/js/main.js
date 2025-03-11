/**
 * OptimaChain Main Application
 * Entry point for the OptimaChain frontend application
 */

// Import dependencies
import './config.js';
import { initRouter } from './router.js';
import { setupValidatorUI } from './validator-setup.js';
import { initBlockchainVisual } from './blockchain-visual.js';
import { initErrorHandler } from './error-handler.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  console.log('OptimaChain - アプリケーション初期化');
  
  // Initialize error handling
  initErrorHandler();
  
  // Initialize router
  if (typeof initRouter === 'function') {
    initRouter();
  } else {
    console.warn('Router initialization failed: initRouter is not a function');
    // Fallback to basic navigation
    setupBasicNavigation();
  }
  
  // Initialize validator setup UI if on relevant page
  if (document.querySelector('.validator-setup-section')) {
    setupValidatorUI();
  }
  
  // Initialize blockchain visualization if on relevant page
  const blockchainCanvas = document.getElementById('blockchain-visual');
  if (blockchainCanvas) {
    initBlockchainVisual(blockchainCanvas);
  }
  
  // Initialize performance monitoring
  initPerformanceMonitoring();
  
  // Register service worker for offline support
  registerServiceWorker();
});

// Fallback navigation for when router fails
function setupBasicNavigation() {
  document.querySelectorAll('a').forEach(link => {
    if (link.href && !link.href.startsWith('http') && !link.href.startsWith('#')) {
      link.addEventListener('click', (e) => {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          window.location.href = link.href;
        }
      });
    }
  });
}

// Initialize performance monitoring
function initPerformanceMonitoring() {
  if (window.performance) {
    // Record navigation timing
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`Page load time: ${pageLoadTime}ms`);
      }, 0);
    });
  }
}

// Register service worker
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('ServiceWorker registration successful');
        })
        .catch(error => {
          console.warn('ServiceWorker registration failed:', error);
        });
    });
  }
}

// Make router available globally if not already done
if (typeof window.router === 'undefined' && typeof initRouter !== 'undefined') {
  window.router = { initRouter };
}
