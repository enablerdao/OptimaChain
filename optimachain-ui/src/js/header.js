/**
 * OptimaChain ヘッダーコンポーネント
 * 
 * このスクリプトはサイト全体で一貫したヘッダーを提供します。
 */

// ヘッダーの初期化
export function initHeader() {
  // モバイルメニュートグルの設定
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  
  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileMenuToggle.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.classList.toggle('menu-open');
    });
  }
  
  // 言語ドロップダウンの設定
  const langDropdown = document.querySelector('.language-dropdown');
  const langSelector = document.querySelector('.language-selector');
  
  if (langSelector && langDropdown) {
    langSelector.addEventListener('click', (e) => {
      e.preventDefault();
      langDropdown.classList.toggle('active');
    });
    
    // 言語選択時の処理
    const langOptions = document.querySelectorAll('.language-option');
    langOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        e.preventDefault();
        const lang = option.getAttribute('data-lang');
        // 言語切り替え処理をここに実装
        console.log(`言語を${lang}に切り替えました`);
        langDropdown.classList.remove('active');
      });
    });
    
    // 外部クリックで閉じる
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.language-selector') && !e.target.closest('.language-dropdown')) {
        langDropdown.classList.remove('active');
      }
    });
  }
  
  // ドロップダウンメニューの設定
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
  
  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const dropdown = toggle.nextElementSibling;
      
      // 他のドロップダウンを閉じる
      dropdownToggles.forEach(otherToggle => {
        if (otherToggle !== toggle) {
          otherToggle.nextElementSibling.classList.remove('active');
        }
      });
      
      dropdown.classList.toggle('active');
    });
  });
  
  // 外部クリックでドロップダウンを閉じる
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown-toggle') && !e.target.closest('.dropdown-menu')) {
      document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.remove('active');
      });
    }
  });
  
  // テーマ切り替えの設定
  const themeToggle = document.querySelector('.theme-toggle');
  
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      
      // ローカルストレージに設定を保存
      const isDarkMode = document.body.classList.contains('dark-mode');
      localStorage.setItem('darkMode', isDarkMode);
    });
    
    // 保存された設定を読み込む
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    if (savedDarkMode) {
      document.body.classList.add('dark-mode');
    }
  }
  
  // スクロール時のヘッダー挙動
  let lastScrollTop = 0;
  const header = document.querySelector('header');
  
  if (header) {
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      if (scrollTop > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      
      if (scrollTop > lastScrollTop && scrollTop > 200) {
        header.classList.add('header-hidden');
      } else {
        header.classList.remove('header-hidden');
      }
      
      lastScrollTop = scrollTop;
    });
  }
  
  // 現在のページをハイライト
  highlightCurrentPage();
}

// 現在のページをナビゲーションでハイライト
function highlightCurrentPage() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('header nav a, .mobile-menu nav a');
  
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    
    // 完全一致または現在のパスがリンクパスで始まる場合（サブページの場合）
    if (linkPath === currentPath || 
        (linkPath !== '/' && currentPath.startsWith(linkPath)) ||
        (currentPath === '/' && linkPath === '/index.html')) {
      link.classList.add('active');
      
      // 親要素がドロップダウンの場合、親リンクもアクティブに
      const parentLi = link.closest('li');
      if (parentLi && parentLi.parentElement.classList.contains('dropdown-menu')) {
        const parentDropdown = parentLi.parentElement.previousElementSibling;
        if (parentDropdown) {
          parentDropdown.classList.add('active');
        }
      }
    } else {
      link.classList.remove('active');
    }
  });
}

// 通知バーの設定
export function initNotificationBar() {
  const notificationBar = document.querySelector('.notification-bar');
  const closeButton = document.querySelector('.notification-close');
  
  if (notificationBar && closeButton) {
    // 閉じるボタンのイベント
    closeButton.addEventListener('click', () => {
      notificationBar.classList.add('hidden');
      
      // 24時間非表示にする
      const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000);
      localStorage.setItem('notificationHidden', expiryTime);
    });
    
    // 保存された設定を確認
    const hiddenUntil = localStorage.getItem('notificationHidden');
    if (hiddenUntil && new Date().getTime() < parseInt(hiddenUntil)) {
      notificationBar.classList.add('hidden');
    } else {
      notificationBar.classList.remove('hidden');
    }
  }
}

// ヘッダーの読み込み
export async function loadHeader(containerId) {
  try {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const response = await fetch('/src/templates/header.html');
    const html = await response.text();
    
    container.innerHTML = html;
    
    // ヘッダーの初期化
    initHeader();
    initNotificationBar();
  } catch (error) {
    console.error('ヘッダーの読み込みに失敗しました:', error);
  }
}

// DOMが読み込まれたら実行
document.addEventListener('DOMContentLoaded', () => {
  // すでにヘッダーがHTMLに含まれている場合は初期化のみ
  if (document.querySelector('header')) {
    initHeader();
    initNotificationBar();
  }
});