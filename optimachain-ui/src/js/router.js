// OptimaChain Router Utility
// This module provides client-side routing functionality without .html extensions

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

// Initialize the router
export function initRouter() {
  // Handle clicks on links
  document.addEventListener('click', (e) => {
    // Find closest anchor tag
    const anchor = e.target.closest('a');
    if (!anchor) return;
    
    const href = anchor.getAttribute('href');
    
    // Skip external links, anchor links, and javascript: links
    if (!href || 
        href.startsWith('http') || 
        href.startsWith('#') || 
        href.startsWith('javascript:') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:')) {
      return;
    }
    
    // Prevent default link behavior
    e.preventDefault();
    
    // Navigate to the URL
    navigate(href);
  });
  
  // Handle browser back/forward buttons
  window.addEventListener('popstate', (e) => {
    // Get the current path
    const path = window.location.pathname;
    
    // Update the active link in the navigation
    updateActiveNavLink(path);
  });
  
  // Initialize on page load
  updateActiveNavLink(window.location.pathname);
}

// Navigate to a URL
export function navigate(url) {
  // Remove .html extension if present
  url = url.replace(/\.html$/, '');
  
  // Handle relative paths
  if (url.startsWith('./') || url.startsWith('../')) {
    // Convert relative path to absolute path
    const currentPath = window.location.pathname;
    const basePath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
    url = new URL(url, window.location.origin + basePath).pathname;
  }
  
  // Update browser history
  history.pushState(null, '', url);
  
  // Update the active link in the navigation
  updateActiveNavLink(url);
  
  // If this is a route that requires a page load, do it
  if (requiresPageLoad(url)) {
    const filePath = getFilePath(url);
    window.location.href = filePath;
  }
}

// Check if a route requires a full page load
function requiresPageLoad(url) {
  // Get the current path
  const currentPath = window.location.pathname;
  
  // If we're navigating between different sections (e.g., from /wallet to /dex),
  // we need a full page load
  const currentSection = currentPath.split('/')[1];
  const targetSection = url.split('/')[1];
  
  return currentSection !== targetSection;
}

// Get the file path for a route
function getFilePath(url) {
  // Remove leading slash if present
  const path = url.startsWith('/') ? url : '/' + url;
  
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

// Update the active link in the navigation
export function updateActiveNavLink(path) {
  // Remove leading slash if present
  path = path.startsWith('/') ? path : '/' + path;
  
  // Get all navigation links
  const navLinks = document.querySelectorAll('header nav a, .mobile-menu nav a');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    
    // Skip links without href
    if (!href) return;
    
    // Remove .html extension for comparison
    const cleanHref = href.replace(/\.html$/, '');
    
    // Check if this link matches the current path
    if (cleanHref === path || 
        (cleanHref !== '/' && path.startsWith(cleanHref)) ||
        (path === '/' && cleanHref === '/index')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Export the router functions
export default {
  initRouter,
  navigate,
  updateActiveNavLink
};
