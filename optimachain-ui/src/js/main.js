// OptimaChain - メインJavaScriptファイル
import '../css/styles.css';
import '../css/animations.css';
import '../css/header-footer.css';
import '../css/language-switcher.css';
import '../css/modern-design.css';
import '../css/branding.css';
import '../css/minimalist.css';
import '../css/tech-specs.css';
import '../css/dev-quickstart.css';
import '../css/research-papers.css';
import '../css/use-cases.css';
import '../css/partners.css';
import '../css/blog.css';
import '../css/error-handler.css';

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
import { initHeader, initNotificationBar, loadHeader } from './header.js';
import { initRouter } from './router.js';
import { initErrorHandling, ErrorUtils } from './error-handler.js';

// グローバルエラーハンドリングの設定
window.addEventListener('error', function(event) {
  console.error('グローバルエラーが捕捉されました:', event.error);
  
  // エラーレポートの送信（本番環境のみ）
  if (window.OPTIMACHAIN_CONFIG && window.OPTIMACHAIN_CONFIG.environment === 'production') {
    ErrorUtils.reportError(event.error);
  }
  
  // クリティカルなエラーの場合はユーザーに通知
  if (ErrorUtils.isCriticalError(event.error)) {
    ErrorUtils.showErrorNotification('アプリケーションでエラーが発生しました。ページを再読み込みしてください。');
  }
});

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', () => {
  console.log('OptimaChain - アプリケーション初期化');
  
  // エラーハンドリングの初期化
  initErrorHandling();
  
  // ヘッダーとフッターの挿入（index.htmlに直接記述されていない場合）
  try {
    if (!document.querySelector('header')) {
      // 新しいヘッダーシステムを使用
      const headerContainer = document.getElementById('header-container');
      if (headerContainer) {
        loadHeader('header-container');
      } else {
        // 従来のヘッダー挿入を使用
        insertHeader();
      }
    } else {
      // すでにヘッダーが存在する場合は初期化のみ
      initHeader();
      initNotificationBar();
    }
  } catch (error) {
    console.error('ヘッダーの初期化中にエラーが発生しました:', error);
    // 致命的ではないのでアプリケーションは続行
  }
  
  if (!document.querySelector('.main-footer')) {
    insertFooter();
  }
  
  // 各モジュールの初期化 - エラーハンドリング付き
  try {
    initRouter();
  } catch (error) {
    console.error('ルーターの初期化中にエラーが発生しました:', error);
  }
  
  try {
    initNavigation();
  } catch (error) {
    console.error('ナビゲーションの初期化中にエラーが発生しました:', error);
  }
  
  try {
    initLanguageSwitcher();
  } catch (error) {
    console.error('言語スイッチャーの初期化中にエラーが発生しました:', error);
  }
  
  try {
    initAnimations();
  } catch (error) {
    console.error('アニメーションの初期化中にエラーが発生しました:', error);
  }
  
  try {
    initValidatorSetup();
  } catch (error) {
    console.error('バリデータセットアップの初期化中にエラーが発生しました:', error);
  }
  
  // OS切り替え機能の初期化
  try {
    initOSSelector();
  } catch (error) {
    console.error('OS切り替え機能の初期化中にエラーが発生しました:', error);
  }
  
  // ブロックチェーンビジュアルの初期化（存在する場合）
  const blockchainCanvas = document.getElementById('blockchain-canvas');
  if (blockchainCanvas) {
    try {
      initBlockchainVisual(blockchainCanvas);
    } catch (error) {
      console.error('ブロックチェーンビジュアルの初期化中にエラーが発生しました:', error);
      // フォールバック: エラーメッセージを表示
      const container = blockchainCanvas.parentElement;
      if (container) {
        container.innerHTML = '<div class="error-container"><p>ビジュアライゼーションの読み込みに失敗しました。</p></div>';
      }
    }
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

// パフォーマンス最適化モジュールのインポート
import { initPerformanceOptimizations } from './performance.js';

// パフォーマンス最適化関数
function optimizePerformance() {
  // 新しいパフォーマンス最適化モジュールを使用
  if (typeof initPerformanceOptimizations === 'function') {
    initPerformanceOptimizations();
  } else {
    // フォールバック: 従来のパフォーマンス最適化
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
}

// OS切り替え機能
function initOSSelector() {
  const osButtons = document.querySelectorAll('.os-button');
  if (!osButtons.length) return;
  
  osButtons.forEach(button => {
    button.addEventListener('click', () => {
      // アクティブクラスを切り替え
      osButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      const os = button.getAttribute('data-os');
      
      // ターミナルコマンドを更新
      const terminalContent = document.querySelector('.terminal-content pre code');
      if (!terminalContent) return;
      
      let commands = '';
      
      if (os === 'linux') {
        commands = `<span class="comment"># OptimaChainをクローン</span>
<span class="command">git clone https://github.com/enablerdao/OptimaChain</span>
<span class="command">cd OptimaChain</span>

<span class="comment"># バリデータノードをセットアップ</span>
<span class="command">./scripts/validator-setup.sh</span>
<span class="output">OptimaChain バリデータノードをセットアップしています...</span>
<span class="output">依存関係をインストールしています...</span>
<span class="output">設定ファイルを生成しています...</span>
<span class="output">バリデータキーを生成しています...</span>
<span class="output">テストネットに接続しています...</span>
<span class="output">完了！バリデータノードが起動しました。</span>

<span class="comment"># ステータス確認</span>
<span class="command">optima-cli status</span>
<span class="output">ステータス: アクティブ</span>
<span class="output">ブロック高: 1,234,567</span>
<span class="output">同期: 100%</span>`;
      } else if (os === 'mac') {
        commands = `<span class="comment"># OptimaChainをクローン</span>
<span class="command">git clone https://github.com/enablerdao/OptimaChain</span>
<span class="command">cd OptimaChain</span>

<span class="comment"># Homebrewで依存関係をインストール</span>
<span class="command">brew install rust node</span>

<span class="comment"># バリデータノードをセットアップ</span>
<span class="command">./scripts/validator-setup.sh</span>
<span class="output">OptimaChain バリデータノードをセットアップしています...</span>
<span class="output">依存関係をインストールしています...</span>
<span class="output">設定ファイルを生成しています...</span>
<span class="output">バリデータキーを生成しています...</span>
<span class="output">テストネットに接続しています...</span>
<span class="output">完了！バリデータノードが起動しました。</span>

<span class="comment"># ステータス確認</span>
<span class="command">optima-cli status</span>`;
      } else if (os === 'windows') {
        commands = `<span class="comment"># OptimaChainをクローン</span>
<span class="command">git clone https://github.com/enablerdao/OptimaChain</span>
<span class="command">cd OptimaChain</span>

<span class="comment"># 依存関係をインストール</span>
<span class="command">powershell -ExecutionPolicy Bypass -File scripts\\install-deps.ps1</span>

<span class="comment"># バリデータノードをセットアップ</span>
<span class="command">powershell -ExecutionPolicy Bypass -File scripts\\validator-setup.ps1</span>
<span class="output">OptimaChain バリデータノードをセットアップしています...</span>
<span class="output">依存関係をインストールしています...</span>
<span class="output">設定ファイルを生成しています...</span>
<span class="output">バリデータキーを生成しています...</span>
<span class="output">テストネットに接続しています...</span>
<span class="output">完了！バリデータノードが起動しました。</span>

<span class="comment"># ステータス確認</span>
<span class="command">optima-cli.exe status</span>`;
      }
      
      terminalContent.innerHTML = commands;
    });
  });
}
