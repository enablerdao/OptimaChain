/**
 * OptimaChain Wallet テスト
 * 
 * このテストスイートはOptimaChainウォレットの機能をテストします。
 * Jest + Puppeteerを使用してブラウザ上での動作を確認します。
 */

const puppeteer = require('puppeteer');
const { expect } = require('@jest/globals');

// テスト設定
const BASE_URL = 'http://localhost:53819';
const WALLET_URL = `${BASE_URL}/wallet/index.html`;
const DEX_URL = `${BASE_URL}/dex/index.html`;

// テスト用のタイムアウト設定
jest.setTimeout(30000);

describe('OptimaChain Wallet Tests', () => {
  let browser;
  let page;

  // 各テスト前にブラウザを起動
  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  });

  // 各テスト後にブラウザを閉じる
  afterAll(async () => {
    await browser.close();
  });

  // 各テスト前にページを新規作成
  beforeEach(async () => {
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
  });

  // 各テスト後にページを閉じる
  afterEach(async () => {
    await page.close();
  });

  // ウォレットページの基本的な表示テスト
  test('Wallet page loads correctly', async () => {
    await page.goto(WALLET_URL);
    
    // タイトルの確認
    const title = await page.title();
    expect(title).toBe('OptimaWallet - 次世代ブロックチェーンウォレット');
    
    // 主要な要素が表示されていることを確認
    await expect(page).toMatchElement('h3', { text: 'マイアカウント' });
    await expect(page).toMatchElement('button', { text: '送金' });
    await expect(page).toMatchElement('button', { text: '受取' });
    
    // ウォレットアドレスが表示されていることを確認
    const addressElement = await page.$('.account-address');
    const address = await page.evaluate(el => el.textContent, addressElement);
    expect(address).toMatch(/0x[a-fA-F0-9]+/);
    
    // 残高が表示されていることを確認
    const balanceElement = await page.$('.balance-amount');
    const balance = await page.evaluate(el => el.textContent, balanceElement);
    expect(parseFloat(balance)).toBeGreaterThanOrEqual(0);
  });

  // 送金機能のテスト
  test('Send transaction works correctly', async () => {
    await page.goto(WALLET_URL);
    
    // 送金ボタンをクリック
    await page.click('button.primary-btn');
    
    // 送金モーダルが表示されることを確認
    await expect(page).toMatchElement('.modal.active');
    await expect(page).toMatchElement('h2', { text: '送金' });
    
    // 送金先アドレスと金額を入力
    await page.type('#send-to', '0x1234567890abcdef1234567890abcdef12345678');
    await page.type('#send-amount', '10');
    
    // 手数料オプションを選択
    await page.click('.fee-option[data-fee="medium"]');
    
    // 送金ボタンをクリック
    await page.click('#confirm-send');
    
    // 送金成功のトーストメッセージが表示されることを確認
    await expect(page).toMatchElement('.toast', { text: '送金が完了しました' });
    
    // 残高が更新されていることを確認
    const balanceElement = await page.$('.balance-amount');
    const balance = await page.evaluate(el => el.textContent, balanceElement);
    expect(parseFloat(balance)).toBeLessThan(1250); // 初期残高から減少していることを確認
  });

  // 受取機能のテスト
  test('Receive functionality works correctly', async () => {
    await page.goto(WALLET_URL);
    
    // 受取ボタンをクリック
    await page.click('button.secondary-btn');
    
    // 受取モーダルが表示されることを確認
    await expect(page).toMatchElement('.modal.active');
    await expect(page).toMatchElement('h2', { text: '受取' });
    
    // QRコードが生成されていることを確認
    const qrCodeElement = await page.$('#qr-code canvas');
    expect(qrCodeElement).not.toBeNull();
    
    // ウォレットアドレスが表示されていることを確認
    const walletAddressElement = await page.$('#wallet-address');
    const walletAddress = await page.evaluate(el => el.value, walletAddressElement);
    expect(walletAddress).toMatch(/0x[a-fA-F0-9]+/);
  });

  // 残高更新機能のテスト
  test('Balance refresh works correctly', async () => {
    await page.goto(WALLET_URL);
    
    // 更新ボタンをクリック
    await page.click('#refresh-balance');
    
    // 更新成功のトーストメッセージが表示されることを確認
    await expect(page).toMatchElement('.toast', { text: '残高を更新しました' });
  });

  // 取引履歴の表示テスト
  test('Transaction history displays correctly', async () => {
    await page.goto(WALLET_URL);
    
    // 取引履歴が表示されていることを確認
    const transactionElements = await page.$$('.activity-item');
    expect(transactionElements.length).toBeGreaterThan(0);
    
    // 最初の取引の詳細が正しく表示されていることを確認
    const firstTransaction = transactionElements[0];
    const transactionType = await page.evaluate(el => el.querySelector('.activity-type').textContent, firstTransaction);
    const transactionAmount = await page.evaluate(el => el.querySelector('.activity-amount').textContent, firstTransaction);
    
    expect(transactionType).toBe('受取');
    expect(transactionAmount).toContain('OPT');
  });
});

describe('OptimaChain DEX Tests', () => {
  let browser;
  let page;

  // 各テスト前にブラウザを起動
  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  });

  // 各テスト後にブラウザを閉じる
  afterAll(async () => {
    await browser.close();
  });

  // 各テスト前にページを新規作成
  beforeEach(async () => {
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
  });

  // 各テスト後にページを閉じる
  afterEach(async () => {
    await page.close();
  });

  // DEXページの基本的な表示テスト
  test('DEX page loads correctly', async () => {
    await page.goto(DEX_URL);
    
    // タイトルの確認
    const title = await page.title();
    expect(title).toBe('OptimaDEX - 分散型取引所');
    
    // 主要な要素が表示されていることを確認
    await expect(page).toMatchElement('button', { text: 'ウォレット接続' });
    await expect(page).toMatchElement('h2', { text: 'OPT / USDT' });
    
    // タブが表示されていることを確認
    await expect(page).toMatchElement('button', { text: 'スワップ' });
    await expect(page).toMatchElement('button', { text: '指値注文' });
    await expect(page).toMatchElement('button', { text: '成行注文' });
  });

  // ウォレット接続機能のテスト
  test('Wallet connection works correctly', async () => {
    await page.goto(DEX_URL);
    
    // ウォレット接続ボタンをクリック
    await page.click('button#connect-wallet');
    
    // ウォレット選択モーダルが表示されることを確認
    await expect(page).toMatchElement('.modal.active');
    await expect(page).toMatchElement('h2', { text: 'ウォレットを接続' });
    
    // OptimaWalletを選択
    await page.click('.wallet-option[data-wallet="optimawallet"]');
    
    // 接続成功のトーストメッセージが表示されることを確認
    await expect(page).toMatchElement('.toast', { text: 'ウォレットに接続しました' });
    
    // ウォレットアドレスが表示されていることを確認
    const connectButton = await page.$('#connect-wallet');
    const buttonText = await page.evaluate(el => el.textContent, connectButton);
    expect(buttonText).toMatch(/0x[a-fA-F0-9]+/);
  });

  // スワップ機能のテスト
  test('Token swap works correctly', async () => {
    await page.goto(DEX_URL);
    
    // ウォレット接続
    await page.click('button#connect-wallet');
    await page.click('.wallet-option[data-wallet="optimawallet"]');
    
    // スワップタブを選択
    await page.click('button[data-tab="swap"]');
    
    // トークン量を入力
    await page.type('.from-amount-input', '10');
    
    // スワップボタンをクリック
    await page.click('button#swap-button');
    
    // スワップ成功のトーストメッセージが表示されることを確認
    await expect(page).toMatchElement('.toast', { text: 'スワップが完了しました' });
  });

  // 指値注文機能のテスト
  test('Limit order works correctly', async () => {
    await page.goto(DEX_URL);
    
    // ウォレット接続
    await page.click('button#connect-wallet');
    await page.click('.wallet-option[data-wallet="optimawallet"]');
    
    // 指値注文タブを選択
    await page.click('button[data-tab="limit"]');
    
    // 価格と数量を入力
    await page.type('.price-input', '0.5');
    await page.type('.amount-input', '20');
    
    // 買い注文を出す
    await page.click('button#limit-buy-button');
    
    // 注文成功のトーストメッセージが表示されることを確認
    await expect(page).toMatchElement('.toast', { text: '注文が出されました' });
  });

  // 成行注文機能のテスト
  test('Market order works correctly', async () => {
    await page.goto(DEX_URL);
    
    // ウォレット接続
    await page.click('button#connect-wallet');
    await page.click('.wallet-option[data-wallet="optimawallet"]');
    
    // 成行注文タブを選択
    await page.click('button[data-tab="market"]');
    
    // 数量を入力
    await page.type('.amount-input', '15');
    
    // 成行買い注文を出す
    await page.click('button#market-buy-button');
    
    // 注文成功のトーストメッセージが表示されることを確認
    await expect(page).toMatchElement('.toast', { text: '注文が約定しました' });
  });

  // 注文板の表示テスト
  test('Orderbook displays correctly', async () => {
    await page.goto(DEX_URL);
    
    // 注文板が表示されていることを確認
    await expect(page).toMatchElement('h3', { text: '注文板' });
    
    // 注文が表示されていることを確認
    const orderElements = await page.$$('.order-item');
    expect(orderElements.length).toBeGreaterThan(0);
  });

  // 最近の取引の表示テスト
  test('Recent trades display correctly', async () => {
    await page.goto(DEX_URL);
    
    // 最近の取引が表示されていることを確認
    await expect(page).toMatchElement('h3', { text: '最近の取引' });
    
    // 取引が表示されていることを確認
    const tradeElements = await page.$$('.trade-item');
    expect(tradeElements.length).toBeGreaterThan(0);
  });
});