/**
 * Jest Puppeteer 設定ファイル
 * 
 * このファイルはJest Puppeteerの設定を行います。
 */

module.exports = {
  launch: {
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: {
      width: 1280,
      height: 800
    }
  },
  server: {
    command: 'npm run dev -- --port 53819 --host 0.0.0.0',
    port: 53819,
    launchTimeout: 30000,
    debug: true
  }
};