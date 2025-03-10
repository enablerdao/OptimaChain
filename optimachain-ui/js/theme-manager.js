/**
 * OptimaChain - テーママネージャー
 * 
 * ライト/ダークモードの切り替えと管理を行うクラス
 */

class ThemeManager {
    constructor() {
        this.theme = 'light'; // デフォルトテーマ
        this.observers = []; // テーマ変更時に通知するオブザーバー
    }
    
    // 初期化
    init() {
        // システム設定を確認
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.theme = 'dark';
        }
        
        // ローカルストレージから設定を取得
        const storedTheme = localStorage.getItem('theme');
        
        if (storedTheme) {
            this.theme = storedTheme;
        }
        
        // テーマを適用
        this.applyTheme();
        
        // テーマ切り替えボタンの初期化
        this.initThemeToggle();
        
        // システムのテーマ変更を監視
        this.watchSystemTheme();
    }
    
    // テーマを適用
    applyTheme() {
        if (this.theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        
        // ローカルストレージに保存
        localStorage.setItem('theme', this.theme);
        
        // オブザーバーに通知
        this.notifyObservers();
    }
    
    // テーマを切り替え
    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
    }
    
    // テーマ切り替えボタンの初期化
    initThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        
        if (themeToggle) {
            // クリックイベントを設定
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }
    
    // システムのテーマ変更を監視
    watchSystemTheme() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            // 変更イベントを監視
            mediaQuery.addEventListener('change', (e) => {
                // ローカルストレージに設定がない場合のみ、システム設定に従う
                if (!localStorage.getItem('theme')) {
                    this.theme = e.matches ? 'dark' : 'light';
                    this.applyTheme();
                }
            });
        }
    }
    
    // オブザーバーを追加
    addObserver(callback) {
        if (typeof callback === 'function' && !this.observers.includes(callback)) {
            this.observers.push(callback);
        }
    }
    
    // オブザーバーを削除
    removeObserver(callback) {
        const index = this.observers.indexOf(callback);
        if (index !== -1) {
            this.observers.splice(index, 1);
        }
    }
    
    // オブザーバーに通知
    notifyObservers() {
        this.observers.forEach(callback => {
            try {
                callback(this.theme);
            } catch (error) {
                console.error('Error in theme change observer:', error);
            }
        });
    }
    
    // 現在のテーマを取得
    getCurrentTheme() {
        return this.theme;
    }
}

// グローバルインスタンスを作成
const themeManager = new ThemeManager();

// DOMが読み込まれたら初期化
document.addEventListener('DOMContentLoaded', () => {
    themeManager.init();
});

// グローバルに公開
window.themeManager = themeManager;