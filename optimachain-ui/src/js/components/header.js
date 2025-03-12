/**
 * Header Component
 * Handles the site header functionality including navigation, language switching, and mobile menu
 */

// Import dependencies
import { initLanguageSwitcher } from '../language-switcher.js';
import { initThemeManager } from '../theme-manager.js';

/**
 * Create header element
 * @returns {HTMLElement} Header element
 */
export function createHeader() {
  const header = document.createElement('header');
  header.className = 'main-header';
  
  header.innerHTML = `
    <div class="wrapper">
      <div class="header-container">
        <a href="/" class="logo">
          <div class="logo-mark">
            <div class="logo-hexagon"></div>
            <div class="logo-circle"></div>
          </div>
          <span class="logo-text">OptimaChain</span>
        </a>
        
        <nav class="main-nav">
          <ul>
            <li><a href="#features" data-i18n="nav.features">特徴</a></li>
            <li><a href="/technology" data-i18n="nav.technology">技術</a></li>
            <li><a href="/ecosystem" data-i18n="nav.ecosystem">エコシステム</a></li>
            <li><a href="/developers" data-i18n="nav.developers">開発者</a></li>
            <li><a href="/community" data-i18n="nav.community">コミュニティ</a></li>
            <li><a href="/token" data-i18n="nav.token">トークン</a></li>
            <li><a href="/roadmap">ロードマップ</a></li>
            <li><a href="/validator-dashboard.html" class="validator-link">バリデータ</a></li>
            <li><a href="/whitepaper" data-i18n="dropdown.whitepaper.title">ホワイトペーパー</a></li>
          </ul>
        </nav>
        
        <div class="header-actions">
          <div class="language-selector">
            <div class="language-toggle">
              <span class="current-language">JA</span>
              <span class="toggle-icon">▼</span>
            </div>
            <div class="language-dropdown"></div>
          </div>
          
          <div class="theme-toggle" aria-label="テーマ切り替え">
            <div class="toggle-track">
              <div class="toggle-sun"></div>
              <div class="toggle-moon"></div>
            </div>
          </div>
          
          <a href="/wallet" class="wallet-button" data-i18n="wallet.connect">ウォレット接続</a>
          
          <button class="mobile-menu-toggle" aria-label="メニュー" aria-expanded="false">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
      
      <div class="enabler-branding">
        <span class="powered-by">Powered by</span>
        <a href="https://enabler.dao" target="_blank" class="enabler-logo" rel="noopener">
          <svg id="logo-svg-2025" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 70" class="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="modernGradient-2025" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#22B6FF"/>
                <stop offset="100%" stop-color="#2BBCFF"/>
              </linearGradient>
              <linearGradient id="reverseGradient-2025" x1="100%" y1="0%" x2="0%" y2="0%">
                <stop offset="0%" stop-color="#2BBCFF"/>
                <stop offset="100%" stop-color="#22B6FF"/>
              </linearGradient>
              <linearGradient id="middleLineGradient-2025" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#22B6FF"/>
                <stop offset="100%" stop-color="#4CAF50"/>
              </linearGradient>
            </defs>
            <rect width="200" height="70" fill="#fff" fill-opacity="0"/>
            <rect x="15" y="25" width="60" height="3" rx="1.5" fill="url(#modernGradient-2025)"/>
            <rect x="15" y="33" width="37" height="3" rx="1.5" fill="url(#middleLineGradient-2025)"/>
            <rect x="15" y="41" width="60" height="3" rx="1.5" fill="url(#reverseGradient-2025)"/>
            <text x="90" y="40" font-family="Consolas, monospace" font-size="18" letter-spacing="0.5" font-weight="bold" fill="url(#modernGradient-2025)">ENABLER</text>
          </svg>
        </a>
      </div>
    </div>
  `;
  
  return header;
}

/**
 * Insert header into DOM
 */
export function insertHeader() {
  const body = document.body;
  const firstChild = body.firstChild;
  
  const header = createHeader();
  body.insertBefore(header, firstChild);
  
  // Add mobile menu
  const mobileMenu = document.createElement('div');
  mobileMenu.className = 'mobile-menu';
  mobileMenu.setAttribute('aria-hidden', 'true');
  mobileMenu.innerHTML = `
    <nav>
      <ul>
        <li><a href="#features" data-i18n="nav.features">特徴</a></li>
        <li><a href="/technology" data-i18n="nav.technology">技術</a></li>
        <li><a href="/ecosystem" data-i18n="nav.ecosystem">エコシステム</a></li>
        <li><a href="/developers" data-i18n="nav.developers">開発者</a></li>
        <li><a href="/community" data-i18n="nav.community">コミュニティ</a></li>
        <li><a href="/token" data-i18n="nav.token">トークン</a></li>
        <li><a href="/roadmap">ロードマップ</a></li>
        <li><a href="/validator-dashboard.html" class="validator-link">バリデータ</a></li>
        <li><a href="/whitepaper" data-i18n="dropdown.whitepaper.title">ホワイトペーパー</a></li>
      </ul>
    </nav>
  `;
  
  body.insertBefore(mobileMenu, header.nextSibling);
  
  // Add mobile menu toggle functionality
  const menuToggle = header.querySelector('.mobile-menu-toggle');
  menuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
    menuToggle.classList.toggle('active');
    
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', !isExpanded);
    mobileMenu.setAttribute('aria-hidden', isExpanded);
    
    // Toggle body scroll
    if (!isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });
  
  // Initialize language switcher
  if (typeof initLanguageSwitcher === 'function') {
    initLanguageSwitcher();
  }
  
  // Initialize theme manager
  if (typeof initThemeManager === 'function') {
    initThemeManager();
  }
  
  // Handle scroll effects
  let lastScrollTop = 0;
  
  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Add shadow and background when scrolled
    if (scrollTop > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    // Hide header when scrolling down, show when scrolling up
    if (scrollTop > lastScrollTop && scrollTop > 100) {
      header.classList.add('header-hidden');
    } else {
      header.classList.remove('header-hidden');
    }
    
    lastScrollTop = scrollTop;
  });
}

/**
 * Initialize the header component
 */
export function initHeader() {
  document.addEventListener('DOMContentLoaded', insertHeader);
}

export default { createHeader, insertHeader, initHeader };
