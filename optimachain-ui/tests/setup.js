/**
 * Jest テスト設定ファイル
 * 
 * このファイルはJestテストの実行前に読み込まれ、テスト環境の設定を行います。
 */

// Puppeteerのマッチャーを追加
require('expect-puppeteer');

// グローバルタイムアウトの設定
jest.setTimeout(30000);

// コンソールエラーをキャプチャして表示
console.error = (message) => {
  console.log(`Error: ${message}`);
};

// テスト環境のグローバル変数
global.BASE_URL = 'http://localhost:53819';
global.WALLET_URL = `${global.BASE_URL}/wallet/index.html`;
global.DEX_URL = `${global.BASE_URL}/dex/index.html`;

// テスト用のモックデータ
global.MOCK_WALLET_ADDRESS = '0x7a58c0d9b9ab3246a89e7d7c4a3e02e8';
global.MOCK_TRANSACTION_HASH = '0x8a7d8f9e7c6b5a4d3c2b1a0f9e8d7c6b5a4d3c2b1a0f9e8d7c6b5a4d3c2b1a0f';

// テスト用のヘルパー関数
global.waitForToast = async (page, text) => {
  await page.waitForSelector('.toast', { visible: true });
  const toastText = await page.$eval('.toast', el => el.textContent);
  expect(toastText).toContain(text);
};

// テスト用のモックオブジェクト
global.mockBlockchain = {
  connectWallet: jest.fn().mockResolvedValue({
    success: true,
    address: global.MOCK_WALLET_ADDRESS,
    message: 'Connected to wallet'
  }),
  getBalance: jest.fn().mockResolvedValue({
    success: true,
    balance: {
      OPT: 1250.00,
      USDT: 0.00,
      ETH: 0.00
    }
  }),
  sendTokens: jest.fn().mockResolvedValue({
    success: true,
    transaction: {
      hash: global.MOCK_TRANSACTION_HASH,
      status: 'confirmed'
    }
  })
};