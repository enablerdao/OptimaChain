/**
 * OptimaChain Analytics Module
 * Handles user analytics and event tracking
 */

// Configuration
const ANALYTICS_CONFIG = {
  enabled: true,
  anonymizeIp: true,
  trackErrors: true,
  trackPerformance: true
};

// Initialize analytics
function initAnalytics() {
  console.log('Analytics initialized');
  
  // Register performance tracking
  if (ANALYTICS_CONFIG.trackPerformance && window.performance) {
    trackPerformanceMetrics();
  }
  
  // Register error tracking
  if (ANALYTICS_CONFIG.trackErrors) {
    trackErrors();
  }
}

// Track page views
function trackPageView(path) {
  if (!ANALYTICS_CONFIG.enabled) return;
  
  const pageData = {
    path: path || window.location.pathname,
    referrer: document.referrer,
    timestamp: new Date().toISOString(),
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight
  };
  
  console.log('Page view tracked:', pageData);
  // In production, send to analytics endpoint
}

// Track user events
function trackEvent(category, action, label, value) {
  if (!ANALYTICS_CONFIG.enabled) return;
  
  const eventData = {
    category,
    action,
    label,
    value,
    timestamp: new Date().toISOString()
  };
  
  console.log('Event tracked:', eventData);
  // In production, send to analytics endpoint
}

// Track performance metrics
function trackPerformanceMetrics() {
  if (!window.performance) return;
  
  // Track page load time
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const domReadyTime = perfData.domComplete - perfData.domLoading;
      
      trackEvent('Performance', 'PageLoad', 'Total', pageLoadTime);
      trackEvent('Performance', 'DOMReady', 'Total', domReadyTime);
    }, 0);
  });
}

// Track errors
function trackErrors() {
  window.addEventListener('error', (event) => {
    const errorData = {
      message: event.message,
      source: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      timestamp: new Date().toISOString()
    };
    
    console.log('Error tracked:', errorData);
    // In production, send to analytics endpoint
  });
}

// Export functions
export {
  initAnalytics,
  trackPageView,
  trackEvent
};

// Auto-initialize if script is loaded directly
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initAnalytics);
}
