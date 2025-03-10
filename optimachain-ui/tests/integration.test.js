/**
 * OptimaChain 統合テスト
 * 
 * このテストスイートはOptimaChainのウォレットとDEXの連携をテストします。
 * Jest + Puppeteerを使用してブラウザ上での動作を確認します。
 */

const puppeteer = require('puppeteer');
const { expect } = require('@jest/globals');

// テスト設定
const BASE_URL = 'http://localhost:53819';
const WALLET_URL = `${BASE_URL}/wallet/index.html`;
const DEX_URL = `${BASE_URL}/dex/index.html`;

// テスト用のタイムアウト設定
jest.setTimeout(60000);

describe('OptimaChain Integration Tests', () => {
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

  // ウォレットからDEXへの連携テスト
  test('Wallet to DEX integration works correctly', async () => {
    // ウォレットページを開く
    await page.goto(WALLET_URL);
    
    // ウォレットアドレスを取得
    const addressElement = await page.$('.account-address');
    const walletAddress = await page.evaluate(el => el.textContent, addressElement);
    
    // DEXページに移動
    await page.goto(DEX_URL);
    
    // ウォレット接続ボタンをクリック
    await page.click('button#connect-wallet');
    
    // ウォレット選択モーダルが表示されることを確認
    await expect(page).toMatchElement('.modal.active');
    
    // OptimaWalletを選択
    await page.click('.wallet-option[data-wallet="optimawallet"]');
    
    // 接続成功のトーストメッセージが表示されることを確認
    await expect(page).toMatchElement('.toast', { text: 'ウォレットに接続しました' });
    
    // 接続されたウォレットアドレスがウォレットページと同じであることを確認
    const connectButton = await page.$('#connect-wallet');
    const buttonText = await page.evaluate(el => el.textContent, connectButton);
    
    // アドレスの短縮表示のため、先頭と末尾の部分だけ比較
    const walletAddressStart = walletAddress.substring(0, 6);
    const walletAddressEnd = walletAddress.substring(walletAddress.length - 4);
    
    expect(buttonText).toContain(walletAddressStart);
    expect(buttonText).toContain(walletAddressEnd);
    
    // 残高が表示されていることを確認
    await expect(page).toMatchElement('.token-balance', { text: 'OPT' });
  });

  // DEXでのトレード後にウォレット残高が更新されるかテスト
  test('DEX trading updates wallet balance correctly', async () => {
    // DEXページを開く
    await page.goto(DEX_URL);
    
    // ウォレット接続
    await page.click('button#connect-wallet');
    await page.click('.wallet-option[data-wallet="optimawallet"]');
    
    // DEXでの初期残高を取得
    const initialBalanceElement = await page.$('.token-balance[data-token="OPT"]');
    const initialBalanceText = await page.evaluate(el => el.textContent, initialBalanceElement);
    const initialBalance = parseFloat(initialBalanceText.match(/[\d.]+/)[0]);
    
    // スワップタブを選択
    await page.click('button[data-tab="swap"]');
    
    // トークン量を入力
    await page.type('.from-amount-input', '10');
    
    // スワップボタンをクリック
    await page.click('button#swap-button');
    
    // スワップ成功のトーストメッセージが表示されることを確認
    await expect(page).toMatchElement('.toast', { text: 'スワップが完了しました' });
    
    // DEXでの更新後の残高を取得
    const updatedBalanceElement = await page.$('.token-balance[data-token="OPT"]');
    const updatedBalanceText = await page.evaluate(el => el.textContent, updatedBalanceElement);
    const updatedBalance = parseFloat(updatedBalanceText.match(/[\d.]+/)[0]);
    
    // 残高が減少していることを確認
    expect(updatedBalance).toBeLessThan(initialBalance);
    
    // ウォレットページに移動
    await page.goto(WALLET_URL);
    
    // ウォレットでの残高を取得
    const walletBalanceElement = await page.$('.balance-amount');
    const walletBalanceText = await page.evaluate(el => el.textContent, walletBalanceElement);
    const walletBalance = parseFloat(walletBalanceText);
    
    // ウォレットの残高がDEXの残高と一致することを確認
    expect(walletBalance).toBeCloseTo(updatedBalance, 1); // 小数点以下1桁まで一致
  });

  // ウォレットでの送金後にDEX残高が更新されるかテスト
  test('Wallet transaction updates DEX balance correctly', async () => {
    // ウォレットページを開く
    await page.goto(WALLET_URL);
    
    // 初期残高を取得
    const initialBalanceElement = await page.$('.balance-amount');
    const initialBalanceText = await page.evaluate(el => el.textContent, initialBalanceElement);
    const initialBalance = parseFloat(initialBalanceText);
    
    // 送金ボタンをクリック
    await page.click('button.primary-btn');
    
    // 送金先アドレスと金額を入力
    await page.type('#send-to', '0x1234567890abcdef1234567890abcdef12345678');
    await page.type('#send-amount', '10');
    
    // 送金ボタンをクリック
    await page.click('#confirm-send');
    
    // 送金成功のトーストメッセージが表示されることを確認
    await expect(page).toMatchElement('.toast', { text: '送金が完了しました' });
    
    // 更新後の残高を取得
    const updatedBalanceElement = await page.$('.balance-amount');
    const updatedBalanceText = await page.evaluate(el => el.textContent, updatedBalanceElement);
    const updatedBalance = parseFloat(updatedBalanceText);
    
    // 残高が減少していることを確認
    expect(updatedBalance).toBeLessThan(initialBalance);
    
    // DEXページに移動
    await page.goto(DEX_URL);
    
    // ウォレット接続
    await page.click('button#connect-wallet');
    await page.click('.wallet-option[data-wallet="optimawallet"]');
    
    // DEXでの残高を取得
    const dexBalanceElement = await page.$('.token-balance[data-token="OPT"]');
    const dexBalanceText = await page.evaluate(el => el.textContent, dexBalanceElement);
    const dexBalance = parseFloat(dexBalanceText.match(/[\d.]+/)[0]);
    
    // DEXの残高がウォレットの残高と一致することを確認
    expect(dexBalance).toBeCloseTo(updatedBalance, 1); // 小数点以下1桁まで一致
  });
});