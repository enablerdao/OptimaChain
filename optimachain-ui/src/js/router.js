// OptimaChain Router Utility
// This module provides client-side routing functionality without .html extensions

import { loadRouteContent, getFilePath } from './content-loader.js';

// Initialize the router
function initRouter() {
  console.log('Initializing router...');
  
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
    
    // Load content for the path if state exists
    if (e.state && e.state.path) {
      loadRouteContent(e.state.path);
    } else {
      loadRouteContent(path);
    }
  });
  
  // Initialize on page load
  updateActiveNavLink(window.location.pathname);
  
  console.log('Router initialized');
}

// Navigate to a URL
function navigate(url) {
  console.log(`Navigating to: ${url}`);
  
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
  history.pushState({path: url}, '', url);
  
  // Update the active link in the navigation
  updateActiveNavLink(url);
  
  // If this is a route that requires a page load, do it
  if (requiresPageLoad(url)) {
    const filePath = getFilePath(url);
    window.location.href = filePath;
  } else {
    // Load content for the new route
    loadRouteContent(url);
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
  
  // Special cases that should always do a full page load
  const fullPageLoadSections = ['wallet', 'dex', 'validator-dashboard'];
  
  if (fullPageLoadSections.includes(targetSection) || 
      fullPageLoadSections.includes(currentSection)) {
    return true;
  }
  
  return currentSection !== targetSection;
}

// Update the active link in the navigation
function updateActiveNavLink(path) {
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
export { initRouter, navigate, updateActiveNavLink };

// Make router available globally
window.router = { initRouter, navigate, updateActiveNavLink };
