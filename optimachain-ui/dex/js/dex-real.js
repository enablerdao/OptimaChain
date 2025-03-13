// DEX functionality with real API integration

// Initialize DEX state
let dexState = {
  selectedMarket: null,
  orderbook: {
    asks: [],
    bids: []
  },
  trades: [],
  markets: []
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

function getDepthPercentage(amount, orders) {
  if (!orders || orders.length === 0) return 0;
  
  // Find max amount for scaling
  const maxAmount = Math.max(...orders.map(order => order.amount));
  return (amount / maxAmount) * 100;
}

// Initialize DEX
async function initDEX() {
  try {
    // Load market data
    await loadMarketData();
    
    // Set up event listeners
    setupEventListeners();
  } catch (error) {
    console.error('Error initializing DEX:', error);
    showToast('DEXの初期化に失敗しました');
  }
}

// Load market data from API
async function loadMarketData() {
  try {
    // Show loading states
    UIUtils.showLoading('market-list');
    UIUtils.showLoading('sell-orders');
    UIUtils.showLoading('buy-orders');
    UIUtils.showLoading('trades-list');
    
    // Get all markets
    const markets = await API.market.getMarkets();
    dexState.markets = markets;
    
    // Update market list
    const marketList = document.getElementById('market-list');
    marketList.innerHTML = '';
    
    for (const market of markets) {
      // Get token details
      const baseToken = await API.token.getToken(market.baseToken);
      const quoteToken = await API.token.getToken(market.quoteToken);
      
      const marketItem = document.createElement('div');
      marketItem.className = 'market-item';
      marketItem.setAttribute('data-market-id', market._id);
      marketItem.innerHTML = `
        <div class="market-pair">
          <div class="token-icons">
            <div class="token-icon" style="background-color: ${getRandomColor(baseToken.symbol)};"></div>
            <div class="token-icon second" style="background-color: ${getRandomColor(quoteToken.symbol)};"></div>
          </div>
          <div class="pair-name">${baseToken.symbol}/${quoteToken.symbol}</div>
        </div>
        <div class="market-price">${market.lastPrice.toLocaleString()}</div>
        <div class="price-change ${market.priceChange24h >= 0 ? 'positive' : 'negative'}">
          ${market.priceChange24h >= 0 ? '+' : ''}${market.priceChange24h.toFixed(2)}%
        </div>
      `;
      
      // Add click event
      marketItem.addEventListener('click', () => {
        selectMarket(market._id);
      });
      
      marketList.appendChild(marketItem);
    }
    
    // Select first market by default
    if (markets.length > 0) {
      selectMarket(markets[0]._id);
    }
  } catch (error) {
    console.error('Error loading market data:', error);
    UIUtils.showError('market-list', 'マーケットデータの読み込みに失敗しました。');
  }
}

// Select market and load orderbook
async function selectMarket(marketId) {
  try {
    // Highlight selected market
    const marketItems = document.querySelectorAll('.market-item');
    marketItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('data-market-id') === marketId) {
        item.classList.add('active');
      }
    });
    
    // Show loading states
    UIUtils.showLoading('sell-orders');
    UIUtils.showLoading('buy-orders');
    UIUtils.showLoading('trades-list');
    
    // Get market details
    const market = await API.market.getMarket(marketId);
    dexState.selectedMarket = market;
    
    // Get token details
    const baseToken = await API.token.getToken(market.baseToken);
    const quoteToken = await API.token.getToken(market.quoteToken);
    
    // Update trading pair display
    document.querySelector('.trading-pair h2').textContent = `${baseToken.symbol} / ${quoteToken.symbol}`;
    document.querySelector('.current-price').textContent = `$${market.lastPrice.toLocaleString()}`;
    document.querySelector('.price-change').textContent = `${market.priceChange24h >= 0 ? '+' : ''}${market.priceChange24h.toFixed(2)}%`;
    document.querySelector('.price-change').className = `price-change ${market.priceChange24h >= 0 ? 'positive' : 'negative'}`;
    
    // Update token icons
    const tokenIcons = document.querySelectorAll('.trading-pair .token-icon');
    tokenIcons[0].style.backgroundColor = getRandomColor(baseToken.symbol);
    tokenIcons[1].style.backgroundColor = getRandomColor(quoteToken.symbol);
    
    // Get orderbook
    const orderbook = await API.market.getOrderbook(marketId);
    dexState.orderbook = orderbook;
    
    // Update sell orders
    const sellOrders = document.getElementById('sell-orders');
    sellOrders.innerHTML = '';
    
    for (const order of orderbook.asks.slice(0, 10)) {
      const orderItem = document.createElement('div');
      orderItem.className = 'order-item sell';
      orderItem.innerHTML = `
        <div class="col">${order.price.toLocaleString()}</div>
        <div class="col">${order.amount.toLocaleString()}</div>
        <div class="col">${(order.price * order.amount).toLocaleString()}</div>
        <div class="depth-bar" style="width: ${getDepthPercentage(order.amount, orderbook.asks)}%;"></div>
      `;
      sellOrders.appendChild(orderItem);
    }
    
    // Update buy orders
    const buyOrders = document.getElementById('buy-orders');
    buyOrders.innerHTML = '';
    
    for (const order of orderbook.bids.slice(0, 10)) {
      const orderItem = document.createElement('div');
      orderItem.className = 'order-item buy';
      orderItem.innerHTML = `
        <div class="col">${order.price.toLocaleString()}</div>
        <div class="col">${order.amount.toLocaleString()}</div>
        <div class="col">${(order.price * order.amount).toLocaleString()}</div>
        <div class="depth-bar" style="width: ${getDepthPercentage(order.amount, orderbook.bids)}%;"></div>
      `;
      buyOrders.appendChild(orderItem);
    }
    
    // Get recent trades
    const trades = await API.market.getTrades(marketId);
    dexState.trades = trades;
    
    // Update trades list
    const tradesList = document.getElementById('trades-list');
    tradesList.innerHTML = '';
    
    for (const trade of trades.slice(0, 20)) {
      const tradeItem = document.createElement('div');
      tradeItem.className = `trade-item ${trade.side === 'buy' ? 'buy' : 'sell'}`;
      tradeItem.innerHTML = `
        <div class="trade-price">${trade.price.toLocaleString()}</div>
        <div class="trade-amount">${trade.amount.toLocaleString()}</div>
        <div class="trade-time">${formatDate(trade.timestamp)}</div>
      `;
      tradesList.appendChild(tradeItem);
    }
    
    // Update order form
    document.getElementById('base-token').textContent = baseToken.symbol;
    document.getElementById('quote-token').textContent = quoteToken.symbol;
    
    // Update price input with current price
    document.getElementById('limit-price').value = market.lastPrice.toFixed(2);
  } catch (error) {
    console.error('Error selecting market:', error);
    UIUtils.showError('sell-orders', 'オーダーブックの読み込みに失敗しました。');
    UIUtils.showError('buy-orders', 'オーダーブックの読み込みに失敗しました。');
    UIUtils.showError('trades-list', '取引履歴の読み込みに失敗しました。');
  }
}

// Place order
async function placeOrder(type, side) {
  try {
    // Check if user is authenticated
    if (!Auth.isAuthenticated()) {
      window.location.href = '../login';
      return;
    }
    
    // Get form values
    const amount = parseFloat(document.getElementById('order-amount').value);
    const price = type === 'limit' ? parseFloat(document.getElementById('limit-price').value) : 0;
    
    // Validate inputs
    if (!amount || amount <= 0) {
      showToast('数量を正しく入力してください。');
      return;
    }
    
    if (type === 'limit' && (!price || price <= 0)) {
      showToast('価格を正しく入力してください。');
      return;
    }
    
    // Get market details
    const market = dexState.selectedMarket;
    if (!market) {
      showToast('マーケットが選択されていません。');
      return;
    }
    
    // Get token details
    const baseToken = await API.token.getToken(market.baseToken);
    const quoteToken = await API.token.getToken(market.quoteToken);
    
    // Confirm order
    const orderValue = type === 'limit' ? price * amount : market.lastPrice * amount;
    const orderType = type === 'limit' ? '指値注文' : '成行注文';
    const orderSide = side === 'buy' ? '買い' : '売り';
    
    UIUtils.confirmAction(
      `${orderType}（${orderSide}）を出します：\n${amount} ${baseToken.symbol} @ ${type === 'limit' ? price : '成行'} ${quoteToken.symbol}\n合計: ${orderValue.toLocaleString()} ${quoteToken.symbol}\n\nよろしいですか？`,
      async () => {
        try {
          // Show loading state
          const orderButton = document.querySelector(`.${side}-btn`);
          orderButton.disabled = true;
          orderButton.textContent = '処理中...';
          
          // Get token
          const token = Auth.getToken();
          
          // Place order
          await API.market.placeOrder(
            market._id,
            side,
            type,
            amount,
            price,
            token
          );
          
          // Reload market data
          await selectMarket(market._id);
          
          // Show success message
          showToast('注文が出されました。');
          
          // Reset form
          document.getElementById('order-amount').value = '';
          if (type === 'limit') {
            document.getElementById('limit-price').value = market.lastPrice.toFixed(2);
          }
        } catch (error) {
          console.error('Error placing order:', error);
          showToast(`注文の出しに失敗しました: ${error.message}`);
        } finally {
          // Reset button state
          const orderButton = document.querySelector(`.${side}-btn`);
          orderButton.disabled = false;
          orderButton.textContent = side === 'buy' ? '買い' : '売り';
        }
      }
    );
  } catch (error) {
    console.error('Error preparing order:', error);
    showToast(`注文の準備に失敗しました: ${error.message}`);
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
  
  // Connect wallet button
  const connectWalletBtn = document.getElementById('connect-wallet');
  
  if (connectWalletBtn) {
    // Update button text if user is authenticated
    if (Auth.isAuthenticated()) {
      const user = Auth.getUser();
      connectWalletBtn.textContent = user.username || 'ウォレット接続済み';
      connectWalletBtn.classList.add('connected');
    }
    
    // Add event listener
    connectWalletBtn.addEventListener('click', () => {
      if (Auth.isAuthenticated()) {
        // Show wallet info or logout option
        UIUtils.confirmAction('ログアウトしますか？', () => {
          Auth.logout();
          window.location.reload();
        });
      } else {
        // Redirect to login page
        window.location.href = '../login';
      }
    });
  }
  
  // Order type tabs
  const orderTypeTabs = document.querySelectorAll('.order-type-tab');
  const orderTypePanels = document.querySelectorAll('.order-type-panel');
  
  orderTypeTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const type = this.getAttribute('data-type');
      
      // Update active tab
      orderTypeTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      // Show corresponding panel
      orderTypePanels.forEach(panel => {
        if (panel.getAttribute('data-type') === type) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      });
    });
  });
  
  // Buy/Sell buttons
  const buyBtn = document.querySelector('.buy-btn');
  const sellBtn = document.querySelector('.sell-btn');
  
  if (buyBtn) {
    buyBtn.addEventListener('click', function() {
      const activePanel = document.querySelector('.order-type-panel.active');
      const type = activePanel.getAttribute('data-type');
      placeOrder(type, 'buy');
    });
  }
  
  if (sellBtn) {
    sellBtn.addEventListener('click', function() {
      const activePanel = document.querySelector('.order-type-panel.active');
      const type = activePanel.getAttribute('data-type');
      placeOrder(type, 'sell');
    });
  }
  
  // Refresh button
  const refreshBtn = document.querySelector('.refresh-btn');
  
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async function() {
      if (dexState.selectedMarket) {
        await selectMarket(dexState.selectedMarket._id);
        showToast('データを更新しました。');
      }
    });
  }
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
document.addEventListener('DOMContentLoaded', initDEX);
