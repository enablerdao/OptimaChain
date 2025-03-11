/**
 * OptimaChain Performance Optimization Module
 * This module provides functions to optimize the performance of the application.
 */

/**
 * Initializes performance optimizations for the application
 */
export function initPerformanceOptimizations() {
  // Register performance observers
  registerPerformanceObservers();
  
  // Optimize image loading
  optimizeImageLoading();
  
  // Optimize animations
  optimizeAnimations();
  
  // Defer non-critical resources
  deferNonCriticalResources();
}

/**
 * Registers performance observers to monitor application performance
 */
function registerPerformanceObservers() {
  // Only run in browsers that support PerformanceObserver
  if ('PerformanceObserver' in window) {
    // Observe long tasks
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          // Log long tasks that might affect user experience
          if (window.OPTIMACHAIN_CONFIG && window.OPTIMACHAIN_CONFIG.debug) {
            console.warn('Long task detected:', entry.duration, 'ms', entry);
          }
        });
      });
      
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // Silently fail if longtask observation isn't supported
    }
    
    // Observe largest contentful paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        // Report LCP to analytics if available
        if (window.OPTIMACHAIN_CONFIG && window.OPTIMACHAIN_CONFIG.debug) {
          console.log('LCP:', lastEntry.startTime, 'ms');
        }
      });
      
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // Silently fail if LCP observation isn't supported
    }
  }
}

/**
 * Optimizes image loading using lazy loading and responsive images
 */
function optimizeImageLoading() {
  // Use Intersection Observer for lazy loading images
  if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if (lazyImages.length > 0) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            
            // Also load srcset if available
            if (img.dataset.srcset) {
              img.srcset = img.dataset.srcset;
            }
            
            // Remove data attributes once loaded
            img.removeAttribute('data-src');
            img.removeAttribute('data-srcset');
            
            // Stop observing the image
            imageObserver.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px 0px', // Start loading when within 50px of viewport
        threshold: 0.01 // Trigger when at least 1% of the element is visible
      });
      
      lazyImages.forEach((img) => {
        imageObserver.observe(img);
      });
    }
  }
}

/**
 * Optimizes animations to reduce CPU usage and improve performance
 */
function optimizeAnimations() {
  // Use requestAnimationFrame for smooth animations
  if (window.OPTIMACHAIN_CONFIG && window.OPTIMACHAIN_CONFIG.performance.throttleAnimations) {
    // Throttle animations to the specified FPS
    window.OPTIMACHAIN_ANIMATION_THROTTLE = 1000 / window.OPTIMACHAIN_CONFIG.performance.maxFPS;
    window.OPTIMACHAIN_LAST_FRAME_TIME = 0;
    
    // Override requestAnimationFrame to throttle animations
    const originalRAF = window.requestAnimationFrame;
    window.requestAnimationFrame = function(callback) {
      return originalRAF((timestamp) => {
        const currentTime = performance.now();
        if (currentTime - window.OPTIMACHAIN_LAST_FRAME_TIME >= window.OPTIMACHAIN_ANIMATION_THROTTLE) {
          window.OPTIMACHAIN_LAST_FRAME_TIME = currentTime;
          callback(timestamp);
        }
      });
    };
  }
  
  // Use Intersection Observer for scroll-based animations
  if ('IntersectionObserver' in window) {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    if (animatedElements.length > 0) {
      const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Stop observing once animation is triggered
            animationObserver.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1 // Trigger when at least 10% of the element is visible
      });
      
      animatedElements.forEach((element) => {
        animationObserver.observe(element);
      });
    }
  }
}

/**
 * Defers loading of non-critical resources to improve initial page load
 */
function deferNonCriticalResources() {
  // Defer loading of non-critical scripts
  setTimeout(() => {
    const nonCriticalScripts = [
      { src: '/js/analytics.js', async: true, defer: true },
      { src: '/js/advanced-features.js', async: true, defer: true }
    ];
    
    nonCriticalScripts.forEach((script) => {
      if (!document.querySelector(`script[src="${script.src}"]`)) {
        const scriptEl = document.createElement('script');
        scriptEl.src = script.src;
        if (script.async) scriptEl.async = true;
        if (script.defer) scriptEl.defer = true;
        document.body.appendChild(scriptEl);
      }
    });
  }, 2000); // Delay loading by 2 seconds
}

// Export individual functions for testing and specific use cases
export {
  registerPerformanceObservers,
  optimizeImageLoading,
  optimizeAnimations,
  deferNonCriticalResources
};
