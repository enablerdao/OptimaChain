/**
 * OptimaChain Blockchain Interface テスト
 * 
 * このテストスイートはブロックチェーンインターフェースの機能をテストします。
 * Jestを使用してユニットテストを実行します。
 */

import blockchain from '../src/js/blockchain.js';

describe('Blockchain Interface Tests', () => {
  // ウォレット接続のテスト
  test('Connect wallet works correctly', async () => {
    const result = await blockchain.connectWallet('optimawallet');
    
    expect(result.success).toBe(true);
    expect(result.address).toBeDefined();
    expect(result.address).toMatch(/0x[a-fA-F0-9]+/);
    expect(blockchain.isConnected).toBe(true);
  });
  
  // ウォレット切断のテスト
  test('Disconnect wallet works correctly', async () => {
    // まず接続
    await blockchain.connectWallet('optimawallet');
    
    // 切断
    const result = await blockchain.disconnectWallet();
    
    expect(result.success).toBe(true);
    expect(blockchain.isConnected).toBe(false);
    expect(blockchain.wallet).toBeNull();
  });
  
  // 残高取得のテスト
  test('Get balance works correctly', async () => {
    // まず接続
    await blockchain.connectWallet('optimawallet');
    
    // 残高取得
    const result = await blockchain.getBalance();
    
    expect(result.success).toBe(true);
    expect(result.balance).toBeDefined();
    expect(result.balance.OPT).toBeDefined();
    expect(typeof result.balance.OPT).toBe('number');
    expect(result.balance.OPT).toBeGreaterThanOrEqual(0);
  });
  
  // 取引履歴取得のテスト
  test('Get transaction history works correctly', async () => {
    // まず接続
    await blockchain.connectWallet('optimawallet');
    
    // 取引履歴取得
    const result = await blockchain.getTransactionHistory();
    
    expect(result.success).toBe(true);
    expect(result.transactions).toBeDefined();
    expect(Array.isArray(result.transactions)).toBe(true);
    
    if (result.transactions.length > 0) {
      const firstTx = result.transactions[0];
      expect(firstTx.type).toBeDefined();
      expect(firstTx.amount).toBeDefined();
      expect(firstTx.token).toBeDefined();
      expect(firstTx.timestamp).toBeDefined();
    }
  });
  
  // トークン送金のテスト
  test('Send tokens works correctly', async () => {
    // まず接続
    await blockchain.connectWallet('optimawallet');
    
    // 送金前の残高を取得
    const balanceBefore = await blockchain.getBalance();
    const initialBalance = balanceBefore.balance.OPT;
    
    // トークン送金
    const result = await blockchain.sendTokens(
      '0x1234567890abcdef1234567890abcdef12345678',
      'OPT',
      10,
      'medium'
    );
    
    expect(result.success).toBe(true);
    expect(result.transaction).toBeDefined();
    expect(result.transaction.hash).toBeDefined();
    expect(result.transaction.status).toBeDefined();
    
    // 送金後の残高を取得
    const balanceAfter = await blockchain.getBalance();
    const finalBalance = balanceAfter.balance.OPT;
    
    // 残高が減少していることを確認
    expect(finalBalance).toBeLessThan(initialBalance);
  });
  
  // トークン情報取得のテスト
  test('Get token info works correctly', async () => {
    const result = await blockchain.getTokenInfo('OPT');
    
    expect(result.success).toBe(true);
    expect(result.token).toBeDefined();
    expect(result.token.name).toBe('OptimaChain');
    expect(result.token.symbol).toBe('OPT');
    expect(result.token.decimals).toBeDefined();
    expect(result.token.totalSupply).toBeDefined();
    expect(result.token.price).toBeDefined();
  });
  
  // 全トークン取得のテスト
  test('Get all tokens works correctly', async () => {
    const result = await blockchain.getAllTokens();
    
    expect(result.success).toBe(true);
    expect(result.tokens).toBeDefined();
    expect(Object.keys(result.tokens).length).toBeGreaterThan(0);
    expect(result.tokens.OPT).toBeDefined();
    expect(result.tokens.USDT).toBeDefined();
  });
  
  // 取引ペア取得のテスト
  test('Get trading pairs works correctly', async () => {
    const result = await blockchain.getTradingPairs();
    
    expect(result.success).toBe(true);
    expect(result.pairs).toBeDefined();
    expect(Array.isArray(result.pairs)).toBe(true);
    expect(result.pairs.length).toBeGreaterThan(0);
    
    const firstPair = result.pairs[0];
    expect(firstPair.base).toBeDefined();
    expect(firstPair.quote).toBeDefined();
    expect(firstPair.price).toBeDefined();
    expect(firstPair.change).toBeDefined();
  });
  
  // 注文板取得のテスト
  test('Get orderbook works correctly', async () => {
    const result = await blockchain.getOrderbook('OPT/USDT');
    
    expect(result.success).toBe(true);
    expect(result.orderbook).toBeDefined();
    expect(result.orderbook.asks).toBeDefined();
    expect(result.orderbook.bids).toBeDefined();
    expect(Array.isArray(result.orderbook.asks)).toBe(true);
    expect(Array.isArray(result.orderbook.bids)).toBe(true);
    
    if (result.orderbook.asks.length > 0) {
      const firstAsk = result.orderbook.asks[0];
      expect(firstAsk.price).toBeDefined();
      expect(firstAsk.amount).toBeDefined();
    }
    
    if (result.orderbook.bids.length > 0) {
      const firstBid = result.orderbook.bids[0];
      expect(firstBid.price).toBeDefined();
      expect(firstBid.amount).toBeDefined();
    }
  });
  
  // 最近の取引取得のテスト
  test('Get recent trades works correctly', async () => {
    const result = await blockchain.getRecentTrades('OPT/USDT');
    
    expect(result.success).toBe(true);
    expect(result.trades).toBeDefined();
    expect(Array.isArray(result.trades)).toBe(true);
    
    if (result.trades.length > 0) {
      const firstTrade = result.trades[0];
      expect(firstTrade.type).toBeDefined();
      expect(firstTrade.price).toBeDefined();
      expect(firstTrade.amount).toBeDefined();
      expect(firstTrade.timestamp).toBeDefined();
    }
  });
  
  // 指値注文のテスト
  test('Place limit order works correctly', async () => {
    // まず接続
    await blockchain.connectWallet('optimawallet');
    
    // 指値注文
    const result = await blockchain.placeLimitOrder(
      'OPT/USDT',
      'buy',
      0.5,
      20
    );
    
    expect(result.success).toBe(true);
    expect(result.order).toBeDefined();
    expect(result.order.id).toBeDefined();
    expect(result.order.status).toBeDefined();
    expect(result.order.pair).toBe('OPT/USDT');
    expect(result.order.side).toBe('buy');
    expect(result.order.price).toBe(0.5);
    expect(result.order.amount).toBe(20);
  });
  
  // 成行注文のテスト
  test('Place market order works correctly', async () => {
    // まず接続
    await blockchain.connectWallet('optimawallet');
    
    // 成行注文
    const result = await blockchain.placeMarketOrder(
      'OPT/USDT',
      'buy',
      15
    );
    
    expect(result.success).toBe(true);
    expect(result.order).toBeDefined();
    expect(result.order.id).toBeDefined();
    expect(result.order.status).toBeDefined();
    expect(result.order.pair).toBe('OPT/USDT');
    expect(result.order.side).toBe('buy');
    expect(result.order.amount).toBe(15);
  });
  
  // トークンスワップのテスト
  test('Swap tokens works correctly', async () => {
    // まず接続
    await blockchain.connectWallet('optimawallet');
    
    // 送金前の残高を取得
    const balanceBefore = await blockchain.getBalance();
    const initialFromBalance = balanceBefore.balance.OPT;
    
    // トークンスワップ
    const result = await blockchain.swapTokens(
      'OPT',
      'USDT',
      10
    );
    
    expect(result.success).toBe(true);
    expect(result.transaction).toBeDefined();
    expect(result.transaction.hash).toBeDefined();
    expect(result.transaction.status).toBeDefined();
    
    // スワップ後の残高を取得
    const balanceAfter = await blockchain.getBalance();
    const finalFromBalance = balanceAfter.balance.OPT;
    const finalToBalance = balanceAfter.balance.USDT;
    
    // OPT残高が減少していることを確認
    expect(finalFromBalance).toBeLessThan(initialFromBalance);
    // USDT残高が増加していることを確認
    expect(finalToBalance).toBeGreaterThan(0);
  });
});