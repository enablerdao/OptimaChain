/**
 * OptimaChain - メインJavaScript
 * 
 * ウェブサイトの主要な機能とインタラクションを管理
 */

document.addEventListener('DOMContentLoaded', function() {
    // アニメーション付きセクション
    initSectionAnimations();
    
    // TPSカウンターアニメーション
    initTPSCounter();
    
    // トグルセクション
    initToggleSections();
    
    // 通知バー
    initNotificationBar();
    
    // スムーズスクロール
    initSmoothScroll();
    
    // スティッキーヘッダー
    initStickyHeader();
    
    // モバイルメニュー
    initMobileMenu();
    
    // 3Dティルトエフェクト
    initTiltEffect();
    
    // タブ切り替え
    initTabs();
    
    // カウントアップアニメーション
    initCountUp();
    
    // チャート初期化
    initCharts();
    
    // 言語切り替え
    initLanguageSelector();
    
    // ウォレット接続
    initWalletConnect();
});

// セクションアニメーション
function initSectionAnimations() {
    const sections = document.querySelectorAll('.animate-on-scroll');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    
    sections.forEach(section => {
        observer.observe(section);
    });
}

// TPSカウンターアニメーション
function initTPSCounter() {
    const tpsElement = document.getElementById('tps-counter');
    if (tpsElement) {
        let count = 0;
        const targetTPS = 50000;
        const duration = 2000; // 2秒
        const interval = 20; // 20msごとに更新
        const steps = duration / interval;
        const increment = targetTPS / steps;
        
        const tpsCounter = setInterval(() => {
            count += increment;
            if (count >= targetTPS) {
                count = targetTPS;
                clearInterval(tpsCounter);
            }
            tpsElement.textContent = Math.floor(count).toLocaleString();
        }, interval);
    }
}

// トグルセクション
function initToggleSections() {
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);
            
            if (targetContent.classList.contains('open')) {
                targetContent.classList.remove('open');
                this.textContent = '詳細を表示';
            } else {
                targetContent.classList.add('open');
                this.textContent = '閉じる';
            }
        });
    });
}

// 通知バー
function initNotificationBar() {
    const notificationBar = document.querySelector('.notification-bar');
    const closeButton = document.querySelector('.notification-close');
    
    if (closeButton && notificationBar) {
        closeButton.addEventListener('click', function() {
            notificationBar.style.display = 'none';
        });
    }
}

// スムーズスクロール
function initSmoothScroll() {
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // 同一ページ内リンクのみ適用
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    // モバイルメニューを閉じる
                    const mobileMenu = document.querySelector('.mobile-menu');
                    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
                    
                    if (mobileMenu && mobileMenu.classList.contains('open')) {
                        mobileMenu.classList.remove('open');
                        mobileMenuBtn.classList.remove('active');
                    }
                    
                    // スクロール
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// スティッキーヘッダー
function initStickyHeader() {
    const header = document.querySelector('header');
    let lastScrollTop = 0;
    let scrollThreshold = 50; // スクロールしきい値
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // スクロール方向を検出
        if (scrollTop > lastScrollTop && scrollTop > scrollThreshold) {
            // 下スクロールで、しきい値を超えた場合
            header.classList.add('header-hidden');
        } else {
            // 上スクロールまたはページ上部
            header.classList.remove('header-hidden');
        }
        
        // ヘッダーの背景色を調整
        if (scrollTop > 10) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, { passive: true });
}

// モバイルメニュー
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            mobileMenu.classList.toggle('open');
        });
    }
    
    // Mobile dropdown toggles
    const mobileDropdownToggles = document.querySelectorAll('.mobile-dropdown-toggle');
    mobileDropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            const parent = this.parentElement;
            parent.classList.toggle('open');
        });
    });
}

// 3Dティルトエフェクト
function initTiltEffect() {
    const tiltElements = document.querySelectorAll('.tilt-effect');
    
    tiltElements.forEach(element => {
        element.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const deltaX = (x - centerX) / centerX;
            const deltaY = (y - centerY) / centerY;
            
            this.style.transform = `perspective(1000px) rotateX(${-deltaY * 10}deg) rotateY(${deltaX * 10}deg)`;
            
            const inner = this.querySelector('.tilt-inner');
            if (inner) {
                inner.style.transform = `translateZ(20px)`;
            }
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
            
            const inner = this.querySelector('.tilt-inner');
            if (inner) {
                inner.style.transform = 'translateZ(0)';
            }
        });
    });
}

// タブ切り替え
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.visual-item');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            
            // タブボタンのアクティブ状態を切り替え
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // タブコンテンツの表示を切り替え
            tabContents.forEach(content => {
                if (content.id === target) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        });
    });
}

// カウントアップアニメーション
function initCountUp() {
    const countElements = document.querySelectorAll('.count-up');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const target = parseInt(element.getAttribute('data-count'));
                let count = 0;
                const duration = 2000; // 2秒
                const interval = 20; // 20msごとに更新
                const steps = duration / interval;
                const increment = target / steps;
                
                const counter = setInterval(() => {
                    count += increment;
                    if (count >= target) {
                        count = target;
                        clearInterval(counter);
                    }
                    element.textContent = Math.floor(count).toLocaleString();
                }, interval);
                
                observer.unobserve(element);
            }
        });
    }, { threshold: 0.1 });
    
    countElements.forEach(element => {
        observer.observe(element);
    });
}

// チャート初期化
function initCharts() {
    // パフォーマンス比較チャート
    const performanceChart = document.getElementById('performance-chart');
    if (performanceChart && window.Chart) {
        new Chart(performanceChart, {
            type: 'bar',
            data: {
                labels: ['TPS', 'ファイナリティ', 'ガス費用', 'スケーラビリティ', 'セキュリティ'],
                datasets: [
                    {
                        label: 'OptimaChain',
                        data: [50000, 1, 0.001, 95, 98],
                        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim()
                    },
                    {
                        label: 'Ethereum',
                        data: [15, 60, 5, 70, 90],
                        backgroundColor: '#627eea'
                    },
                    {
                        label: 'Solana',
                        data: [65000, 0.4, 0.0001, 85, 80],
                        backgroundColor: '#14f195'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// 言語セレクター
function initLanguageSelector() {
    const languageOptions = document.querySelectorAll('.language-option');
    
    languageOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            
            const lang = this.getAttribute('data-lang');
            
            // アクティブクラスを切り替え
            languageOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            // 現在の言語表示を更新
            const currentLang = document.querySelector('.current-language');
            if (currentLang) {
                currentLang.textContent = lang.toUpperCase();
            }
            
            // ここで言語切り替えの処理を実装
            // 実際のアプリケーションでは、i18nライブラリなどを使用
            console.log(`言語を${lang}に切り替えました`);
        });
    });
}

// ウォレット接続
function initWalletConnect() {
    const connectWalletBtn = document.querySelector('.connect-wallet-btn');
    
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', function() {
            // ウォレット接続のモーダルを表示
            const walletModal = document.getElementById('wallet-modal');
            if (walletModal) {
                walletModal.classList.add('open');
            }
        });
        
        // モーダルを閉じるボタン
        const closeModalBtn = document.querySelector('.close-modal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', function() {
                const walletModal = document.getElementById('wallet-modal');
                if (walletModal) {
                    walletModal.classList.remove('open');
                }
            });
        }
        
        // ウォレットオプション
        const walletOptions = document.querySelectorAll('.wallet-option');
        walletOptions.forEach(option => {
            option.addEventListener('click', function() {
                const walletType = this.getAttribute('data-wallet');
                
                // ここでウォレット接続のロジックを実装
                console.log(`${walletType}に接続しています...`);
                
                // 接続中の表示
                this.classList.add('connecting');
                this.querySelector('.wallet-status').textContent = '接続中...';
                
                // 接続成功をシミュレート
                setTimeout(() => {
                    this.classList.remove('connecting');
                    this.classList.add('connected');
                    this.querySelector('.wallet-status').textContent = '接続済み';
                    
                    // ボタンのテキストを更新
                    connectWalletBtn.innerHTML = `
                        <span class="btn-icon">✓</span>
                        <span>0x7a...3f9</span>
                    `;
                    
                    // モーダルを閉じる
                    const walletModal = document.getElementById('wallet-modal');
                    if (walletModal) {
                        setTimeout(() => {
                            walletModal.classList.remove('open');
                        }, 1000);
                    }
                }, 2000);
            });
        });
    }
}
