document.addEventListener('DOMContentLoaded', function() {
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
        refreshBalanceBtn.addEventListener('click', function() {
            // 実際のアプリでは、ここでAPIリクエストを行い残高を更新
            showToast('残高を更新しました');
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
        confirmSendBtn.addEventListener('click', function() {
            // 実際のアプリでは、ここでトランザクションを送信
            showToast('送金リクエストを送信しました（デモのみ）');
            sendModal.classList.remove('active');
            
            // デモ用：アクティビティリストに追加
            addActivityItem({
                type: 'send',
                asset: document.getElementById('send-asset').value.toUpperCase(),
                amount: document.getElementById('send-amount').value,
                date: new Date()
            });
        });
    }
    
    // 手数料オプションの選択
    const feeOptions = document.querySelectorAll('.fee-option');
    
    feeOptions.forEach(option => {
        option.addEventListener('click', function() {
            feeOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // 資産リストの生成
    generateAssetsList();
    
    // アクティビティリストの生成
    generateActivityList();
});

// クリップボードにコピーする関数
function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}

// トースト通知を表示する関数
function showToast(message) {
    // 既存のトーストを削除
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // 新しいトーストを作成
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    toast.style.color = 'white';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '20px';
    toast.style.zIndex = '1000';
    
    document.body.appendChild(toast);
    
    // 3秒後に削除
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
            toast.remove();
        }, 500);
    }, 3000);
}

// QRコードを生成する関数
function generateQRCode() {
    const qrContainer = document.getElementById('qr-code');
    const walletAddress = document.getElementById('wallet-address').value;
    
    if (qrContainer && walletAddress) {
        qrContainer.innerHTML = '';
        
        // QRコードライブラリがある場合は使用
        if (typeof QRCode !== 'undefined') {
            new QRCode(qrContainer, {
                text: walletAddress,
                width: 180,
                height: 180,
                colorDark: '#1d1d1f',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
        } else {
            // ライブラリがない場合はプレースホルダーを表示
            qrContainer.innerHTML = `
                <div style="width: 180px; height: 180px; display: flex; align-items: center; justify-content: center; border: 1px dashed #ccc;">
                    <p style="text-align: center; color: #86868b;">QRコード<br>プレースホルダー</p>
                </div>
            `;
        }
    }
}

// 資産リストを生成する関数
function generateAssetsList() {
    const assetsList = document.getElementById('assets-list');
    
    if (assetsList) {
        // デモ用のデータ
        const assets = [
            {
                name: 'OptimaChain',
                symbol: 'OPT',
                network: 'OptimaChain',
                balance: '1,250.00',
                value: '$0.00',
                iconColor: '#0071e3'
            },
            {
                name: 'Tether USD',
                symbol: 'USDT',
                network: 'OptimaChain',
                balance: '0.00',
                value: '$0.00',
                iconColor: '#26a17b'
            },
            {
                name: 'Ethereum',
                symbol: 'ETH',
                network: 'OptimaChain (Wrapped)',
                balance: '0.00',
                value: '$0.00',
                iconColor: '#627eea'
            }
        ];
        
        assets.forEach(asset => {
            const assetItem = document.createElement('div');
            assetItem.className = 'asset-item';
            
            assetItem.innerHTML = `
                <div class="asset-icon" style="background-color: ${asset.iconColor}"></div>
                <div class="asset-details">
                    <div class="asset-name">${asset.name} (${asset.symbol})</div>
                    <div class="asset-network">${asset.network}</div>
                </div>
                <div class="asset-balance">
                    <div class="asset-amount">${asset.balance} ${asset.symbol}</div>
                    <div class="asset-value">${asset.value} USD</div>
                </div>
            `;
            
            assetsList.appendChild(assetItem);
        });
    }
}

// アクティビティリストを生成する関数
function generateActivityList() {
    const activityList = document.getElementById('activity-list');
    
    if (activityList) {
        // デモ用のデータ
        const activities = [
            {
                type: 'receive',
                asset: 'OPT',
                amount: '1,250.00',
                date: new Date(Date.now() - 3600000) // 1時間前
            }
        ];
        
        activities.forEach(activity => {
            addActivityItemToDOM(activity, activityList);
        });
    }
}

// アクティビティアイテムを追加する関数
function addActivityItem(activity) {
    const activityList = document.getElementById('activity-list');
    
    if (activityList) {
        addActivityItemToDOM(activity, activityList);
    }
}

// アクティビティアイテムをDOMに追加する関数
function addActivityItemToDOM(activity, container) {
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    
    let iconClass = '';
    let typeText = '';
    let amountClass = '';
    let amountPrefix = '';
    
    switch (activity.type) {
        case 'send':
            iconClass = 'send-activity';
            typeText = '送金';
            amountClass = 'negative';
            amountPrefix = '-';
            break;
        case 'receive':
            iconClass = 'receive-activity';
            typeText = '受取';
            amountClass = 'positive';
            amountPrefix = '+';
            break;
        case 'swap':
            iconClass = 'swap-activity';
            typeText = 'スワップ';
            amountClass = '';
            amountPrefix = '';
            break;
    }
    
    // 日付のフォーマット
    const formattedDate = formatDate(activity.date);
    
    activityItem.innerHTML = `
        <div class="activity-icon ${iconClass}">
            ${activity.type === 'send' ? '↑' : activity.type === 'receive' ? '↓' : '⇄'}
        </div>
        <div class="activity-details">
            <div class="activity-type">${typeText}</div>
            <div class="activity-date">${formattedDate}</div>
        </div>
        <div class="activity-amount ${amountClass}">${amountPrefix}${activity.amount} ${activity.asset}</div>
    `;
    
    // リストの先頭に追加
    container.insertBefore(activityItem, container.firstChild);
}

// 日付をフォーマットする関数
function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    
    // 1日以内
    if (diff < 86400000) {
        // 1時間以内
        if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000);
            return `${minutes}分前`;
        }
        // 1時間以上
        const hours = Math.floor(diff / 3600000);
        return `${hours}時間前`;
    }
    
    // 日付を表示
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}/${month}/${day}`;
}