// Validator setup component for homepage
export function initValidatorSetup() {
  const validatorSetupSection = document.getElementById('validator-setup-section');
  if (!validatorSetupSection) return;
  
  // Add prominent heading and description if they don't already exist
  if (!validatorSetupSection.querySelector('.validator-title-enhanced')) {
    const heading = document.createElement('h2');
    heading.className = 'section-title validator-title validator-title-enhanced';
    heading.textContent = 'バリデータノードをセットアップ';
    
    const description = document.createElement('p');
    description.className = 'validator-description';
    description.textContent = 'OptimaChainネットワークのバリデータになって、ネットワークの安全性を高め、報酬を獲得しましょう。以下の手順に従ってノードをセットアップしてください。';
    
    // Create rewards info element
    const rewardsInfo = document.createElement('div');
    rewardsInfo.className = 'validator-rewards-info';
    rewardsInfo.innerHTML = `
      <div class="rewards-badge">
        <span class="rewards-icon">🏆</span>
        <span class="rewards-text">報酬: 年間15-20% APY</span>
      </div>
      <div class="requirements-badge">
        <span class="requirements-icon">💻</span>
        <span class="requirements-text">最小要件: 8GB RAM, 4コアCPU, 500GB SSD</span>
      </div>
    `;
    
    // Insert at the beginning of the section
    const wrapper = validatorSetupSection.querySelector('.wrapper');
    if (wrapper) {
      // Insert after the section-header if it exists
      const sectionHeader = wrapper.querySelector('.section-header');
      if (sectionHeader) {
        sectionHeader.insertAdjacentElement('afterend', heading);
        heading.insertAdjacentElement('afterend', description);
        description.insertAdjacentElement('afterend', rewardsInfo);
      } else {
        wrapper.prepend(rewardsInfo);
        wrapper.prepend(description);
        wrapper.prepend(heading);
      }
      
      // Add highlight class to make the section stand out
      validatorSetupSection.classList.add('highlight-section');
    }
  }
  
  // Enhance copy buttons with better visual feedback
  const copyButtons = validatorSetupSection.querySelectorAll('.copy-btn');
  copyButtons.forEach(button => {
    if (!button.classList.contains('enhanced')) {
      button.classList.add('enhanced');
      button.innerHTML = '<span class="copy-icon">📋</span> <span class="copy-text">コピー</span>';
      
      // Add copy success notification
      button.addEventListener('click', function() {
        // Show notification
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.textContent = 'コマンドをコピーしました！';
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
          notification.classList.add('show');
        }, 10);
        
        // Hide and remove notification after 2 seconds
        setTimeout(() => {
          notification.classList.remove('show');
          setTimeout(() => {
            document.body.removeChild(notification);
          }, 300);
        }, 2000);
      });
    }
  });
  
  // Create OS tabs if they don't exist
  if (!validatorSetupSection.querySelector('.os-tabs')) {
    const commandsContainer = validatorSetupSection.querySelector('.validator-commands-container');
    if (commandsContainer) {
      const osTabs = document.createElement('div');
      osTabs.className = 'os-tabs';
      osTabs.innerHTML = `
        <button class="os-tab active" data-os="linux">Linux</button>
        <button class="os-tab" data-os="mac">macOS</button>
        <button class="os-tab" data-os="windows">Windows</button>
      `;
      
      commandsContainer.parentNode.insertBefore(osTabs, commandsContainer);
      
      // Add OS tab functionality
      const tabs = osTabs.querySelectorAll('.os-tab');
      const commands = commandsContainer.querySelectorAll('.validator-commands');
      
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          // Update active tab
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          
          // Show corresponding commands
          const os = tab.getAttribute('data-os');
          commands.forEach(cmd => {
            if (cmd.getAttribute('data-os') === os) {
              cmd.style.display = 'block';
            } else {
              cmd.style.display = 'none';
            }
          });
        });
      });
      
      // Trigger click on active tab to initialize display
      const activeTab = osTabs.querySelector('.os-tab.active');
      if (activeTab) {
        activeTab.click();
      }
    }
  }
  
  // Add validator CTA if it doesn't exist
  if (!validatorSetupSection.querySelector('.validator-cta')) {
    const wrapper = validatorSetupSection.querySelector('.wrapper');
    if (wrapper) {
      const validatorCta = document.createElement('div');
      validatorCta.className = 'validator-cta';
      validatorCta.innerHTML = `
        <a href="/validator-dashboard.html" class="primary-btn">
          <span>バリデータダッシュボード</span>
          <span class="button-icon">→</span>
        </a>
        <a href="/whitepaper/OptimaChain_Whitepaper.html#validator-economics" class="secondary-btn">
          <span>バリデータ経済学を学ぶ</span>
          <span class="button-icon">→</span>
        </a>
      `;
      
      wrapper.appendChild(validatorCta);
    }
  }
  
  // Default commands for different platforms
  const defaultCommands = {
    linux: {
      title: "Linux用セットアップコマンド",
      commands: [
        "# OptimaChainバリデータノードのセットアップ (Linux)",
        "curl -sSL https://raw.githubusercontent.com/enablerdao/OptimaChain/main/scripts/validator-setup.sh | bash",
        "",
        "# ノードの起動",
        "cd optimachain",
        "./optimachain-node --validator --name YOUR_VALIDATOR_NAME"
      ]
    },
    macos: {
      title: "macOS用セットアップコマンド",
      commands: [
        "# OptimaChainバリデータノードのセットアップ (macOS)",
        "curl -sSL https://raw.githubusercontent.com/enablerdao/OptimaChain/main/scripts/validator-setup-mac.sh | bash",
        "",
        "# ノードの起動",
        "cd optimachain",
        "./optimachain-node --validator --name YOUR_VALIDATOR_NAME"
      ]
    },
    windows: {
      title: "Windows用セットアップコマンド",
      commands: [
        "# OptimaChainバリデータノードのセットアップ (Windows)",
        "# PowerShellを管理者として実行",
        "Invoke-WebRequest -Uri https://raw.githubusercontent.com/enablerdao/OptimaChain/main/scripts/validator-setup.ps1 -OutFile validator-setup.ps1",
        "Set-ExecutionPolicy Bypass -Scope Process -Force",
        "./validator-setup.ps1",
        "",
        "# ノードの起動",
        "cd optimachain",
        ".\\optimachain-node.exe --validator --name YOUR_VALIDATOR_NAME"
      ]
    }
  };
  
  // OS tabs click handler
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('os-tab')) {
      const os = e.target.getAttribute('data-os');
      const osTabs = document.querySelectorAll('.os-tab');
      const osContents = document.querySelectorAll('.os-content');
      
      // Update active tab
      osTabs.forEach(tab => tab.classList.remove('active'));
      e.target.classList.add('active');
      
      // Update content
      osContents.forEach(content => {
        if (content.getAttribute('data-os') === os) {
          content.classList.add('active');
        } else {
          content.classList.remove('active');
        }
      });
    }
    
    // Copy button handler
    if (e.target.classList.contains('copy-btn')) {
      const commandBlock = e.target.closest('.validator-commands');
      const commandText = commandBlock.querySelector('pre').textContent;
      
      navigator.clipboard.writeText(commandText)
        .then(() => {
          showNotification('コマンドをクリップボードにコピーしました。', 'success');
        })
        .catch(err => {
          console.error('コピーに失敗しました:', err);
          showNotification('コピーに失敗しました。', 'error');
        });
    }
  });
}

// Simple notification function
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}
