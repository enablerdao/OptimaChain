/**
 * OptimaChain - 言語切り替え機能
 * 
 * このスクリプトは、ウェブサイトの言語切り替え機能を提供します。
 * 言語設定はローカルストレージに保存され、ページ読み込み時に適用されます。
 */

class LanguageSwitcher {
    constructor() {
        this.currentLang = localStorage.getItem('optimachain-lang') || 'ja';
        this.translations = {};
        this.availableLanguages = [
            { code: 'en', name: 'English', nativeName: 'English' },
            { code: 'ja', name: 'Japanese', nativeName: '日本語' },
            { code: 'zh', name: 'Chinese', nativeName: '中文' },
            { code: 'ko', name: 'Korean', nativeName: '한국어' },
            { code: 'fr', name: 'French', nativeName: 'Français' },
            { code: 'es', name: 'Spanish', nativeName: 'Español' },
            { code: 'de', name: 'German', nativeName: 'Deutsch' },
            { code: 'it', name: 'Italian', nativeName: 'Italiano' },
            { code: 'ru', name: 'Russian', nativeName: 'Русский' }
        ];
        this.init();
    }

    async init() {
        // 言語オプションのイベントリスナーを設定
        const langOptions = document.querySelectorAll('.language-option');
        langOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = option.getAttribute('data-lang');
                this.switchLanguage(lang);
            });
        });

        // 言語ドロップダウンの動的生成
        this.generateLanguageDropdown();

        // 現在の言語を設定
        await this.loadTranslation(this.currentLang);
        this.updateLanguageUI();
        this.translatePage();

        // 言語が変更されたときのイベントを作成
        window.addEventListener('languageChanged', () => {
            this.translatePage();
            this.updateDynamicContent();
        });

        // ページタイトルとメタデータの更新
        this.updateDocumentMetadata();

        // イースターエッグの追加
        this.addEasterEggs();
    }

    generateLanguageDropdown() {
        const dropdown = document.querySelector('.language-dropdown');
        if (!dropdown) return;

        // 既存の言語オプションをクリア
        dropdown.innerHTML = '';

        // 利用可能な言語をドロップダウンに追加
        this.availableLanguages.forEach(lang => {
            const option = document.createElement('a');
            option.href = '#';
            option.className = 'language-option';
            option.setAttribute('data-lang', lang.code);
            if (lang.code === this.currentLang) {
                option.classList.add('active');
            }

            const flag = document.createElement('div');
            flag.className = `language-flag ${lang.code}`;
            
            const name = document.createElement('span');
            name.className = 'language-name';
            name.textContent = lang.nativeName;
            
            option.appendChild(flag);
            option.appendChild(name);
            dropdown.appendChild(option);
            
            // イベントリスナーを追加
            option.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchLanguage(lang.code);
            });
        });
    }

    async loadTranslation(lang) {
        try {
            const response = await fetch(`/js/lang/${lang}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load language file: ${lang}.json`);
            }
            this.translations = await response.json();
            return true;
        } catch (error) {
            console.error('Error loading translation:', error);
            // 英語をフォールバックとして使用
            if (lang !== 'en') {
                return this.loadTranslation('en');
            }
            return false;
        }
    }

    async switchLanguage(lang) {
        if (lang === this.currentLang) return;
        
        // 言語切り替えアニメーション
        document.body.classList.add('language-transition');
        
        const success = await this.loadTranslation(lang);
        if (success) {
            this.currentLang = lang;
            localStorage.setItem('optimachain-lang', lang);
            this.updateLanguageUI();
            this.translatePage();
            this.updateDocumentMetadata();
            this.updateDynamicContent();
            
            // 言語変更イベントをディスパッチ
            window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
            
            // ユーモアのあるメッセージをコンソールに表示
            this.showLanguageChangeMessage(lang);
        }
        
        // アニメーション終了後にクラスを削除
        setTimeout(() => {
            document.body.classList.remove('language-transition');
        }, 500);
    }

    updateLanguageUI() {
        // 現在の言語表示を更新
        const currentLangElement = document.querySelector('.current-language');
        if (currentLangElement) {
            currentLangElement.textContent = this.currentLang.toUpperCase();
        }

        // アクティブな言語オプションを更新
        const langOptions = document.querySelectorAll('.language-option');
        langOptions.forEach(option => {
            const optionLang = option.getAttribute('data-lang');
            if (optionLang === this.currentLang) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });

        // HTML言語属性を更新
        document.documentElement.lang = this.currentLang;
    }

    translatePage() {
        // data-i18n属性を持つすべての要素を翻訳
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getTranslation(key);
            
            if (translation) {
                if (element.tagName === 'INPUT' && element.getAttribute('type') === 'placeholder') {
                    element.placeholder = translation;
                } else {
                    // 特殊効果のためにテキストを一時的に保存
                    const originalText = element.textContent;
                    element.textContent = translation;
                    
                    // 重要な要素には変更アニメーションを追加
                    if (element.tagName === 'H1' || element.tagName === 'H2' || 
                        element.classList.contains('highlight-text')) {
                        this.animateTextChange(element, originalText, translation);
                    }
                }
            }
        });

        // data-i18n-attr属性を持つ要素の属性を翻訳
        const attrElements = document.querySelectorAll('[data-i18n-attr]');
        attrElements.forEach(element => {
            const data = element.getAttribute('data-i18n-attr').split(',');
            if (data.length === 2) {
                const [attr, key] = data;
                const translation = this.getTranslation(key);
                if (translation) {
                    element.setAttribute(attr, translation);
                }
            }
        });
        
        // data-i18n-html属性を持つ要素のHTMLを翻訳
        const htmlElements = document.querySelectorAll('[data-i18n-html]');
        htmlElements.forEach(element => {
            const key = element.getAttribute('data-i18n-html');
            const translation = this.getTranslation(key);
            if (translation) {
                element.innerHTML = translation;
            }
        });
    }

    animateTextChange(element, oldText, newText) {
        // テキスト変更アニメーション（オプション）
        element.classList.add('text-changing');
        setTimeout(() => {
            element.classList.remove('text-changing');
        }, 500);
    }

    getTranslation(key) {
        // ドット表記のキーを使って翻訳を取得（例: "nav.features"）
        const keys = key.split('.');
        let translation = this.translations;
        
        for (const k of keys) {
            if (translation && translation[k]) {
                translation = translation[k];
            } else {
                return null;
            }
        }
        
        return translation;
    }

    updateDocumentMetadata() {
        // ページタイトルの更新
        const titleKey = document.querySelector('meta[name="i18n-title"]')?.getAttribute('content');
        if (titleKey) {
            const translation = this.getTranslation(titleKey);
            if (translation) {
                document.title = translation;
            }
        }
        
        // メタディスクリプションの更新
        const descKey = document.querySelector('meta[name="i18n-description"]')?.getAttribute('content');
        if (descKey) {
            const translation = this.getTranslation(descKey);
            if (translation) {
                document.querySelector('meta[name="description"]').setAttribute('content', translation);
            }
        }
    }

    updateDynamicContent() {
        // 動的コンテンツの更新（チャート、グラフのラベルなど）
        if (window.updateChartLabels) {
            window.updateChartLabels(this.translations);
        }
        
        // 日付フォーマットの更新
        this.updateDateFormats();
    }

    updateDateFormats() {
        // 日付表示要素を更新
        document.querySelectorAll('[data-date-format]').forEach(element => {
            const timestamp = element.getAttribute('data-timestamp');
            if (timestamp) {
                const date = new Date(parseInt(timestamp));
                let formattedDate;
                
                // 言語に応じた日付フォーマット
                try {
                    formattedDate = new Intl.DateTimeFormat(this.currentLang, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }).format(date);
                } catch (e) {
                    formattedDate = date.toLocaleDateString();
                }
                
                element.textContent = formattedDate;
            }
        });
    }

    showLanguageChangeMessage(lang) {
        // 言語変更時のユーモアのあるメッセージ
        const messages = {
            'en': "🇬🇧 Welcome to the Queen's English! Tea and crumpets loading...",
            'ja': "🇯🇵 日本語へようこそ！寿司とアニメを準備中...",
            'zh': "🇨🇳 欢迎使用中文！正在加载功夫和点心...",
            'ko': "🇰🇷 한국어에 오신 것을 환영합니다! K-pop과 김치를 준비 중...",
            'fr': "🇫🇷 Bienvenue en français ! Chargement du vin et du fromage...",
            'es': "🇪🇸 ¡Bienvenido al español! Cargando paella y flamenco...",
            'de': "🇩🇪 Willkommen auf Deutsch! Bier und Bratwurst werden geladen...",
            'it': "🇮🇹 Benvenuto in italiano! Caricamento di pizza e pasta...",
            'ru': "🇷🇺 Добро пожаловать на русский! Загрузка водки и балалайки..."
        };
        
        console.log(messages[lang] || `Switched to ${lang}`);
    }

    addEasterEggs() {
        // コナミコード
        let konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        let konamiIndex = 0;
        
        document.addEventListener('keydown', (e) => {
            if (e.key === konamiCode[konamiIndex]) {
                konamiIndex++;
                if (konamiIndex === konamiCode.length) {
                    this.activateEasterEgg();
                    konamiIndex = 0;
                }
            } else {
                konamiIndex = 0;
            }
        });
        
        // ロゴをクリックしたときのイースターエッグ
        const logo = document.querySelector('.logo');
        if (logo) {
            let clickCount = 0;
            logo.addEventListener('click', (e) => {
                clickCount++;
                if (clickCount >= 10) {
                    e.preventDefault();
                    this.activateLogoEasterEgg();
                    clickCount = 0;
                }
            });
        }
    }

    activateEasterEgg() {
        // コナミコードのイースターエッグ
        document.body.classList.add('konami-mode');
        
        // 面白いメッセージを表示
        const eggMessage = document.createElement('div');
        eggMessage.className = 'easter-egg-message';
        eggMessage.textContent = "🎮 デベロッパーモード有効化！ブロックチェーンのパワーが解放されました！";
        document.body.appendChild(eggMessage);
        
        // 一時的なアニメーション効果
        setTimeout(() => {
            document.body.classList.remove('konami-mode');
            eggMessage.remove();
        }, 5000);
    }

    activateLogoEasterEgg() {
        // ロゴのイースターエッグ
        const logo = document.querySelector('.logo-mark');
        if (logo) {
            logo.classList.add('spin-logo');
            setTimeout(() => {
                logo.classList.remove('spin-logo');
            }, 2000);
        }
    }
}

// ページ読み込み時に言語切り替え機能を初期化
document.addEventListener('DOMContentLoaded', () => {
    window.languageSwitcher = new LanguageSwitcher();
});