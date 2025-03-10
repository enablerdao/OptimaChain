// Import blockchain interface
import blockchain from '../../src/js/blockchain.js';

// Initialize DEX state
let dexState = {
    isConnected: false,
    address: '',
    balance: {},
    selectedPair: 'OPT/USDT',
    pairs: [],
    orderbook: {
        asks: [],
        bids: []
    },
    trades: []
};

// Initialize DEX
async function initDEX() {
    // Get trading pairs
    const pairsResult = await blockchain.getTradingPairs();
    if (pairsResult.success) {
        dexState.pairs = pairsResult.pairs;
        updatePairsUI();
    }
    
    // Get orderbook for selected pair
    await updateOrderbook();
    
    // Get recent trades for selected pair
    await updateTrades();
}

// Update pairs UI
function updatePairsUI() {
    const pairsContainer = document.querySelector('.pairs-list');
    if (!pairsContainer || dexState.pairs.length === 0) return;
    
    // Clear existing items
    pairsContainer.innerHTML = '';
    
    // Add pairs
    dexState.pairs.forEach(pair => {
        const pairItem = document.createElement('div');
        pairItem.className = 'pair-item';
        if (`${pair.base}/${pair.quote}` === dexState.selectedPair) {
            pairItem.classList.add('active');
        }
        
        const changeClass = pair.change >= 0 ? 'positive' : 'negative';
        const changeSign = pair.change >= 0 ? '+' : '';
        
        pairItem.innerHTML = `
            <div class="pair-name">${pair.base}/${pair.quote}</div>
            <div class="pair-price">${pair.price.toFixed(2)}</div>
            <div class="pair-change ${changeClass}">${changeSign}${pair.change.toFixed(2)}%</div>
        `;
        
        pairItem.addEventListener('click', () => {
            dexState.selectedPair = `${pair.base}/${pair.quote}`;
            updatePairsUI();
            updateOrderbook();
            updateTrades();
            updatePairInfoUI();
        });
        
        pairsContainer.appendChild(pairItem);
    });
    
    // Update pair info
    updatePairInfoUI();
}

// Update pair info UI
function updatePairInfoUI() {
    const pairTitle = document.querySelector('.pair-title');
    const pairPrice = document.querySelector('.pair-price-value');
    const pairChange = document.querySelector('.pair-price-change');
    
    if (!pairTitle || !pairPrice || !pairChange) return;
    
    const selectedPair = dexState.pairs.find(p => `${p.base}/${p.quote}` === dexState.selectedPair);
    if (!selectedPair) return;
    
    pairTitle.textContent = dexState.selectedPair;
    pairPrice.textContent = `$${selectedPair.price.toFixed(2)}`;
    
    const changeClass = selectedPair.change >= 0 ? 'positive' : 'negative';
    const changeSign = selectedPair.change >= 0 ? '+' : '';
    pairChange.textContent = `${changeSign}${selectedPair.change.toFixed(2)}%`;
    pairChange.className = `pair-price-change ${changeClass}`;
}

// Update orderbook
async function updateOrderbook() {
    const result = await blockchain.getOrderbook(dexState.selectedPair);
    if (result.success) {
        dexState.orderbook = result.orderbook;
        updateOrderbookUI();
    }
}

// Update orderbook UI
function updateOrderbookUI() {
    const orderbookContainer = document.querySelector('.orderbook-list');
    if (!orderbookContainer) return;
    
    // Clear existing items
    orderbookContainer.innerHTML = '';
    
    // Add asks (sell orders) - sorted by price descending
    const sortedAsks = [...dexState.orderbook.asks].sort((a, b) => b.price - a.price);
    sortedAsks.forEach(ask => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item ask';
        
        const total = (ask.price * ask.amount).toFixed(2);
        
        orderItem.innerHTML = `
            <div class="order-price">${ask.price.toFixed(2)}</div>
            <div class="order-amount">${ask.amount.toFixed(2)}</div>
            <div class="order-total">${total}</div>
        `;
        
        orderbookContainer.appendChild(orderItem);
    });
    
    // Add spread indicator
    const spreadItem = document.createElement('div');
    spreadItem.className = 'spread-item';
    
    const highestBid = Math.max(...dexState.orderbook.bids.map(b => b.price));
    const lowestAsk = Math.min(...dexState.orderbook.asks.map(a => a.price));
    const spread = lowestAsk - highestBid;
    const spreadPercent = (spread / lowestAsk * 100).toFixed(2);
    
    spreadItem.innerHTML = `
        <div class="spread-price">$${lowestAsk.toFixed(2)}</div>
        <div class="spread-value">${spread.toFixed(2)} (${spreadPercent}%)</div>
        <div class="spread-label">スプレッド</div>
    `;
    
    orderbookContainer.appendChild(spreadItem);
    
    // Add bids (buy orders) - sorted by price descending
    const sortedBids = [...dexState.orderbook.bids].sort((a, b) => b.price - a.price);
    sortedBids.forEach(bid => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item bid';
        
        const total = (bid.price * bid.amount).toFixed(2);
        
        orderItem.innerHTML = `
            <div class="order-price">${bid.price.toFixed(2)}</div>
            <div class="order-amount">${bid.amount.toFixed(2)}</div>
            <div class="order-total">${total}</div>
        `;
        
        orderbookContainer.appendChild(orderItem);
    });
}

// Update trades
async function updateTrades() {
    const result = await blockchain.getRecentTrades(dexState.selectedPair);
    if (result.success) {
        dexState.trades = result.trades;
        updateTradesUI();
    }
}

// Update trades UI
function updateTradesUI() {
    const tradesContainer = document.querySelector('.trades-list');
    if (!tradesContainer || dexState.trades.length === 0) return;
    
    // Clear existing items
    tradesContainer.innerHTML = '';
    
    // Add trades
    dexState.trades.forEach(trade => {
        const tradeItem = document.createElement('div');
        tradeItem.className = `trade-item ${trade.type}`;
        
        const time = new Date(trade.timestamp).toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        tradeItem.innerHTML = `
            <div class="trade-type">${trade.type === 'buy' ? '買い' : '売り'}</div>
            <div class="trade-price">${trade.price.toFixed(2)} USDT</div>
            <div class="trade-amount">数量: ${trade.amount.toFixed(2)} OPT</div>
            <div class="trade-time">${time}</div>
        `;
        
        tradesContainer.appendChild(tradeItem);
    });
}

// Connect wallet
async function connectWallet() {
    if (dexState.isConnected) return;
    
    const result = await blockchain.connectWallet('optimawallet');
    if (result.success) {
        dexState.isConnected = true;
        dexState.address = result.address;
        
        // Update UI
        updateWalletUI();
        
        // Get balance
        const balanceResult = await blockchain.getBalance();
        if (balanceResult.success) {
            dexState.balance = balanceResult.balance;
            updateBalanceUI();
        }
    }
}

// Update wallet UI
function updateWalletUI() {
    const connectButton = document.getElementById('connect-wallet');
    if (connectButton) {
        if (dexState.isConnected) {
            connectButton.textContent = dexState.address.substring(0, 6) + '...' + dexState.address.substring(dexState.address.length - 4);
            connectButton.classList.add('connected');
        } else {
            connectButton.textContent = 'ウォレット接続';
            connectButton.classList.remove('connected');
        }
    }
}

// Update balance UI
function updateBalanceUI() {
    const balanceElements = document.querySelectorAll('.token-balance');
    balanceElements.forEach(element => {
        const token = element.getAttribute('data-token');
        if (token && dexState.balance[token]) {
            element.textContent = `残高: ${dexState.balance[token].toFixed(2)} ${token}`;
        }
    });
}

// Place limit order
async function placeLimitOrder(side, price, amount) {
    if (!dexState.isConnected) {
        showToast('ウォレットを接続してください');
        return { success: false, message: 'ウォレットが接続されていません' };
    }
    
    const result = await blockchain.placeLimitOrder(dexState.selectedPair, side, price, amount);
    if (result.success) {
        // Update balance
        const balanceResult = await blockchain.getBalance();
        if (balanceResult.success) {
            dexState.balance = balanceResult.balance;
            updateBalanceUI();
        }
        
        // Update orderbook
        await updateOrderbook();
        
        return { success: true, message: '注文が出されました' };
    } else {
        return { success: false, message: result.message };
    }
}

// Place market order
async function placeMarketOrder(side, amount) {
    if (!dexState.isConnected) {
        showToast('ウォレットを接続してください');
        return { success: false, message: 'ウォレットが接続されていません' };
    }
    
    const result = await blockchain.placeMarketOrder(dexState.selectedPair, side, amount);
    if (result.success) {
        // Update balance
        const balanceResult = await blockchain.getBalance();
        if (balanceResult.success) {
            dexState.balance = balanceResult.balance;
            updateBalanceUI();
        }
        
        // Update orderbook
        await updateOrderbook();
        
        // Update trades
        await updateTrades();
        
        return { success: true, message: '注文が約定しました' };
    } else {
        return { success: false, message: result.message };
    }
}

// Swap tokens
async function swapTokens(fromToken, toToken, amount) {
    if (!dexState.isConnected) {
        showToast('ウォレットを接続してください');
        return { success: false, message: 'ウォレットが接続されていません' };
    }
    
    const result = await blockchain.swapTokens(fromToken, toToken, amount);
    if (result.success) {
        // Update balance
        const balanceResult = await blockchain.getBalance();
        if (balanceResult.success) {
            dexState.balance = balanceResult.balance;
            updateBalanceUI();
        }
        
        return { success: true, message: 'スワップが完了しました' };
    } else {
        return { success: false, message: result.message };
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize DEX
    initDEX();
    
    // 通知バーの閉じるボタン
    const notificationBar = document.querySelector('.notification-bar');
    const closeButton = document.querySelector('.notification-close');
    
    if (closeButton && notificationBar) {
        closeButton.addEventListener('click', function() {
            notificationBar.style.display = 'none';
        });
    }
    
    // ウォレット接続ボタン
    const connectWalletBtn = document.getElementById('connect-wallet');
    const walletModal = document.getElementById('wallet-modal');
    
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', function() {
            if (dexState.isConnected) {
                // Already connected, do nothing
                return;
            }
            
            if (walletModal) {
                walletModal.classList.add('active');
            }
        });
    }
    
    // モーダルを閉じるボタン
    const closeModalButtons = document.querySelectorAll('.close-modal');
    
    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                modal.classList.remove('active');
            });
        });
    });
    
    // ウォレットオプションの選択
    const walletOptions = document.querySelectorAll('.wallet-option');
    
    walletOptions.forEach(option => {
        option.addEventListener('click', async function() {
            const walletType = this.getAttribute('data-wallet');
            
            // Connect wallet
            await connectWallet();
            
            // Close modal
            if (walletModal) {
                walletModal.classList.remove('active');
            }
            
            showToast('ウォレットに接続しました');
        });
    });
    
    // タブ切り替え
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // タブのアクティブ状態を切り替え
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // コンテンツの表示を切り替え
            tabContents.forEach(content => {
                if (content.id === tabId) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        });
    });
    
    // 注文タイプ切り替え
    const orderTypeButtons = document.querySelectorAll('.order-type-button');
    
    orderTypeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const orderType = this.getAttribute('data-type');
            const container = this.closest('.order-type-container');
            
            if (container) {
                // ボタンのアクティブ状態を切り替え
                container.querySelectorAll('.order-type-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                this.classList.add('active');
                
                // 入力フィールドの表示を切り替え
                if (orderType === 'buy') {
                    container.classList.remove('sell');
                    container.classList.add('buy');
                } else {
                    container.classList.remove('buy');
                    container.classList.add('sell');
                }
            }
        });
    });
    
    // 数量パーセンテージボタン
    const percentButtons = document.querySelectorAll('.percent-button');
    
    percentButtons.forEach(button => {
        button.addEventListener('click', function() {
            const percent = parseFloat(this.getAttribute('data-percent'));
            const container = this.closest('.order-form');
            
            if (container) {
                const amountInput = container.querySelector('.amount-input');
                const orderType = container.querySelector('.order-type-button.active').getAttribute('data-type');
                const [baseToken, quoteToken] = dexState.selectedPair.split('/');
                
                if (amountInput) {
                    if (orderType === 'buy') {
                        // 買い注文の場合はUSDT残高の割合
                        const balance = dexState.balance[quoteToken] || 0;
                        amountInput.value = (balance * percent / 100).toFixed(2);
                    } else {
                        // 売り注文の場合はOPT残高の割合
                        const balance = dexState.balance[baseToken] || 0;
                        amountInput.value = (balance * percent / 100).toFixed(2);
                    }
                    
                    // 合計金額を更新
                    updateTotalAmount(container);
                }
            }
        });
    });
    
    // 価格・数量入力時に合計金額を更新
    const priceInputs = document.querySelectorAll('.price-input');
    const amountInputs = document.querySelectorAll('.amount-input');
    
    [...priceInputs, ...amountInputs].forEach(input => {
        input.addEventListener('input', function() {
            const container = this.closest('.order-form');
            if (container) {
                updateTotalAmount(container);
            }
        });
    });
    
    // 合計金額の更新
    function updateTotalAmount(container) {
        const priceInput = container.querySelector('.price-input');
        const amountInput = container.querySelector('.amount-input');
        const totalElement = container.querySelector('.total-amount');
        
        if (priceInput && amountInput && totalElement) {
            const price = parseFloat(priceInput.value) || 0;
            const amount = parseFloat(amountInput.value) || 0;
            const total = price * amount;
            
            totalElement.textContent = total.toFixed(2);
        }
    }
    
    // 指値注文フォーム
    const limitOrderForm = document.getElementById('limit-order-form');
    
    if (limitOrderForm) {
        limitOrderForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const orderType = this.querySelector('.order-type-button.active').getAttribute('data-type');
            const price = parseFloat(this.querySelector('.price-input').value);
            const amount = parseFloat(this.querySelector('.amount-input').value);
            
            // バリデーション
            if (!price || !amount) {
                showToast('価格と数量を入力してください');
                return;
            }
            
            // 注文を出す
            const result = await placeLimitOrder(orderType, price, amount);
            
            // 結果メッセージ
            if (result.success) {
                showToast(result.message);
                // フォームをリセット
                this.reset();
            } else {
                showToast('エラー: ' + result.message);
            }
        });
    }
    
    // 成行注文フォーム
    const marketOrderForm = document.getElementById('market-order-form');
    
    if (marketOrderForm) {
        marketOrderForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const orderType = this.querySelector('.order-type-button.active').getAttribute('data-type');
            const amount = parseFloat(this.querySelector('.amount-input').value);
            
            // バリデーション
            if (!amount) {
                showToast('数量を入力してください');
                return;
            }
            
            // 注文を出す
            const result = await placeMarketOrder(orderType, amount);
            
            // 結果メッセージ
            if (result.success) {
                showToast(result.message);
                // フォームをリセット
                this.reset();
            } else {
                showToast('エラー: ' + result.message);
            }
        });
    }
    
    // スワップフォーム
    const swapForm = document.getElementById('swap-form');
    
    if (swapForm) {
        swapForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const fromToken = this.querySelector('.from-token-select').value;
            const toToken = this.querySelector('.to-token-select').value;
            const amount = parseFloat(this.querySelector('.from-amount-input').value);
            
            // バリデーション
            if (!amount) {
                showToast('数量を入力してください');
                return;
            }
            
            // スワップを実行
            const result = await swapTokens(fromToken, toToken, amount);
            
            // 結果メッセージ
            if (result.success) {
                showToast(result.message);
                // フォームをリセット
                this.reset();
            } else {
                showToast('エラー: ' + result.message);
            }
        });
    }
    
    // トークン選択モーダル
    const tokenSelectButtons = document.querySelectorAll('.token-select-button');
    const tokenModal = document.getElementById('token-modal');
    
    tokenSelectButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (tokenModal) {
                // 選択元を記録
                tokenModal.setAttribute('data-source', this.getAttribute('id'));
                tokenModal.classList.add('active');
            }
        });
    });
    
    // トークン選択
    const tokenOptions = document.querySelectorAll('.token-option');
    
    tokenOptions.forEach(option => {
        option.addEventListener('click', function() {
            const token = this.getAttribute('data-token');
            const sourceId = tokenModal.getAttribute('data-source');
            const sourceElement = document.getElementById(sourceId);
            
            if (sourceElement) {
                // トークンを選択
                sourceElement.textContent = token;
                
                // 残高を更新
                const balanceElement = sourceElement.closest('.token-input-container').querySelector('.token-balance');
                if (balanceElement && dexState.balance[token]) {
                    balanceElement.textContent = `残高: ${dexState.balance[token].toFixed(2)} ${token}`;
                }
            }
            
            // モーダルを閉じる
            tokenModal.classList.remove('active');
        });
    });
});

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