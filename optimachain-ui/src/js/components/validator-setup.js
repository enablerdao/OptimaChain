/**
 * OptimaChain - バリデータセットアップコンポーネント
 * 
 * バリデータのセットアップと参加プロセスを管理するコンポーネント
 */

class ValidatorSetup {
  constructor() {
    this.currentOS = 'ubuntu'; // デフォルトOS
    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.bindEvents();
      this.showOSContent(this.currentOS);
      this.initCopyButtons();
      this.initAnimations();
    });
  }

  bindEvents() {
    const osTabs = document.querySelectorAll('.os-tab');
    if (osTabs) {
      osTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const os = tab.getAttribute('data-os');
          this.showOSContent(os);
          
          // タブのアクティブ状態を更新
          osTabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
        });
      });
    }
    
    // 「バリデータになる」ボタンのスクロールイベント
    const validatorCTAs = document.querySelectorAll('.validator-cta-btn');
    if (validatorCTAs) {
      validatorCTAs.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const validatorSection = document.querySelector('#validator-setup');
          if (validatorSection) {
            validatorSection.scrollIntoView({ behavior: 'smooth' });
            
            // ハイライトエフェクト
            validatorSection.classList.add('highlight-section');
            setTimeout(() => {
              validatorSection.classList.remove('highlight-section');
            }, 2000);
          }
        });
      });
    }
  }

  showOSContent(os) {
    this.currentOS = os;
    
    // すべてのOS用コンテンツを非表示
    const osContents = document.querySelectorAll('.os-content');
    osContents.forEach(content => {
      content.classList.remove('active');
    });
    
    // 選択されたOSのコンテンツを表示
    const selectedContent = document.querySelector(`.os-content[data-os="${os}"]`);
    if (selectedContent) {
      selectedContent.classList.add('active');
    }
  }

  initCopyButtons() {
    const copyButtons = document.querySelectorAll('.copy-btn');
    if (copyButtons) {
      copyButtons.forEach(button => {
        button.addEventListener('click', () => {
          const commandBlock = button.closest('.validator-commands');
          const codeElement = commandBlock.querySelector('pre');
          
          if (codeElement) {
            const textToCopy = codeElement.textContent;
            navigator.clipboard.writeText(textToCopy)
              .then(() => {
                // コピー成功時のフィードバック
                const originalText = button.textContent;
                button.textContent = 'コピーしました！';
                button.classList.add('copied');
                
                setTimeout(() => {
                  button.textContent = originalText;
                  button.classList.remove('copied');
                }, 2000);
              })
              .catch(err => {
                console.error('コピーに失敗しました:', err);
                button.textContent = 'コピー失敗';
                button.classList.add('error');
                
                setTimeout(() => {
                  button.textContent = 'コピー';
                  button.classList.remove('error');
                }, 2000);
              });
          }
        });
      });
    }
  }

  initAnimations() {
    // バリデータセットアップセクションのアニメーション
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          
          // コマンドブロックを順番に表示
          const commandBlocks = entry.target.querySelectorAll('.validator-commands');
          commandBlocks.forEach((block, index) => {
            setTimeout(() => {
              block.classList.add('visible');
            }, 300 * index);
          });
        }
      });
    }, { threshold: 0.1 });
    
    const validatorSection = document.querySelector('#validator-setup');
    if (validatorSection) {
      observer.observe(validatorSection);
    }
  }
}

// グローバルインスタンスを作成
const validatorSetup = new ValidatorSetup();
export default validatorSetup;
