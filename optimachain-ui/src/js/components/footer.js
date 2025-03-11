/**
 * Footer Component
 * Handles the site footer functionality including navigation, social links, and copyright
 */

/**
 * Create footer element
 * @returns {HTMLElement} Footer element
 */
export function createFooter() {
  const footer = document.createElement('footer');
  footer.className = 'main-footer';
  
  // Get current year for copyright
  const currentYear = new Date().getFullYear();
  
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
          <p class="footer-tagline">次世代型分散型ブロックチェーンプラットフォーム</p>
        </div>
        
        <div class="footer-links">
          <div class="footer-column">
            <h3>リソース</h3>
            <ul>
              <li><a href="/whitepaper/index.html">ホワイトペーパー</a></li>
              <li><a href="/roadmap.html">ロードマップ</a></li>
              <li><a href="/token.html">トークン</a></li>
              <li><a href="/faq.html">よくある質問</a></li>
            </ul>
          </div>
          
          <div class="footer-column">
            <h3>開発者</h3>
            <ul>
              <li><a href="/developers.html">開発者ポータル</a></li>
              <li><a href="/docs">ドキュメント</a></li>
              <li><a href="/developers.html#testnet">テストネット</a></li>
              <li><a href="/validator-dashboard.html">バリデータ</a></li>
              <li><a href="https://github.com/enablerdao/OptimaChain" target="_blank" rel="noopener">GitHub</a></li>
            </ul>
          </div>
          
          <div class="footer-column">
            <h3>コミュニティ</h3>
            <ul>
              <li><a href="https://twitter.com/OptimaChain" target="_blank" rel="noopener">Twitter</a></li>
              <li><a href="https://discord.gg/optimachain" target="_blank" rel="noopener">Discord</a></li>
              <li><a href="https://t.me/optimachain" target="_blank" rel="noopener">Telegram</a></li>
              <li><a href="https://forum.optimachain.io" target="_blank" rel="noopener">フォーラム</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p class="copyright">© ${currentYear} OptimaChain by Enabler DAO. All rights reserved.</p>
        <div class="footer-social">
          <!-- Social links with rel="noopener" for security -->
          <a href="https://twitter.com/OptimaChain" target="_blank" rel="noopener" aria-label="Twitter">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 4.01C21 4.5 20.02 4.69 19 5C18.39 4.41 17.59 4.04 16.71 3.97C15.83 3.9 14.95 4.15 14.22 4.66C13.49 5.17 12.95 5.93 12.68 6.8C12.4 7.67 12.41 8.62 12.71 9.48C11.03 9.39 9.39 8.96 7.89 8.2C6.4 7.45 5.09 6.39 4.05 5.09C3.5 6.02 3.4 7.14 3.78 8.16C4.16 9.17 4.98 9.98 6.04 10.4C5.26 10.38 4.5 10.17 3.81 9.8V9.85C3.81 10.85 4.15 11.82 4.77 12.59C5.4 13.37 6.27 13.89 7.25 14.09C6.53 14.28 5.77 14.3 5.04 14.14C5.31 15.01 5.84 15.77 6.55 16.33C7.26 16.88 8.11 17.19 9 17.22C7.49 18.39 5.64 19.02 3.74 19.02C3.37 19.02 3.01 19 2.65 18.96C4.58 20.2 6.83 20.85 9.13 20.85C16.5 20.85 20.54 14.86 20.54 9.73C20.54 9.53 20.54 9.33 20.53 9.13C21.5 8.42 22.34 7.54 23 6.52C22.12 6.9 21.18 7.14 20.22 7.24C21.25 6.63 22.02 5.66 22.38 4.52L22 4.01Z" fill="currentColor"/>
            </svg>
          </a>
          <!-- Other social links -->
        </div>
      </div>
    </div>
  `;
  
  return footer;
}

/**
 * Insert footer into DOM
 */
export function insertFooter() {
  const body = document.body;
  body.appendChild(createFooter());
  
  // Handle newsletter form submission if it exists
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const emailInput = newsletterForm.querySelector('input[type="email"]');
      const submitButton = newsletterForm.querySelector('button[type="submit"]');
      const statusMessage = newsletterForm.querySelector('.status-message') || 
                           document.createElement('div');
      
      if (!statusMessage.classList.contains('status-message')) {
        statusMessage.classList.add('status-message');
        newsletterForm.appendChild(statusMessage);
      }
      
      // Validate email
      const email = emailInput.value.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        statusMessage.textContent = '有効なメールアドレスを入力してください';
        statusMessage.classList.add('error');
        return;
      }
      
      // Simulate API call
      try {
        emailInput.disabled = true;
        submitButton.disabled = true;
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        statusMessage.textContent = 'ニュースレターに登録しました！';
        statusMessage.classList.remove('error');
        statusMessage.classList.add('success');
        emailInput.value = '';
      } catch (error) {
        statusMessage.textContent = 'エラーが発生しました。後でもう一度お試しください。';
        statusMessage.classList.add('error');
        console.error('Newsletter error:', error);
      } finally {
        emailInput.disabled = false;
        submitButton.disabled = false;
      }
    });
  }
}

/**
 * Initialize the footer component
 */
export function initFooter() {
  document.addEventListener('DOMContentLoaded', insertFooter);
}

export default { createFooter, insertFooter, initFooter };
