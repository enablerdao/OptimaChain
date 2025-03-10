// OptimaChain - メインJavaScriptファイル
import '../css/styles.css';
import '../css/animations.css';
import '../css/header-footer.css';
import '../css/language-switcher.css';
import '../css/modern-design.css';
import '../css/branding.css';
import '../css/minimalist.css';

// 外部ライブラリのインポート
import * as THREE from 'three';
import Chart from 'chart.js/auto';

// コンポーネントのインポート
import { insertHeader } from './components/header.js';
import { insertFooter } from './components/footer.js';

// 内部モジュールのインポート
import { initBlockchainVisual } from './blockchain-visual.js';
import { initLanguageSwitcher } from './language-switcher.js';
import { initAnimations } from './animations.js';
import { initNavigation } from './navigation.js';
import { initValidatorSetup } from './validator-setup.js';

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', () => {
  console.log('OptimaChain - アプリケーション初期化');
  
  // ヘッダーとフッターの挿入（index.htmlに直接記述されていない場合）
  if (!document.querySelector('.main-header')) {
    insertHeader();
  }
  
  if (!document.querySelector('.main-footer')) {
    insertFooter();
  }
  
  // 各モジュールの初期化
  initNavigation();
  initLanguageSwitcher();
  initAnimations();
  initValidatorSetup();
  
  // ブロックチェーンビジュアルの初期化（存在する場合）
  const blockchainCanvas = document.getElementById('blockchain-canvas');
  if (blockchainCanvas) {
    initBlockchainVisual(blockchainCanvas);
  }
  
  // CTAのクリック率を計測
  document.querySelectorAll('.cta-btn, .primary-btn, .feature-cta-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      console.log('CTAクリック:', button.textContent.trim());
      // ここに分析ツールを追加可能
      trackCTAClick(button.textContent.trim(), button.href);
    });
  });
  
  // パフォーマンス最適化
  optimizePerformance();
  
  // テーマ切り替え機能
  initThemeToggle();
});

// CTAクリックの追跡
function trackCTAClick(buttonText, url) {
  // 分析ツールのコードをここに追加
  console.log(`CTA追跡: "${buttonText}" - URL: ${url}`);
  
  // 例: Google Analyticsイベント
  if (typeof gtag === 'function') {
    gtag('event', 'cta_click', {
      'event_category': 'engagement',
      'event_label': buttonText,
      'value': 1
    });
  }
}

// テーマ切り替え機能
function initThemeToggle() {
  const themeToggle = document.querySelector('.theme-toggle');
  if (!themeToggle) return;
  
  // 保存されたテーマを適用
  const savedTheme = localStorage.getItem('optimachain-theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  }
  
  // テーマ切り替えイベント
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    
    // テーマ設定を保存
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('optimachain-theme', isDarkMode ? 'dark' : 'light');
    
    // イベント発火
    window.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { theme: isDarkMode ? 'dark' : 'light' } 
    }));
  });
}

// パフォーマンス最適化関数
function optimizePerformance() {
  // 画像の遅延読み込み
  const lazyImages = document.querySelectorAll('img[data-src]');
  if (lazyImages.length > 0) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });
    
    lazyImages.forEach(img => {
      imageObserver.observe(img);
    });
  }
  
  // スクロールアニメーションの最適化
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  if (animatedElements.length > 0) {
    const animationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(element => {
      animationObserver.observe(element);
    });
  }
  
  // スクリプトの遅延読み込み
  setTimeout(() => {
    // 重いスクリプトを遅延読み込み
    const heavyScripts = [
      { src: '/js/analytics.js', async: true, defer: true },
      { src: '/js/advanced-features.js', async: true, defer: true }
    ];
    
    heavyScripts.forEach(script => {
      const scriptEl = document.createElement('script');
      scriptEl.src = script.src;
      if (script.async) scriptEl.async = true;
      if (script.defer) scriptEl.defer = true;
      document.body.appendChild(scriptEl);
    });
  }, 2000);
}
