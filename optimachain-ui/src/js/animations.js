// アニメーション機能
export function initAnimations() {
  // フェードインアニメーション
  function setupFadeInAnimations() {
    const fadeElements = document.querySelectorAll('.animate-fade-in');
    
    fadeElements.forEach(element => {
      // すでに表示されている場合はスキップ
      if (element.classList.contains('visible')) return;
      
      // 遅延時間の取得
      let delay = 0;
      if (element.classList.contains('delay-1')) delay = 100;
      if (element.classList.contains('delay-2')) delay = 200;
      if (element.classList.contains('delay-3')) delay = 300;
      if (element.classList.contains('delay-4')) delay = 400;
      if (element.classList.contains('delay-5')) delay = 500;
      
      // 遅延後に表示
      setTimeout(() => {
        element.classList.add('visible');
      }, delay);
    });
  }
  
  // スクロールアニメーション
  function setupScrollAnimations() {
    const scrollElements = document.querySelectorAll('.animate-on-scroll');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          
          // 一度表示されたら監視を解除（オプション）
          // observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1, // 10%表示されたらトリガー
      rootMargin: '0px 0px -100px 0px' // 下部に余裕を持たせる
    });
    
    scrollElements.forEach(element => {
      observer.observe(element);
    });
  }
  
  // カウントアップアニメーション
  function setupCountUpAnimations() {
    const countElements = document.querySelectorAll('.count-up');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          const target = parseInt(entry.target.getAttribute('data-target'), 10);
          const duration = parseInt(entry.target.getAttribute('data-duration') || '2000', 10);
          const increment = target / (duration / 16); // 60fpsを想定
          
          let current = 0;
          entry.target.classList.add('counted');
          
          const updateCount = () => {
            current += increment;
            if (current < target) {
              entry.target.textContent = Math.ceil(current).toLocaleString();
              requestAnimationFrame(updateCount);
            } else {
              entry.target.textContent = target.toLocaleString();
            }
          };
          
          updateCount();
        }
      });
    }, { threshold: 0.5 });
    
    countElements.forEach(element => {
      observer.observe(element);
    });
  }
  
  // タイピングアニメーション
  function setupTypingAnimations() {
    const typingElements = document.querySelectorAll('.typing-animation');
    
    typingElements.forEach(element => {
      const text = element.textContent;
      element.textContent = '';
      element.style.visibility = 'visible';
      
      let charIndex = 0;
      const typingSpeed = parseInt(element.getAttribute('data-speed') || '100', 10);
      
      function typeChar() {
        if (charIndex < text.length) {
          element.textContent += text.charAt(charIndex);
          charIndex++;
          setTimeout(typeChar, typingSpeed);
        } else {
          element.classList.add('typing-complete');
        }
      }
      
      // 要素が表示されたらタイピング開始
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !element.classList.contains('typing-started')) {
            element.classList.add('typing-started');
            setTimeout(typeChar, 500); // 少し遅延してから開始
          }
        });
      }, { threshold: 0.5 });
      
      observer.observe(element);
    });
  }
  
  // グリッチエフェクト
  function setupGlitchEffects() {
    const glitchElements = document.querySelectorAll('.glitch-text');
    
    glitchElements.forEach(element => {
      // データ属性からテキストを取得、なければ要素のテキストを使用
      const text = element.getAttribute('data-text') || element.textContent;
      
      // グリッチエフェクトをランダムに適用
      function applyGlitch() {
        if (Math.random() > 0.9) { // 10%の確率でグリッチ
          element.classList.add('glitching');
          
          setTimeout(() => {
            element.classList.remove('glitching');
          }, 100 + Math.random() * 200);
        }
        
        // 次のグリッチまでの時間をランダムに設定
        setTimeout(applyGlitch, 2000 + Math.random() * 5000);
      }
      
      // グリッチ開始
      setTimeout(applyGlitch, 2000 + Math.random() * 3000);
    });
  }
  
  // 各アニメーションの初期化
  setupFadeInAnimations();
  setupScrollAnimations();
  setupCountUpAnimations();
  setupTypingAnimations();
  setupGlitchEffects();
  
  // ウィンドウがリサイズされたときに再計算
  window.addEventListener('resize', () => {
    setupScrollAnimations();
  });
  
  return {
    setupFadeInAnimations,
    setupScrollAnimations,
    setupCountUpAnimations,
    setupTypingAnimations,
    setupGlitchEffects
  };
}