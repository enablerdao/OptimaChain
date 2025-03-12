/**
 * Theme Manager Module
 * Handles theme switching functionality for the site
 */

// Theme options
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
};

// Default theme
const DEFAULT_THEME = THEMES.LIGHT;

/**
 * Initialize the theme manager
 */
export function initThemeManager() {
  const themeToggle = document.querySelector('.theme-toggle');
  
  if (!themeToggle) return;
  
  // Get current theme from localStorage or use system preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const currentTheme = savedTheme || (prefersDark ? THEMES.DARK : DEFAULT_THEME);
  
  // Apply current theme
  applyTheme(currentTheme);
  
  // Update toggle state
  updateToggleState(currentTheme);
  
  // Add event listener to toggle
  themeToggle.addEventListener('click', () => {
    const newTheme = document.documentElement.classList.contains(THEMES.DARK) 
      ? THEMES.LIGHT 
      : THEMES.DARK;
    
    applyTheme(newTheme);
    updateToggleState(newTheme);
    localStorage.setItem('theme', newTheme);
  });
  
  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      const newTheme = e.matches ? THEMES.DARK : THEMES.LIGHT;
      applyTheme(newTheme);
      updateToggleState(newTheme);
    }
  });
}

/**
 * Apply theme to document
 * @param {string} theme - Theme name
 */
function applyTheme(theme) {
  if (theme === THEMES.DARK) {
    document.documentElement.classList.add(THEMES.DARK);
  } else {
    document.documentElement.classList.remove(THEMES.DARK);
  }
  
  // Update meta theme-color
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute(
      'content', 
      theme === THEMES.DARK ? '#121212' : '#0066ff'
    );
  }
}

/**
 * Update toggle button state
 * @param {string} theme - Theme name
 */
function updateToggleState(theme) {
  const themeToggle = document.querySelector('.theme-toggle');
  if (!themeToggle) return;
  
  if (theme === THEMES.DARK) {
    themeToggle.classList.add('dark');
    themeToggle.setAttribute('aria-label', 'ライトモードに切り替え');
  } else {
    themeToggle.classList.remove('dark');
    themeToggle.setAttribute('aria-label', 'ダークモードに切り替え');
  }
}

export default { initThemeManager };
