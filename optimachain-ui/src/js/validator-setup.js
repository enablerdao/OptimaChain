// Validator setup component for homepage
export function initValidatorSetup() {
  const validatorSetupSection = document.getElementById('validator-setup-section');
  if (!validatorSetupSection) return;
  
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
