// 言語切り替え機能
export function initLanguageSwitcher() {
  // 言語データ
  const languages = [
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' }
  ];
  
  // 現在の言語を取得（ローカルストレージまたはブラウザ設定から）
  let currentLang = localStorage.getItem('optimachain-lang') || 'ja';
  
  // 言語切り替えドロップダウンの作成
  function createLanguageDropdown() {
    const dropdown = document.querySelector('.language-dropdown');
    if (!dropdown) return;
    
    // ドロップダウンの内容をクリア
    dropdown.innerHTML = '';
    
    // 言語オプションを追加
    languages.forEach(lang => {
      const langOption = document.createElement('div');
      langOption.className = 'language-option';
      if (lang.code === currentLang) {
        langOption.classList.add('active');
      }
      
      langOption.innerHTML = `
        <span class="language-flag">${lang.flag}</span>
        <span class="language-name">${lang.name}</span>
        <span class="language-code">${lang.code.toUpperCase()}</span>
      `;
      
      langOption.addEventListener('click', () => {
        setLanguage(lang.code);
        toggleDropdown(false);
      });
      
      dropdown.appendChild(langOption);
    });
  }
  
  // 言語切り替えトグルの設定
  function setupLanguageToggle() {
    const toggle = document.querySelector('.language-toggle');
    if (!toggle) return;
    
    // 現在の言語を表示
    const currentLangElement = toggle.querySelector('.current-language');
    if (currentLangElement) {
      currentLangElement.textContent = currentLang.toUpperCase();
    }
    
    // トグルクリックイベント
    toggle.addEventListener('click', () => {
      toggleDropdown();
    });
    
    // 外部クリックで閉じる
    document.addEventListener('click', (e) => {
      if (!toggle.contains(e.target) && !document.querySelector('.language-dropdown').contains(e.target)) {
        toggleDropdown(false);
      }
    });
  }
  
  // ドロップダウンの表示/非表示を切り替え
  function toggleDropdown(show) {
    const dropdown = document.querySelector('.language-dropdown');
    const toggle = document.querySelector('.language-toggle');
    
    if (dropdown && toggle) {
      if (show === undefined) {
        dropdown.classList.toggle('active');
        toggle.classList.toggle('active');
      } else if (show) {
        dropdown.classList.add('active');
        toggle.classList.add('active');
      } else {
        dropdown.classList.remove('active');
        toggle.classList.remove('active');
      }
    }
  }
  
  // 言語を設定
  async function setLanguage(langCode) {
    if (langCode === currentLang) return;
    
    try {
      // 言語ファイルを読み込む
      const langData = await loadLanguageFile(langCode);
      
      // 言語データを適用
      applyLanguageData(langData);
      
      // 現在の言語を更新
      currentLang = langCode;
      localStorage.setItem('optimachain-lang', langCode);
      
      // 言語切り替えトグルを更新
      const currentLangElement = document.querySelector('.current-language');
      if (currentLangElement) {
        currentLangElement.textContent = langCode.toUpperCase();
      }
      
      // ドロップダウンの選択状態を更新
      const langOptions = document.querySelectorAll('.language-option');
      langOptions.forEach(option => {
        option.classList.remove('active');
        if (option.querySelector('.language-code').textContent === langCode.toUpperCase()) {
          option.classList.add('active');
        }
      });
      
      // 言語切り替えアニメーション
      showLanguageChangeAnimation(langCode);
      
      // メタタグの更新
      updateMetaTags(langData);
      
    } catch (error) {
      console.error('言語ファイルの読み込みに失敗しました:', error);
    }
  }
  
  // 言語ファイルを読み込む
  async function loadLanguageFile(langCode) {
    try {
      const response = await fetch(`/src/js/lang/${langCode}.json`);
      if (!response.ok) {
        throw new Error(`言語ファイルの読み込みに失敗しました: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('言語ファイルの読み込みエラー:', error);
      return null;
    }
  }
  
  // 言語データを適用
  function applyLanguageData(langData) {
    if (!langData) return;
    
    // data-i18n属性を持つ要素に言語データを適用
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const value = getNestedValue(langData, key);
      
      if (value) {
        element.textContent = value;
      }
    });
    
    // プレースホルダーの翻訳
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      const value = getNestedValue(langData, key);
      
      if (value) {
        element.setAttribute('placeholder', value);
      }
    });
    
    // 属性の翻訳
    document.querySelectorAll('[data-i18n-attr]').forEach(element => {
      const attrData = element.getAttribute('data-i18n-attr');
      const [attr, key] = attrData.split(':');
      const value = getNestedValue(langData, key);
      
      if (value && attr) {
        element.setAttribute(attr, value);
      }
    });
  }
  
  // ネストされたオブジェクトから値を取得
  function getNestedValue(obj, path) {
    if (!obj || !path) return null;
    
    const keys = path.split('.');
    let value = obj;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return null;
      }
    }
    
    return value;
  }
  
  // 言語切り替えアニメーション
  function showLanguageChangeAnimation(langCode) {
    // アニメーション要素がなければ作成
    let animElement = document.querySelector('.language-change-animation');
    if (!animElement) {
      animElement = document.createElement('div');
      animElement.className = 'language-change-animation';
      document.body.appendChild(animElement);
    }
    
    // 言語に応じたメッセージ
    const messages = {
      'ja': 'ようこそ！',
      'en': 'Welcome!',
      'zh': '欢迎！',
      'ko': '환영합니다!',
      'fr': 'Bienvenue!',
      'es': '¡Bienvenido!',
      'de': 'Willkommen!',
      'it': 'Benvenuto!',
      'ru': 'Добро пожаловать!'
    };
    
    // 言語コードに対応するフラグと言語名を取得
    const langInfo = languages.find(l => l.code === langCode);
    
    // アニメーション要素の内容を設定
    animElement.innerHTML = `
      <div class="anim-content">
        <div class="anim-flag">${langInfo ? langInfo.flag : ''}</div>
        <div class="anim-message">${messages[langCode] || 'Welcome!'}</div>
        <div class="anim-lang">${langInfo ? langInfo.name : langCode}</div>
      </div>
    `;
    
    // アニメーションを表示
    animElement.classList.add('active');
    
    // 一定時間後に非表示
    setTimeout(() => {
      animElement.classList.remove('active');
    }, 2000);
  }
  
  // メタタグの更新
  function updateMetaTags(langData) {
    if (!langData) return;
    
    // タイトルの更新
    const titleTag = document.querySelector('meta[name="i18n-title"]');
    if (titleTag) {
      const titleKey = titleTag.getAttribute('content');
      const titleValue = getNestedValue(langData, titleKey);
      
      if (titleValue) {
        document.title = `OptimaChain - ${titleValue}`;
      }
    }
    
    // 説明の更新
    const descTag = document.querySelector('meta[name="i18n-description"]');
    if (descTag) {
      const descKey = descTag.getAttribute('content');
      const descValue = getNestedValue(langData, descKey);
      
      if (descValue) {
        document.querySelector('meta[name="description"]').setAttribute('content', descValue);
        document.querySelector('meta[property="og:description"]').setAttribute('content', descValue);
        document.querySelector('meta[name="twitter:description"]').setAttribute('content', descValue);
      }
    }
  }
  
  // 初期化
  createLanguageDropdown();
  setupLanguageToggle();
  
  // 初期言語の適用
  loadLanguageFile(currentLang).then(langData => {
    if (langData) {
      applyLanguageData(langData);
      updateMetaTags(langData);
    }
  });
  
  return {
    setLanguage,
    getCurrentLanguage: () => currentLang,
    createLanguageDropdown,
    setupLanguageToggle
  };
}