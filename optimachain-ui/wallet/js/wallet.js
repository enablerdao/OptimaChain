// Import blockchain interface
import blockchain from '../../src/js/blockchain.js';

// Initialize wallet state
let walletState = {
    isConnected: false,
    address: '',
    balance: {},
    transactions: []
};

// Initialize wallet
async function initWallet() {
    // Auto-connect wallet for demo
    const result = await blockchain.connectWallet('optimawallet');
    if (result.success) {
        walletState.isConnected = true;
        walletState.address = result.address;
        
        // Update UI
        updateWalletUI();
        
        // Get balance
        const balanceResult = await blockchain.getBalance();
        if (balanceResult.success) {
            walletState.balance = balanceResult.balance;
            updateBalanceUI();
        }
        
        // Get transaction history
        const txResult = await blockchain.getTransactionHistory();
        if (txResult.success) {
            walletState.transactions = txResult.transactions;
            updateTransactionHistoryUI();
        }
    }
}

// Update wallet UI
function updateWalletUI() {
    const accountAddress = document.getElementById('account-address');
    if (accountAddress) {
        accountAddress.textContent = walletState.address;
    }
    
    const walletAddress = document.getElementById('wallet-address');
    if (walletAddress) {
        walletAddress.value = walletState.address;
    }
}

// Update balance UI
function updateBalanceUI() {
    const totalBalance = document.getElementById('total-balance');
    if (totalBalance) {
        totalBalance.textContent = walletState.balance.OPT.toFixed(2);
    }
    
    // Update asset list
    const assetList = document.querySelectorAll('.asset-item');
    assetList.forEach(item => {
        const symbol = item.querySelector('.asset-name').textContent.split(' ')[0];
        const balance = item.querySelector('.asset-balance');
        if (balance && walletState.balance[symbol]) {
            balance.textContent = walletState.balance[symbol].toFixed(2) + ' ' + symbol;
        }
    });
}

// Update transaction history UI
function updateTransactionHistoryUI() {
    const activityContainer = document.querySelector('.activity-list');
    if (!activityContainer || walletState.transactions.length === 0) return;
    
    // Clear existing items
    activityContainer.innerHTML = '';
    
    // Add transactions
    walletState.transactions.forEach(tx => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        const direction = tx.type === 'receive' ? '↓' : '↑';
        const timeAgo = getTimeAgo(tx.timestamp);
        
        activityItem.innerHTML = `
            <div class="activity-direction ${tx.type}">${direction}</div>
            <div class="activity-details">
                <div class="activity-type">${tx.type === 'receive' ? '受取' : '送金'}</div>
                <div class="activity-time">${timeAgo}</div>
            </div>
            <div class="activity-amount">${tx.type === 'receive' ? '+' : '-'}${tx.amount.toFixed(2)} ${tx.token}</div>
        `;
        
        activityContainer.appendChild(activityItem);
    });
}

// Helper function to format time ago
function getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return `${seconds}秒前`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分前`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}時間前`;
    return `${Math.floor(seconds / 86400)}日前`;
}

// Send tokens
async function sendTokens(to, token, amount, feeLevel) {
    const result = await blockchain.sendTokens(to, token, amount, feeLevel);
    if (result.success) {
        // Update balance
        const balanceResult = await blockchain.getBalance();
        if (balanceResult.success) {
            walletState.balance = balanceResult.balance;
            updateBalanceUI();
        }
        
        // Update transaction history
        const txResult = await blockchain.getTransactionHistory();
        if (txResult.success) {
            walletState.transactions = txResult.transactions;
            updateTransactionHistoryUI();
        }
        
        return { success: true, message: '送金が完了しました' };
    } else {
        return { success: false, message: result.message };
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize wallet
    initWallet();
    
    // 通知バーの閉じるボタン
    const notificationBar = document.querySelector('.notification-bar');
    const closeButton = document.querySelector('.notification-close');
    
    if (closeButton && notificationBar) {
        closeButton.addEventListener('click', function() {
            notificationBar.style.display = 'none';
        });
    }
    
    // アドレスのコピー機能
    const copyAddressBtn = document.getElementById('copy-address');
    const accountAddress = document.getElementById('account-address');
    
    if (copyAddressBtn && accountAddress) {
        copyAddressBtn.addEventListener('click', function() {
            copyToClipboard(accountAddress.textContent);
            showToast('アドレスをコピーしました');
        });
    }
    
    // ウォレットアドレスのコピー機能
    const copyWalletAddressBtn = document.getElementById('copy-wallet-address');
    const walletAddress = document.getElementById('wallet-address');
    
    if (copyWalletAddressBtn && walletAddress) {
        copyWalletAddressBtn.addEventListener('click', function() {
            copyToClipboard(walletAddress.value);
            showToast('アドレスをコピーしました');
        });
    }
    
    // 残高の更新ボタン
    const refreshBalanceBtn = document.getElementById('refresh-balance');
    
    if (refreshBalanceBtn) {
        refreshBalanceBtn.addEventListener('click', async function() {
            const balanceResult = await blockchain.getBalance();
            if (balanceResult.success) {
                walletState.balance = balanceResult.balance;
                updateBalanceUI();
                showToast('残高を更新しました');
            } else {
                showToast('残高の更新に失敗しました');
            }
        });
    }
    
    // 送金ボタン
    const sendButtons = document.querySelectorAll('.primary-btn');
    const sendModal = document.getElementById('send-modal');
    const closeModalButtons = document.querySelectorAll('.close-modal, .cancel-btn');
    
    sendButtons.forEach(button => {
        if (button.textContent === '送金') {
            button.addEventListener('click', function() {
                if (sendModal) {
                    sendModal.classList.add('active');
                }
            });
        }
    });
    
    // 受取ボタン
    const receiveButtons = document.querySelectorAll('.secondary-btn');
    const receiveModal = document.getElementById('receive-modal');
    
    receiveButtons.forEach(button => {
        if (button.textContent === '受取') {
            button.addEventListener('click', function() {
                if (receiveModal) {
                    receiveModal.classList.add('active');
                    generateQRCode();
                }
            });
        }
    });
    
    // モーダルを閉じるボタン
    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                modal.classList.remove('active');
            });
        });
    });
    
    // 送金確認ボタン
    const confirmSendBtn = document.getElementById('confirm-send');
    
    if (confirmSendBtn) {
        confirmSendBtn.addEventListener('click', async function() {
            // フォームデータの取得
            const to = document.getElementById('send-to').value;
            const amount = parseFloat(document.getElementById('send-amount').value);
            const asset = document.getElementById('send-asset').textContent || 'OPT';
            
            // 選択された手数料レベルを取得
            let feeLevel = 'medium';
            document.querySelectorAll('.fee-option').forEach(option => {
                if (option.classList.contains('selected')) {
                    feeLevel = option.getAttribute('data-fee');
                }
            });
            
            // バリデーション
            if (!to || !amount) {
                showToast('送金先アドレスと金額を入力してください');
                return;
            }
            
            // 送金処理
            const result = await sendTokens(to, asset, amount, feeLevel);
            
            // モーダルを閉じる
            if (sendModal) {
                sendModal.classList.remove('active');
            }
            
            // 結果メッセージ
            if (result.success) {
                showToast(result.message);
            } else {
                showToast('エラー: ' + result.message);
            }
        });
    }
    
    // 資産タブ切り替え
    const assetTabs = document.querySelectorAll('.asset-tab');
    
    assetTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const asset = this.getAttribute('data-asset');
            
            // タブのアクティブ状態を切り替え
            assetTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // 選択された資産に応じてUIを更新
            const assetElement = document.getElementById('send-asset');
            if (assetElement) {
                assetElement.textContent = asset;
            }
        });
    });
    
    // 最大ボタン
    const maxBtn = document.getElementById('max-amount');
    
    if (maxBtn) {
        maxBtn.addEventListener('click', function() {
            const amountInput = document.getElementById('send-amount');
            const asset = document.getElementById('send-asset').textContent || 'OPT';
            
            // 選択された資産の残高を取得
            if (walletState.balance[asset]) {
                amountInput.value = walletState.balance[asset].toFixed(2);
            } else {
                amountInput.value = '0.00';
            }
        });
    }
    
    // QRコード生成
    function generateQRCode() {
        const qrContainer = document.getElementById('qr-code');
        
        if (qrContainer && typeof QRCode !== 'undefined') {
            qrContainer.innerHTML = '';
            new QRCode(qrContainer, {
                text: walletState.address || '0x7a58c0d9b9ab3246a89e7d7c4a3e02e8',
                width: 128,
                height: 128,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
        }
    }
    
    // ダッシュボード、送金、受取、履歴、スワップのタブ切り替え
    const walletTabs = document.querySelectorAll('.wallet-tab');
    const walletContents = document.querySelectorAll('.wallet-content');
    
    walletTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // タブのアクティブ状態を切り替え
            walletTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // コンテンツの表示を切り替え
            walletContents.forEach(content => {
                if (content.id === tabId) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        });
    });
});

// クリップボードにコピー
function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}

// トースト通知
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}