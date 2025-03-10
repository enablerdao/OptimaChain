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

        // 現在の言語を設定
        await this.loadTranslation(this.currentLang);
        this.updateLanguageUI();
        this.translatePage();

        // 言語が変更されたときのイベントを作成
        window.addEventListener('languageChanged', () => {
            this.translatePage();
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
        
        const success = await this.loadTranslation(lang);
        if (success) {
            this.currentLang = lang;
            localStorage.setItem('optimachain-lang', lang);
            this.updateLanguageUI();
            this.translatePage();
            
            // 言語変更イベントをディスパッチ
            window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
        }
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
    }

    translatePage() {
        // data-i18n属性を持つすべての要素を翻訳
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getTranslation(key);
            
            if (translation) {
                if (element.tagName === 'INPUT' && element.type === 'placeholder') {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
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
}

// ページ読み込み時に言語切り替え機能を初期化
document.addEventListener('DOMContentLoaded', () => {
    window.languageSwitcher = new LanguageSwitcher();
});