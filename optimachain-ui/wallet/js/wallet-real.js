// Wallet functionality with real API integration

// Initialize wallet state
let walletState = {
    isConnected: false,
    address: '',
    balance: {},
    transactions: []
};

// Helper functions
function formatAddress(address) {
    if (!address) return '';
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}

function getRandomColor(symbol) {
    // Generate consistent color based on symbol
    let hash = 0;
    for (let i = 0; i < symbol.length; i++) {
        hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = '#' + ('000000' + (hash & 0xFFFFFF).toString(16)).slice(-6);
    return color;
}

function getTokenPrice(symbol) {
    // Mock price data for now, would be replaced with real price API
    const prices = {
        'OPT': 0.00,
        'USDT': 1.00,
        'ETH': 1800.00
    };
    return prices[symbol] || 0.00;
}

// Initialize wallet
async function initWallet() {
    try {
        // Check if user is authenticated
        if (!Auth.isAuthenticated()) {
            window.location.href = '../login.html';
            return;
        }
        
        // Load wallet data
        await loadWalletData();
        
        // Set up event listeners
        setupEventListeners();
    } catch (error) {
        console.error('Error initializing wallet:', error);
        showToast('ウォレットの初期化に失敗しました');
    }
}

// Load wallet data from API
async function loadWalletData() {
    try {
        // Show loading states
        UIUtils.showLoading('assets-list');
        UIUtils.showLoading('activity-list');
        
        const token = Auth.getToken();
        
        // Get user wallets
        const wallets = await API.wallet.getWallets(token);
        
        if (wallets.length === 0) {
            // Create a new wallet if user doesn't have one
            await API.wallet.createWallet('Main Wallet', token);
            return loadWalletData(); // Reload data
        }
        
        const mainWallet = wallets[0];
        walletState.address = mainWallet.address;
        
        // Update wallet address
        document.getElementById('account-address').textContent = formatAddress(mainWallet.address);
        document.getElementById('wallet-address').value = mainWallet.address;
        
        // Get wallet balance
        const balance = await API.wallet.getWalletBalance(mainWallet._id, token);
        walletState.balance = balance;
        
        // Update total balance
        const totalBalance = balance.reduce((total, item) => {
            if (item.token === 'OPT') {
                return total + parseFloat(item.amount);
            }
            return total;
        }, 0);
        
        document.querySelector('.balance-amount').textContent = totalBalance.toLocaleString();
        
        // Update assets list
        const assetsList = document.getElementById('assets-list');
        assetsList.innerHTML = '';
        
        for (const item of balance) {
            // Get token details
            const tokenInfo = await API.token.getTokenBySymbol(item.token);
            
            const assetItem = document.createElement('div');
            assetItem.className = 'asset-item';
            assetItem.innerHTML = `
                <div class="asset-icon" style="background-color: ${getRandomColor(item.token)};"></div>
                <div class="asset-details">
                    <div class="asset-name">${tokenInfo.name}</div>
                    <div class="asset-ticker">${tokenInfo.symbol}</div>
                </div>
                <div class="asset-balance">
                    <div class="balance-value">${parseFloat(item.amount).toLocaleString()}</div>
                    <div class="fiat-value">≈ $${(parseFloat(item.amount) * getTokenPrice(tokenInfo.symbol)).toLocaleString()} USD</div>
                </div>
            `;
            assetsList.appendChild(assetItem);
        }
        
        // Get wallet transactions
        const transactions = await API.wallet.getWalletTransactions(mainWallet._id, token);
        walletState.transactions = transactions;
        
        // Update activity list
        const activityList = document.getElementById('activity-list');
        activityList.innerHTML = '';
        
        for (const tx of transactions.slice(0, 5)) {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            
            const isSent = tx.from === mainWallet.address;
            const otherAddress = isSent ? tx.to : tx.from;
            
            activityItem.innerHTML = `
                <div class="activity-icon ${isSent ? 'sent' : 'received'}"></div>
                <div class="activity-details">
                    <div class="activity-title">${isSent ? '送金' : '受取'}</div>
                    <div class="activity-address">${formatAddress(otherAddress)}</div>
                </div>
                <div class="activity-amount ${isSent ? 'negative' : 'positive'}">
                    ${isSent ? '-' : '+'} ${parseFloat(tx.amount).toLocaleString()} ${tx.token}
                </div>
                <div class="activity-time">${formatDate(tx.timestamp)}</div>
            `;
            activityList.appendChild(activityItem);
        }
    } catch (error) {
        console.error('Error loading wallet data:', error);
        UIUtils.showError('assets-list', 'ウォレットデータの読み込みに失敗しました。');
        UIUtils.showError('activity-list', 'トランザクション履歴の読み込みに失敗しました。');
    }
}

// Send tokens
async function sendTokens() {
    const recipientAddress = document.getElementById('recipient-address').value;
    const amount = document.getElementById('send-amount').value;
    const asset = document.getElementById('send-asset').value;
    
    // Validate inputs
    if (!recipientAddress || !amount || parseFloat(amount) <= 0) {
        showToast('送金先アドレスと金額を正しく入力してください。');
        return;
    }
    
    try {
        const token = Auth.getToken();
        const wallets = await API.wallet.getWallets(token);
        const mainWallet = wallets[0];
        
        // Get selected fee
        const feeOption = document.querySelector('.fee-option.active');
        const fee = feeOption.querySelector('.fee-value').textContent.split(' ')[0];
        
        // Confirm transaction
        UIUtils.confirmAction(`${amount} ${asset}を${formatAddress(recipientAddress)}に送金します。よろしいですか？`, async () => {
            try {
                // Show loading state
                document.getElementById('confirm-send').disabled = true;
                document.getElementById('confirm-send').textContent = '送金中...';
                
                // Send tokens
                await API.wallet.sendTokens(mainWallet._id, recipientAddress, asset, amount, fee, token);
                
                // Close modal and reload data
                closeModal('send-modal');
                await loadWalletData();
                
                // Show success message
                showToast('送金が完了しました。');
            } catch (error) {
                console.error('Error sending tokens:', error);
                showToast(`送金に失敗しました: ${error.message}`);
            } finally {
                // Reset button state
                document.getElementById('confirm-send').disabled = false;
                document.getElementById('confirm-send').textContent = '送金する';
            }
        });
    } catch (error) {
        console.error('Error preparing transaction:', error);
        showToast(`送金の準備に失敗しました: ${error.message}`);
    }
}

// Set up event listeners
function setupEventListeners() {
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
            copyToClipboard(walletState.address);
            showToast('アドレスをコピーしました');
        });
    }
    
    // ウォレットアドレスのコピー機能
    const copyWalletAddressBtn = document.getElementById('copy-wallet-address');
    const walletAddress = document.getElementById('wallet-address');
    
    if (copyWalletAddressBtn && walletAddress) {
        copyWalletAddressBtn.addEventListener('click', function() {
            copyToClipboard(walletState.address);
            showToast('アドレスをコピーしました');
        });
    }
    
    // 残高の更新ボタン
    const refreshBalanceBtn = document.getElementById('refresh-balance');
    
    if (refreshBalanceBtn) {
        refreshBalanceBtn.addEventListener('click', async function() {
            await loadWalletData();
            showToast('残高を更新しました');
        });
    }
    
    // 送金ボタン
    const sendButtons = document.querySelectorAll('.primary-btn');
    const sendModal = document.getElementById('send-modal');
    
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
    const closeModalButtons = document.querySelectorAll('.close-modal, .cancel-btn');
    
    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            closeModal();
        });
    });
    
    // 送金確認ボタン
    const confirmSendBtn = document.getElementById('confirm-send');
    
    if (confirmSendBtn) {
        confirmSendBtn.addEventListener('click', sendTokens);
    }
    
    // 手数料オプション
    const feeOptions = document.querySelectorAll('.fee-option');
    
    feeOptions.forEach(option => {
        option.addEventListener('click', function() {
            feeOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Close modal
function closeModal(modalId) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.classList.remove('active');
    });
}

// QRコード生成
function generateQRCode() {
    const qrContainer = document.getElementById('qr-code');
    
    if (qrContainer && typeof QRCode !== 'undefined') {
        qrContainer.innerHTML = '';
        new QRCode(qrContainer, {
            text: walletState.address,
            width: 128,
            height: 128,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
    }
}

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

// Initialize on page load
document.addEventListener('DOMContentLoaded', initWallet);
