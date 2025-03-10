// ヘッダーコンポーネント
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
            <li><a href="/technology.html" data-i18n="nav.technology">技術</a></li>
            <li><a href="/ecosystem.html" data-i18n="nav.ecosystem">エコシステム</a></li>
            <li><a href="/developers.html" data-i18n="nav.developers">開発者</a></li>
            <li><a href="/community.html" data-i18n="nav.community">コミュニティ</a></li>
            <li><a href="/token.html" data-i18n="nav.token">トークン</a></li>
            <li><a href="/roadmap.html">ロードマップ</a></li>
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
          
          <a href="/wallet.html" class="wallet-button" data-i18n="wallet.connect">ウォレット接続</a>
          
          <button class="mobile-menu-toggle" aria-label="メニュー">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
      
      <div class="enabler-branding">
        <span class="powered-by">Powered by</span>
        <a href="https://enabler.dao" target="_blank" class="enabler-logo">
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

// ヘッダーをDOMに挿入する関数
export function insertHeader() {
  const body = document.body;
  const firstChild = body.firstChild;
  
  const header = createHeader();
  body.insertBefore(header, firstChild);
  
  // モバイルメニューも追加
  const mobileMenu = document.createElement('div');
  mobileMenu.className = 'mobile-menu';
  mobileMenu.innerHTML = `
    <nav>
      <ul>
        <li><a href="#features" data-i18n="nav.features">特徴</a></li>
        <li><a href="/technology.html" data-i18n="nav.technology">技術</a></li>
        <li><a href="/ecosystem.html" data-i18n="nav.ecosystem">エコシステム</a></li>
        <li><a href="/developers.html" data-i18n="nav.developers">開発者</a></li>
        <li><a href="/community.html" data-i18n="nav.community">コミュニティ</a></li>
        <li><a href="/token.html" data-i18n="nav.token">トークン</a></li>
        <li><a href="/roadmap.html">ロードマップ</a></li>
        <li><a href="/whitepaper/OptimaChain_Whitepaper.html" data-i18n="dropdown.whitepaper.title">ホワイトペーパー</a></li>
      </ul>
    </nav>
  `;
  
  body.insertBefore(mobileMenu, header.nextSibling);
  
  // モバイルメニュートグルの機能を追加
  const menuToggle = header.querySelector('.mobile-menu-toggle');
  menuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
    menuToggle.classList.toggle('active');
  });
}

export default { createHeader, insertHeader };