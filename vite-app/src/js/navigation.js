// ナビゲーション機能
export function initNavigation() {
  // スクロール位置に基づいてヘッダーの状態を更新
  function updateHeaderState() {
    const header = document.querySelector('.main-header');
    if (!header) return;
    
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  
  // スクロールイベントリスナー
  window.addEventListener('scroll', updateHeaderState);
  
  // 初期状態の設定
  updateHeaderState();
  
  // スムーススクロール
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;
      
      // モバイルメニューが開いている場合は閉じる
      const mobileMenu = document.querySelector('.mobile-menu');
      const menuToggle = document.querySelector('.mobile-menu-toggle');
      
      if (mobileMenu && mobileMenu.classList.contains('active')) {
        mobileMenu.classList.remove('active');
        menuToggle.classList.remove('active');
      }
      
      // スムーススクロール
      window.scrollTo({
        top: targetElement.offsetTop - 80, // ヘッダーの高さを考慮
        behavior: 'smooth'
      });
    });
  });
  
  // アクティブなナビゲーションリンクの更新
  function updateActiveNavLinks() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.main-nav a, .mobile-menu a');
    
    let currentSection = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      
      if (window.scrollY >= sectionTop - 200 && window.scrollY < sectionTop + sectionHeight - 200) {
        currentSection = '#' + section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === currentSection) {
        link.classList.add('active');
      }
    });
  }
  
  // スクロール時にアクティブなリンクを更新
  window.addEventListener('scroll', updateActiveNavLinks);
  
  // 初期状態の設定
  updateActiveNavLinks();
  
  return {
    updateHeaderState,
    updateActiveNavLinks
  };
}