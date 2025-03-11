# OptimaChain UI

OptimaChainのユーザーインターフェース（UI）コンポーネントです。ウォレット、DEX（分散型取引所）、およびメインウェブサイトを含みます。

## 機能

- **メインウェブサイト**: OptimaChainプロジェクトの情報を提供
- **ウォレット**: OptimaChainトークンの管理、送金、受取
- **DEX**: トークンの取引、スワップ、注文管理
- 高速な開発環境（Vite）
- モダンなJavaScriptとCSSのサポート
- 最適化されたビルド出力

## 開発環境のセットアップ

### 必要条件

- Node.js 18.x以上
- npm 9.x以上

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/enablerdao/OptimaChain.git
cd OptimaChain/optimachain-ui

# 依存関係をインストール
npm install
```

### 開発サーバーの起動

```bash
# 開発サーバーを起動
npm run dev
```

デフォルトでは、サーバーは http://localhost:5173 で起動します。

### ビルド

```bash
# 本番用にビルド
npm run build
```

ビルドされたファイルは `dist` ディレクトリに出力されます。

## テスト

OptimaChain UIは、Jest + Puppeteerを使用して自動テストを実行します。

### テストの実行

```bash
# すべてのテストを実行
npm test

# 監視モードでテストを実行（ファイル変更時に自動的に再実行）
npm run test:watch

# カバレッジレポートを生成
npm run test:coverage
```

### テストの種類

- **ユニットテスト**: 個々のコンポーネントやモジュールの機能をテスト
- **統合テスト**: 複数のコンポーネント間の連携をテスト
- **E2Eテスト**: ユーザーの視点からの全体的な機能をテスト

## プロジェクト構造

```
optimachain-ui/
├── public/          # 静的ファイル
├── src/             # ソースコード
│   ├── js/          # JavaScriptファイル
│   └── css/         # CSSファイル
├── wallet/          # ウォレットアプリケーション
│   ├── css/         # ウォレット用CSS
│   ├── js/          # ウォレット用JavaScript
│   └── index.html   # ウォレットのメインページ
├── dex/             # DEXアプリケーション
│   ├── css/         # DEX用CSS
│   ├── js/          # DEX用JavaScript
│   └── index.html   # DEXのメインページ
├── pages/           # 統合されたHTMLページ
│   ├── community.html  # コミュニティページ
│   ├── developers.html # 開発者ページ
│   └── ...          # その他のページ
├── tests/           # テストファイル
│   ├── wallet.test.js     # ウォレットのテスト
│   ├── blockchain.test.js # ブロックチェーンインターフェースのテスト
│   └── integration.test.js # 統合テスト
├── index.html       # メインウェブサイトのエントリーポイント
└── vite.config.js   # Vite設定ファイル
```

## デプロイ

### Netlifyへのデプロイ

```bash
# Netlify CLIをインストール
npm install -g netlify-cli

# Netlifyにデプロイ
netlify deploy
```

### 手動デプロイ

1. `npm run build` を実行してビルド
2. `dist` ディレクトリの内容をウェブサーバーにアップロード

## ブロックチェーンインターフェース

OptimaChain UIは、`src/js/blockchain.js` で定義されたブロックチェーンインターフェースを使用してブロックチェーンと通信します。このインターフェースは以下の機能を提供します：

- ウォレット接続/切断
- 残高取得
- トークン送金
- 取引履歴取得
- DEX機能（注文、スワップなど）

## 技術スタック

- Vite - ビルドツール
- Three.js - 3Dグラフィックス
- Chart.js - データ可視化
- Jest + Puppeteer - テスト

## ライセンス

MIT License