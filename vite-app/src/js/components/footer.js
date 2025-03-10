// フッターコンポーネント
export function createFooter() {
  const footer = document.createElement('footer');
  footer.className = 'main-footer';
  
  footer.innerHTML = `
    <div class="wrapper">
      <div class="footer-top">
        <div class="footer-logo">
          <a href="/" class="logo">
            <div class="logo-mark">
              <div class="logo-hexagon"></div>
              <div class="logo-circle"></div>
            </div>
            <span class="logo-text">OptimaChain</span>
          </a>
          <p class="footer-tagline">革新的なスケーリング技術と高度なセキュリティを統合した次世代型分散型ブロックチェーンプラットフォーム</p>
          
          <div class="enabler-branding footer-enabler">
            <span class="powered-by">A project by</span>
            <a href="https://enabler.dao" target="_blank" class="enabler-logo">
              <svg id="logo-svg-2025-footer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 70" class="w-full h-full" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="modernGradient-2025-footer" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#22B6FF"/>
                    <stop offset="100%" stop-color="#2BBCFF"/>
                  </linearGradient>
                  <linearGradient id="reverseGradient-2025-footer" x1="100%" y1="0%" x2="0%" y2="0%">
                    <stop offset="0%" stop-color="#2BBCFF"/>
                    <stop offset="100%" stop-color="#22B6FF"/>
                  </linearGradient>
                  <linearGradient id="middleLineGradient-2025-footer" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#22B6FF"/>
                    <stop offset="100%" stop-color="#4CAF50"/>
                  </linearGradient>
                </defs>
                <rect width="200" height="70" fill="#fff" fill-opacity="0"/>
                <rect x="15" y="25" width="60" height="3" rx="1.5" fill="url(#modernGradient-2025-footer)"/>
                <rect x="15" y="33" width="37" height="3" rx="1.5" fill="url(#middleLineGradient-2025-footer)"/>
                <rect x="15" y="41" width="60" height="3" rx="1.5" fill="url(#reverseGradient-2025-footer)"/>
                <text x="90" y="40" font-family="Consolas, monospace" font-size="18" letter-spacing="0.5" font-weight="bold" fill="url(#modernGradient-2025-footer)">ENABLER</text>
              </svg>
            </a>
          </div>
        </div>
        
        <div class="footer-links">
          <div class="footer-column">
            <h3 data-i18n="footer.resources">リソース</h3>
            <ul>
              <li><a href="/whitepaper/OptimaChain_Whitepaper.html">ホワイトペーパー</a></li>
              <li><a href="/roadmap.html">ロードマップ</a></li>
              <li><a href="/faq.html">よくある質問</a></li>
              <li><a href="/blog">ブログ</a></li>
            </ul>
          </div>
          
          <div class="footer-column">
            <h3 data-i18n="footer.developers">開発者</h3>
            <ul>
              <li><a href="/developers.html">開発者ポータル</a></li>
              <li><a href="/docs">ドキュメント</a></li>
              <li><a href="/developers.html#testnet">テストネット</a></li>
              <li><a href="https://github.com/enablerdao/OptimaChain" target="_blank">GitHub</a></li>
            </ul>
          </div>
          
          <div class="footer-column">
            <h3 data-i18n="footer.community">コミュニティ</h3>
            <ul>
              <li><a href="https://twitter.com/OptimaChain" target="_blank">Twitter</a></li>
              <li><a href="https://discord.gg/optimachain" target="_blank">Discord</a></li>
              <li><a href="https://t.me/optimachain" target="_blank">Telegram</a></li>
              <li><a href="https://forum.optimachain.io" target="_blank">フォーラム</a></li>
            </ul>
          </div>
          
          <div class="footer-column">
            <h3 data-i18n="footer.about">会社情報</h3>
            <ul>
              <li><a href="/about.html">私たちについて</a></li>
              <li><a href="/careers.html">採用情報</a></li>
              <li><a href="/press.html">プレスキット</a></li>
              <li><a href="/contact.html">お問い合わせ</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p class="copyright" data-i18n="footer.copyright">© 2025 OptimaChain by Enabler DAO. All rights reserved.</p>
        <div class="footer-social">
          <a href="https://twitter.com/OptimaChain" target="_blank" aria-label="Twitter">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 4.01C21 4.5 20.02 4.69 19 5C18.39 4.41 17.59 4.04 16.71 3.97C15.83 3.9 14.95 4.15 14.22 4.66C13.49 5.17 12.95 5.93 12.68 6.8C12.4 7.67 12.41 8.62 12.71 9.48C11.03 9.39 9.39 8.96 7.89 8.2C6.4 7.45 5.09 6.39 4.05 5.09C3.5 6.02 3.4 7.14 3.78 8.16C4.16 9.17 4.98 9.98 6.04 10.4C5.26 10.38 4.5 10.17 3.81 9.8V9.85C3.81 10.85 4.15 11.82 4.77 12.59C5.4 13.37 6.27 13.89 7.25 14.09C6.53 14.28 5.77 14.3 5.04 14.14C5.31 15.01 5.84 15.77 6.55 16.33C7.26 16.88 8.11 17.19 9 17.22C7.49 18.39 5.64 19.02 3.74 19.02C3.37 19.02 3.01 19 2.65 18.96C4.58 20.2 6.83 20.85 9.13 20.85C16.5 20.85 20.54 14.86 20.54 9.73C20.54 9.53 20.54 9.33 20.53 9.13C21.5 8.42 22.34 7.54 23 6.52C22.12 6.9 21.18 7.14 20.22 7.24C21.25 6.63 22.02 5.66 22.38 4.52L22 4.01Z" fill="currentColor"/>
            </svg>
          </a>
          <a href="https://github.com/enablerdao/OptimaChain" target="_blank" aria-label="GitHub">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12C2 16.418 4.865 20.166 8.839 21.489C9.339 21.581 9.521 21.278 9.521 21.017C9.521 20.782 9.512 20.082 9.508 19.272C6.726 19.859 6.139 17.967 6.139 17.967C5.685 16.812 5.029 16.51 5.029 16.51C4.121 15.889 5.098 15.901 5.098 15.901C6.101 15.971 6.629 16.926 6.629 16.926C7.521 18.455 8.97 18.014 9.539 17.763C9.631 17.112 9.889 16.671 10.175 16.419C7.955 16.164 5.62 15.307 5.62 11.47C5.62 10.387 6.01 9.507 6.649 8.825C6.546 8.576 6.203 7.54 6.747 6.16C6.747 6.16 7.587 5.896 9.497 7.195C10.3 6.975 11.15 6.865 12 6.861C12.85 6.865 13.7 6.975 14.503 7.195C16.413 5.896 17.253 6.16 17.253 6.16C17.797 7.54 17.454 8.576 17.351 8.825C17.99 9.507 18.38 10.387 18.38 11.47C18.38 15.317 16.042 16.161 13.817 16.412C14.172 16.721 14.491 17.331 14.491 18.264C14.491 19.6 14.479 20.691 14.479 21.017C14.479 21.28 14.659 21.586 15.167 21.487C19.138 20.162 22 16.417 22 12C22 6.477 17.523 2 12 2Z" fill="currentColor"/>
            </svg>
          </a>
          <a href="https://discord.gg/optimachain" target="_blank" aria-label="Discord">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.317 4.37C18.7873 3.68 17.147 3.2 15.4319 3C15.1989 3.4 14.9159 4 14.7209 4.47C12.8609 4.28 11.0159 4.28 9.20787 4.47C9.01287 4 8.70787 3.4 8.46787 3C6.74987 3.2 5.10987 3.68 3.57987 4.37C1.48787 7.5 0.795866 10.57 1.13987 13.58C3.18787 15.14 5.17187 16.13 7.12187 16.77C7.58787 16.13 8.00087 15.45 8.33987 14.74C7.74987 14.51 7.18787 14.24 6.65987 13.92C6.83987 13.79 7.01287 13.66 7.17987 13.52C10.9129 15.24 14.9999 15.24 18.6799 13.52C18.8469 13.66 19.0199 13.79 19.1999 13.92C18.6699 14.24 18.1069 14.51 17.5169 14.74C17.8559 15.45 18.2689 16.13 18.7349 16.77C20.6849 16.13 22.6689 15.14 24.7169 13.58C25.1209 10.05 24.0149 7.01 22.0149 4.37H20.317ZM8.65987 11.93C7.58787 11.93 6.69987 10.94 6.69987 9.73C6.69987 8.52 7.55987 7.53 8.65987 7.53C9.75987 7.53 10.6199 8.52 10.5999 9.73C10.6019 10.94 9.75987 11.93 8.65987 11.93ZM15.3399 11.93C14.2679 11.93 13.3799 10.94 13.3799 9.73C13.3799 8.52 14.2399 7.53 15.3399 7.53C16.4399 7.53 17.2999 8.52 17.2799 9.73C17.2799 10.94 16.4399 11.93 15.3399 11.93Z" fill="currentColor"/>
            </svg>
          </a>
          <a href="https://t.me/optimachain" target="_blank" aria-label="Telegram">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.0717 3.32C21.7517 3.05 21.2717 2.92 20.6017 2.92C19.9917 2.92 19.2717 3.03 18.4417 3.24C17.6117 3.45 16.7217 3.74 15.7717 4.11C14.8217 4.48 13.8617 4.9 12.8917 5.37C11.9217 5.84 10.9917 6.34 10.0917 6.87C9.19172 7.4 8.36172 7.93 7.60172 8.46C6.84172 8.99 6.20172 9.49 5.68172 9.96C5.16172 10.43 4.80172 10.84 4.60172 11.19C4.40172 11.54 4.30172 11.77 4.30172 11.88C4.30172 11.99 4.40172 12.22 4.60172 12.57C4.80172 12.92 5.16172 13.33 5.68172 13.8C6.20172 14.27 6.84172 14.77 7.60172 15.3C8.36172 15.83 9.19172 16.36 10.0917 16.89C10.9917 17.42 11.9217 17.92 12.8917 18.39C13.8617 18.86 14.8217 19.28 15.7717 19.65C16.7217 20.02 17.6117 20.31 18.4417 20.52C19.2717 20.73 19.9917 20.84 20.6017 20.84C21.2717 20.84 21.7517 20.71 22.0417 20.44C22.3317 20.17 22.4717 19.77 22.4717 19.24V4.52C22.5017 3.99 22.3617 3.59 22.0717 3.32ZM19.5017 17.46C19.5017 17.57 19.4717 17.65 19.4117 17.7C19.3517 17.75 19.2717 17.78 19.1617 17.78C19.0517 17.78 18.9117 17.75 18.7417 17.7C18.5717 17.65 18.3717 17.57 18.1417 17.49C17.9117 17.41 17.6517 17.3 17.3617 17.17C17.0717 17.04 16.7517 16.89 16.4017 16.71C16.0517 16.53 15.6717 16.34 15.2617 16.13C14.8517 15.92 14.4117 15.69 13.9417 15.43C13.4717 15.17 12.9917 14.9 12.5017 14.61C12.0117 14.32 11.5217 14.01 11.0317 13.69C10.5417 13.37 10.0717 13.04 9.62172 12.7C9.17172 12.36 8.75172 12.03 8.36172 11.7C7.97172 11.37 7.63172 11.06 7.34172 10.77C7.05172 10.48 6.83172 10.22 6.68172 9.99C6.53172 9.76 6.45172 9.57 6.45172 9.42C6.45172 9.27 6.53172 9.08 6.68172 8.85C6.83172 8.62 7.05172 8.36 7.34172 8.07C7.63172 7.78 7.97172 7.47 8.36172 7.14C8.75172 6.81 9.17172 6.48 9.62172 6.14C10.0717 5.8 10.5417 5.47 11.0317 5.15C11.5217 4.83 12.0117 4.52 12.5017 4.23C12.9917 3.94 13.4717 3.67 13.9417 3.41C14.4117 3.15 14.8517 2.92 15.2617 2.71C15.6717 2.5 16.0517 2.31 16.4017 2.13C16.7517 1.95 17.0717 1.8 17.3617 1.67C17.6517 1.54 17.9117 1.43 18.1417 1.35C18.3717 1.27 18.5717 1.19 18.7417 1.14C18.9117 1.09 19.0517 1.06 19.1617 1.06C19.2717 1.06 19.3517 1.09 19.4117 1.14C19.4717 1.19 19.5017 1.27 19.5017 1.38V17.46Z" fill="currentColor"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  `;
  
  return footer;
}

// フッターをDOMに挿入する関数
export function insertFooter() {
  const body = document.body;
  body.appendChild(createFooter());
}

export default { createFooter, insertFooter };