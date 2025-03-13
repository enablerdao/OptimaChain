/**
 * Mobile Menu Handler
 * Manages the mobile menu functionality
 */

/**
 * Initialize the mobile menu
 */
export function initMobileMenu() {
  console.log('Initializing mobile menu');
  
  // Wait for DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupMobileMenu);
  } else {
    setupMobileMenu();
  }
}

/**
 * Set up the mobile menu functionality
 */
function setupMobileMenu() {
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  
  if (!mobileMenuToggle || !mobileMenu) {
    console.warn('Mobile menu elements not found');
    return;
  }
  
  console.log('Mobile menu elements found:', mobileMenuToggle, mobileMenu);
  
  // Remove any existing event listeners
  const newMobileMenuToggle = mobileMenuToggle.cloneNode(true);
  mobileMenuToggle.parentNode.replaceChild(newMobileMenuToggle, mobileMenuToggle);
  
  // Add event listener to the new element
  newMobileMenuToggle.addEventListener('click', function(event) {
    event.preventDefault();
    console.log('Mobile menu toggle clicked');
    
    // Force toggle class to ensure it works
    if (mobileMenu.classList.contains('active')) {
      mobileMenu.classList.remove('active');
      newMobileMenuToggle.classList.remove('active');
      newMobileMenuToggle.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    } else {
      mobileMenu.classList.add('active');
      newMobileMenuToggle.classList.add('active');
      newMobileMenuToggle.setAttribute('aria-expanded', 'true');
      mobileMenu.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
    
    console.log('Mobile menu active after toggle:', mobileMenu.classList.contains('active'));
    
    // Toggle body scroll is now handled in the conditional blocks above
    
    // Highlight validator link in mobile menu
    const validatorLink = mobileMenu.querySelector('.validator-link');
    if (validatorLink) {
      validatorLink.classList.add('highlight');
      // Add subtle animation to draw attention
      setTimeout(() => {
        validatorLink.style.transform = 'scale(1.05)';
        setTimeout(() => {
          validatorLink.style.transform = '';
        }, 300);
      }, 300);
    }
  });
  
  // Ensure validator link is highlighted
  const validatorLink = mobileMenu.querySelector('.validator-link');
  if (validatorLink && !validatorLink.classList.contains('highlight')) {
    validatorLink.classList.add('highlight');
  }
}

// Initialize when script is loaded
initMobileMenu();

export default { initMobileMenu };
