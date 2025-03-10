document.addEventListener('DOMContentLoaded', function() {
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
    
    if (connectWalletBtn && walletModal) {
        connectWalletBtn.addEventListener('click', function() {
            walletModal.classList.add('active');
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
        option.addEventListener('click', function() {
            const walletType = this.getAttribute('data-wallet');
            
            // デモ用：OptimaWalletを選択した場合は自動接続
            if (walletType === 'optimawallet') {
                walletModal.classList.remove('active');
                connectWalletBtn.textContent = '0x7a58...02e8';
                showToast('OptimaWalletに接続しました（デモのみ）');
            } else {
                showToast('このウォレットタイプはデモでは利用できません');
            }
        });
    });
    
    // トークンセレクタークリック
    const tokenSelectors = document.querySelectorAll('.token-selector');
    const tokenModal = document.getElementById('token-modal');
    
    tokenSelectors.forEach(selector => {
        selector.addEventListener('click', function() {
            if (tokenModal) {
                tokenModal.classList.add('active');
                generateTokenList();
            }
        });
    });
    
    // スワップ方向ボタン
    const swapDirectionBtn = document.querySelector('.swap-direction-btn');
    
    if (swapDirectionBtn) {
        swapDirectionBtn.addEventListener('click', function() {
            const tokenSelectors = document.querySelectorAll('.token-selector');
            const amountInputs = document.querySelectorAll('.amount-input');
            
            // トークンの入れ替え
            const token1Symbol = tokenSelectors[0].querySelector('.token-symbol').textContent;
            const token1Color = tokenSelectors[0].querySelector('.token-icon').style.backgroundColor;
            const token2Symbol = tokenSelectors[1].querySelector('.token-symbol').textContent;
            const token2Color = tokenSelectors[1].querySelector('.token-icon').style.backgroundColor;
            
            tokenSelectors[0].querySelector('.token-symbol').textContent = token2Symbol;
            tokenSelectors[0].querySelector('.token-icon').style.backgroundColor = token2Color;
            tokenSelectors[1].querySelector('.token-symbol').textContent = token1Symbol;
            tokenSelectors[1].querySelector('.token-icon').style.backgroundColor = token1Color;
            
            // 金額の入れ替え
            const amount1 = amountInputs[0].value;
            const amount2 = amountInputs[1].value;
            
            amountInputs[0].value = amount2;
            amountInputs[1].value = amount1;
            
            // 残高表示の更新
            const balanceInfos = document.querySelectorAll('.balance-info');
            balanceInfos[0].textContent = `残高: ${token2Symbol === 'OPT' ? '1,250.00' : '0.00'} ${token2Symbol}`;
            balanceInfos[1].textContent = `残高: ${token1Symbol === 'OPT' ? '1,250.00' : '0.00'} ${token1Symbol}`;
        });
    }
    
    // スワップボタン
    const swapButton = document.getElementById('swap-button');
    
    if (swapButton) {
        swapButton.addEventListener('click', function() {
            const fromAmount = document.querySelectorAll('.amount-input')[0].value;
            const fromToken = document.querySelectorAll('.token-symbol')[0].textContent;
            const toToken = document.querySelectorAll('.token-symbol')[1].textContent;
            
            if (!fromAmount || fromAmount <= 0) {
                showToast('有効な金額を入力してください');
                return;
            }
            
            showToast(`${fromAmount} ${fromToken}を${toToken}にスワップしました（デモのみ）`);
            
            // デモ用：取引履歴に追加
            addTradeItem({
                type: 'swap',
                price: '0.00',
                amount: fromAmount,
                total: '0.00',
                time: new Date()
            });
        });
    }
    
    // 注文タイプの切り替え
    const orderTypeBtns = document.querySelectorAll('.order-type-btn');
    
    orderTypeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const parent = this.parentElement;
            parent.querySelectorAll('.order-type-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // 注文ボタンの更新
            const orderForm = this.closest('.order-form');
            const orderBtn = orderForm.querySelector('.order-btn');
            const orderType = this.getAttribute('data-type');
            
            if (orderBtn) {
                if (orderType === 'buy') {
                    orderBtn.className = 'order-btn buy-btn';
                    orderBtn.textContent = orderForm.closest('#limit-panel') ? '買い注文を出す' : '成行買い注文を出す';
                } else {
                    orderBtn.className = 'order-btn sell-btn';
                    orderBtn.textContent = orderForm.closest('#limit-panel') ? '売り注文を出す' : '成行売り注文を出す';
                }
            }
        });
    });
    
    // パーセンテージボタン
    const percentageBtns = document.querySelectorAll('.percentage-btn');
    
    percentageBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const parent = this.parentElement;
            parent.querySelectorAll('.percentage-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // デモ用：数量の更新
            const percentage = parseInt(this.getAttribute('data-percentage'));
            const orderForm = this.closest('.order-form');
            const amountInput = orderForm.querySelector('input[placeholder="0.00"]');
            
            if (amountInput) {
                // OPTの場合は最大1,250.00
                const maxAmount = 1250;
                amountInput.value = (maxAmount * percentage / 100).toFixed(2);
                
                // 合計金額の更新
                const totalInput = orderForm.querySelector('input[readonly]');
                if (totalInput) {
                    // デモ用：単価0.00 USD
                    totalInput.value = '0.00';
                }
            }
        });
    });
    
    // 取引パネルのタブ切り替え
    const panelTabs = document.querySelectorAll('.panel-tab');
    
    panelTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const panelId = this.getAttribute('data-panel');
            
            // タブの切り替え
            panelTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // パネルの切り替え
            const panels = document.querySelectorAll('.panel-content');
            panels.forEach(panel => panel.classList.remove('active'));
            document.getElementById(`${panelId}-panel`).classList.add('active');
        });
    });
    
    // マーケットタブの切り替え
    const marketTabs = document.querySelectorAll('.tab-btn');
    
    marketTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // タブの切り替え
            marketTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // マーケットリストのフィルタリング
            filterMarketList(tabId);
        });
    });
    
    // マーケットリストの生成
    generateMarketList();
    
    // 注文板の生成
    generateOrderbook();
    
    // 取引履歴の生成
    generateTradesList();
    
    // チャートの生成
    generateChart();
});

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

// マーケットリストを生成する関数
function generateMarketList() {
    const marketList = document.getElementById('market-list');
    
    if (marketList) {
        // デモ用のデータ
        const markets = [
            {
                pair: 'OPT/USDT',
                price: '0.00',
                change: '0.00',
                iconColor: '#0071e3',
                favorite: true
            },
            {
                pair: 'ETH/USDT',
                price: '1,800.00',
                change: '-2.50',
                iconColor: '#627eea',
                favorite: true
            },
            {
                pair: 'BTC/USDT',
                price: '30,000.00',
                change: '+1.20',
                iconColor: '#f7931a',
                favorite: false
            },
            {
                pair: 'SOL/USDT',
                price: '20.00',
                change: '+5.30',
                iconColor: '#00ffbd',
                favorite: false
            },
            {
                pair: 'AVAX/USDT',
                price: '10.50',
                change: '-1.80',
                iconColor: '#e84142',
                favorite: false
            }
        ];
        
        markets.forEach(market => {
            const marketItem = document.createElement('div');
            marketItem.className = 'market-item';
            marketItem.setAttribute('data-pair', market.pair);
            marketItem.setAttribute('data-favorite', market.favorite);
            
            if (market.pair === 'OPT/USDT') {
                marketItem.classList.add('active');
            }
            
            marketItem.innerHTML = `
                <div class="market-icon" style="background-color: ${market.iconColor}"></div>
                <div class="market-details">
                    <div class="market-pair">${market.pair}</div>
                    <div class="market-price">${market.price}</div>
                </div>
                <div class="market-change ${parseFloat(market.change) >= 0 ? 'positive' : 'negative'}">
                    ${market.change}%
                </div>
            `;
            
            marketItem.addEventListener('click', function() {
                // マーケットアイテムの選択
                document.querySelectorAll('.market-item').forEach(item => item.classList.remove('active'));
                this.classList.add('active');
                
                // デモ用：トレーディングペアの更新
                const pair = this.getAttribute('data-pair');
                updateTradingPair(pair);
            });
            
            marketList.appendChild(marketItem);
        });
    }
}

// マーケットリストをフィルタリングする関数
function filterMarketList(filter) {
    const marketItems = document.querySelectorAll('.market-item');
    
    marketItems.forEach(item => {
        if (filter === 'all') {
            item.style.display = 'flex';
        } else if (filter === 'favorites') {
            const isFavorite = item.getAttribute('data-favorite') === 'true';
            item.style.display = isFavorite ? 'flex' : 'none';
        }
    });
}

// トレーディングペアを更新する関数
function updateTradingPair(pair) {
    const [base, quote] = pair.split('/');
    
    // ペア表示の更新
    const pairTitle = document.querySelector('.trading-pair h2');
    if (pairTitle) {
        pairTitle.textContent = pair;
    }
    
    // アイコンの更新
    const icons = document.querySelectorAll('.pair-icon .token-icon');
    if (icons.length >= 2) {
        // デモ用：簡易的なカラーマッピング
        const colorMap = {
            'OPT': '#0071e3',
            'USDT': '#26a17b',
            'ETH': '#627eea',
            'BTC': '#f7931a',
            'SOL': '#00ffbd',
            'AVAX': '#e84142'
        };
        
        icons[0].style.backgroundColor = colorMap[base] || '#0071e3';
        icons[1].style.backgroundColor = colorMap[quote] || '#26a17b';
    }
    
    // スワップパネルの更新
    const tokenSymbols = document.querySelectorAll('.token-symbol');
    const tokenIcons = document.querySelectorAll('.swap-input .token-icon');
    
    if (tokenSymbols.length >= 2 && tokenIcons.length >= 2) {
        tokenSymbols[0].textContent = base;
        tokenSymbols[1].textContent = quote;
        
        const colorMap = {
            'OPT': '#0071e3',
            'USDT': '#26a17b',
            'ETH': '#627eea',
            'BTC': '#f7931a',
            'SOL': '#00ffbd',
            'AVAX': '#e84142'
        };
        
        tokenIcons[0].style.backgroundColor = colorMap[base] || '#0071e3';
        tokenIcons[1].style.backgroundColor = colorMap[quote] || '#26a17b';
    }
    
    // 残高表示の更新
    const balanceInfos = document.querySelectorAll('.balance-info');
    if (balanceInfos.length >= 2) {
        balanceInfos[0].textContent = `残高: ${base === 'OPT' ? '1,250.00' : '0.00'} ${base}`;
        balanceInfos[1].textContent = `残高: ${quote === 'OPT' ? '1,250.00' : '0.00'} ${quote}`;
    }
    
    // 注文パネルの更新
    const limitPanel = document.getElementById('limit-panel');
    const marketPanel = document.getElementById('market-panel');
    
    if (limitPanel) {
        const priceLabel = limitPanel.querySelector('label:contains("価格")');
        if (priceLabel) {
            priceLabel.textContent = `価格 (${quote})`;
        }
        
        const amountLabel = limitPanel.querySelector('label:contains("数量")');
        if (amountLabel) {
            amountLabel.textContent = `数量 (${base})`;
        }
        
        const totalLabel = limitPanel.querySelector('label:contains("合計")');
        if (totalLabel) {
            totalLabel.textContent = `合計 (${quote})`;
        }
    }
    
    if (marketPanel) {
        const amountLabel = marketPanel.querySelector('label:contains("数量")');
        if (amountLabel) {
            amountLabel.textContent = `数量 (${base})`;
        }
        
        const totalLabel = marketPanel.querySelector('label:contains("概算合計")');
        if (totalLabel) {
            totalLabel.textContent = `概算合計 (${quote})`;
        }
    }
    
    // 注文板の更新
    generateOrderbook();
    
    // チャートの更新
    generateChart();
    
    showToast(`${pair}に切り替えました`);
}

// 注文板を生成する関数
function generateOrderbook() {
    const sellOrders = document.getElementById('sell-orders');
    const buyOrders = document.getElementById('buy-orders');
    
    if (sellOrders && buyOrders) {
        // 既存の注文をクリア
        sellOrders.innerHTML = '';
        buyOrders.innerHTML = '';
        
        // デモ用のデータ
        const basePrice = 0.00;
        
        // 売り注文（高い順）
        for (let i = 10; i > 0; i--) {
            const price = (basePrice + i * 0.01).toFixed(2);
            const amount = (Math.random() * 100 + 50).toFixed(2);
            const total = (price * amount).toFixed(2);
            const depth = Math.random() * 80 + 20;
            
            const orderRow = document.createElement('div');
            orderRow.className = 'order-row sell-row';
            orderRow.style.position = 'relative';
            
            orderRow.innerHTML = `
                <div class="price">${price}</div>
                <div class="amount">${amount}</div>
                <div class="total">${total}</div>
                <div class="depth-bar" style="width: ${depth}%"></div>
            `;
            
            sellOrders.appendChild(orderRow);
        }
        
        // 買い注文（高い順）
        for (let i = 0; i < 10; i++) {
            const price = Math.max(0, (basePrice - i * 0.01)).toFixed(2);
            const amount = (Math.random() * 100 + 50).toFixed(2);
            const total = (price * amount).toFixed(2);
            const depth = Math.random() * 80 + 20;
            
            const orderRow = document.createElement('div');
            orderRow.className = 'order-row buy-row';
            orderRow.style.position = 'relative';
            
            orderRow.innerHTML = `
                <div class="price">${price}</div>
                <div class="amount">${amount}</div>
                <div class="total">${total}</div>
                <div class="depth-bar" style="width: ${depth}%"></div>
            `;
            
            buyOrders.appendChild(orderRow);
        }
        
        // 現在価格の更新
        const currentPriceElements = document.querySelectorAll('.current-price');
        currentPriceElements.forEach(element => {
            element.textContent = `$${basePrice.toFixed(2)}`;
        });
        
        // 価格変動の更新
        const priceChangeElement = document.querySelector('.price-change');
        if (priceChangeElement) {
            priceChangeElement.textContent = '0.00%';
            priceChangeElement.className = 'price-change';
        }
    }
}

// トークンリストを生成する関数
function generateTokenList() {
    const tokenList = document.getElementById('token-list');
    
    if (tokenList) {
        // 既存のトークンをクリア
        tokenList.innerHTML = '';
        
        // デモ用のデータ
        const tokens = [
            {
                name: 'OptimaChain',
                symbol: 'OPT',
                balance: '1,250.00',
                iconColor: '#0071e3'
            },
            {
                name: 'Tether USD',
                symbol: 'USDT',
                balance: '0.00',
                iconColor: '#26a17b'
            },
            {
                name: 'Ethereum',
                symbol: 'ETH',
                balance: '0.00',
                iconColor: '#627eea'
            },
            {
                name: 'Bitcoin',
                symbol: 'BTC',
                balance: '0.00',
                iconColor: '#f7931a'
            },
            {
                name: 'Solana',
                symbol: 'SOL',
                balance: '0.00',
                iconColor: '#00ffbd'
            },
            {
                name: 'Avalanche',
                symbol: 'AVAX',
                balance: '0.00',
                iconColor: '#e84142'
            }
        ];
        
        tokens.forEach(token => {
            const tokenItem = document.createElement('div');
            tokenItem.className = 'token-item';
            
            tokenItem.innerHTML = `
                <div class="token-item-icon" style="background-color: ${token.iconColor}"></div>
                <div class="token-item-details">
                    <div class="token-item-name">${token.name}</div>
                    <div class="token-item-symbol">${token.symbol}</div>
                </div>
                <div class="token-item-balance">${token.balance}</div>
            `;
            
            tokenItem.addEventListener('click', function() {
                // デモ用：トークン選択
                const modalElement = document.getElementById('token-modal');
                const activeInput = document.activeElement;
                const swapInputs = document.querySelectorAll('.swap-input');
                
                let targetInput = null;
                swapInputs.forEach((input, index) => {
                    if (input.contains(activeInput)) {
                        targetInput = index;
                    }
                });
                
                if (targetInput !== null) {
                    const tokenSelectors = document.querySelectorAll('.token-selector');
                    const balanceInfos = document.querySelectorAll('.balance-info');
                    
                    if (tokenSelectors.length > targetInput) {
                        const tokenSymbol = tokenSelectors[targetInput].querySelector('.token-symbol');
                        const tokenIcon = tokenSelectors[targetInput].querySelector('.token-icon');
                        
                        if (tokenSymbol && tokenIcon) {
                            tokenSymbol.textContent = token.symbol;
                            tokenIcon.style.backgroundColor = token.iconColor;
                        }
                    }
                    
                    if (balanceInfos.length > targetInput) {
                        balanceInfos[targetInput].textContent = `残高: ${token.balance} ${token.symbol}`;
                    }
                }
                
                if (modalElement) {
                    modalElement.classList.remove('active');
                }
                
                showToast(`${token.symbol}を選択しました`);
            });
            
            tokenList.appendChild(tokenItem);
        });
    }
}

// 取引履歴リストを生成する関数
function generateTradesList() {
    const tradesList = document.getElementById('trades-list');
    
    if (tradesList) {
        // デモ用のデータ
        const trades = [
            {
                type: 'buy',
                price: '0.00',
                amount: '100.00',
                total: '0.00',
                time: new Date(Date.now() - 60000) // 1分前
            },
            {
                type: 'sell',
                price: '0.00',
                amount: '50.00',
                total: '0.00',
                time: new Date(Date.now() - 120000) // 2分前
            },
            {
                type: 'buy',
                price: '0.00',
                amount: '200.00',
                total: '0.00',
                time: new Date(Date.now() - 180000) // 3分前
            },
            {
                type: 'sell',
                price: '0.00',
                amount: '75.00',
                total: '0.00',
                time: new Date(Date.now() - 240000) // 4分前
            }
        ];
        
        trades.forEach(trade => {
            addTradeItem(trade, tradesList);
        });
    }
}

// 取引アイテムを追加する関数
function addTradeItem(trade, container = null) {
    const tradesList = container || document.getElementById('trades-list');
    
    if (tradesList) {
        const tradeItem = document.createElement('div');
        tradeItem.className = 'trade-item';
        
        // 日付のフォーマット
        const formattedTime = formatTime(trade.time);
        
        let typeText = '';
        let typeClass = '';
        
        switch (trade.type) {
            case 'buy':
                typeText = '買い';
                typeClass = 'buy';
                break;
            case 'sell':
                typeText = '売り';
                typeClass = 'sell';
                break;
            case 'swap':
                typeText = 'スワップ';
                typeClass = 'buy';
                break;
        }
        
        tradeItem.innerHTML = `
            <div class="trade-type ${typeClass}">${typeText}</div>
            <div class="trade-details">
                <div class="trade-price">${trade.price} USDT</div>
                <div class="trade-amount">数量: ${trade.amount} OPT</div>
                <div class="trade-time">${formattedTime}</div>
            </div>
        `;
        
        // リストの先頭に追加
        tradesList.insertBefore(tradeItem, tradesList.firstChild);
        
        // 最大表示数を制限
        const maxTrades = 8;
        while (tradesList.children.length > maxTrades) {
            tradesList.removeChild(tradesList.lastChild);
        }
    }
}

// 時間をフォーマットする関数
function formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${hours}:${minutes}:${seconds}`;
}

// チャートを生成する関数
function generateChart() {
    const chartContainer = document.getElementById('price-chart');
    
    if (chartContainer) {
        // デモ用：簡易的なチャート表示
        chartContainer.innerHTML = `
            <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--text-secondary);">
                <div style="text-align: center;">
                    <p>チャートデータは現在利用できません</p>
                    <p style="font-size: 0.9rem; margin-top: 8px;">OptimaChainはまだ開発初期段階です</p>
                </div>
            </div>
        `;
    }
}