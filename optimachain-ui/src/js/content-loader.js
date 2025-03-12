/**
 * Content Loader Module
 * Provides functionality for loading content dynamically
 */

// Get the file path for a route
function getFilePath(url) {
  // Remove leading slash if present
  const path = url.startsWith('/') ? url : '/' + url;
  
  // Map of routes to their corresponding file paths
  const routes = {
    '/': '/index.html',
    '/wallet': '/wallet/index.html',
    '/dex': '/dex/index.html',
    '/login': '/login.html',
    '/technology': '/technology.html',
    '/ecosystem': '/ecosystem.html',
    '/developers': '/developers.html',
    '/community': '/community.html',
    '/token': '/token.html',
    '/roadmap': '/roadmap.html',
    '/whitepaper': '/whitepaper/index.html',
    '/validator-dashboard': '/validator-dashboard.html',
    '/faq': '/faq.html',
    '/blog': '/blog/index.html'
  };
  
  // Check if we have a direct mapping
  if (routes[path]) {
    return routes[path];
  }
  
  // Handle nested paths
  for (const route in routes) {
    if (path.startsWith(route) && route !== '/') {
      return routes[route].replace('.html', '') + path.substring(route.length) + '.html';
    }
  }
  
  // Default to adding .html extension
  return path + '.html';
}

// Load content for a route
async function loadRouteContent(url) {
  // Get the file path for the route
  const filePath = getFilePath(url);
  
  try {
    // Fetch the HTML content
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to load ${filePath}: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Create a temporary element to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Extract the main content
    const mainContent = tempDiv.querySelector('main') || 
                        tempDiv.querySelector('.main-content') || 
                        tempDiv.querySelector('.content');
    
    if (!mainContent) {
      console.error('Could not find main content in the loaded page');
      // If content not found, reload the page
      window.location.href = filePath;
      return;
    }
    
    // Replace the current main content
    const currentMain = document.querySelector('main') || 
                        document.querySelector('.main-content') || 
                        document.querySelector('.content');
    
    if (currentMain) {
      // Save scroll position
      const scrollPosition = window.scrollY;
      
      // Replace content
      currentMain.innerHTML = mainContent.innerHTML;
      
      // Initialize any scripts for the new content
      initPageScripts(url);
      
      // Restore scroll position for same-page navigation or go to top for new pages
      if (url.includes('#')) {
        // Handle anchor links
        const anchor = url.split('#')[1];
        const element = document.getElementById(anchor);
        if (element) {
          element.scrollIntoView();
        }
      } else {
        window.scrollTo(0, 0);
      }
      
      // Update document title if available
      const newTitle = tempDiv.querySelector('title');
      if (newTitle) {
        document.title = newTitle.textContent;
      }
    } else {
      console.error('Could not find main content container in the current page');
      // Fallback to full page load
      window.location.href = filePath;
    }
  } catch (error) {
    console.error('Error loading route content:', error);
    // Fallback to full page load on error
    window.location.href = filePath;
  }
}

// Initialize page-specific scripts
function initPageScripts(url) {
  // Re-initialize components based on the current page
  if (url === '/' || url === '/index') {
    // Homepage scripts
    const blockchainCanvas = document.getElementById('blockchain-canvas');
    if (blockchainCanvas && typeof window.initBlockchainVisual === 'function') {
      window.initBlockchainVisual(blockchainCanvas);
    }
    
    if (typeof window.initAnimations === 'function') {
      window.initAnimations();
    }
    
    if (typeof window.initOSSelector === 'function') {
      window.initOSSelector();
    }
  }
  
  // Initialize common components
  if (typeof window.initMobileMenu === 'function') {
    window.initMobileMenu();
  }
  
  // Reinitialize i18n if available
  if (typeof window.initI18n === 'function') {
    window.initI18n();
  }
  
  // Dispatch a custom event for other modules to listen to
  document.dispatchEvent(new CustomEvent('contentLoaded', { detail: { url } }));
}

// Export functions
export { loadRouteContent, getFilePath, initPageScripts };
