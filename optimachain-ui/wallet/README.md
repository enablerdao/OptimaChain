# OptimaWallet

OptimaChainのブロックチェーン資産を管理するためのウォレットアプリケーションです。

## 機能

- アカウント作成・インポート
- トークン残高表示
- トークン送受信
- トランザクション履歴
- マルチチェーンサポート
- セキュアなキー管理

## 技術スタック

- HTML/CSS/JavaScript
- Web3.js
- Chart.js (残高グラフ表示)
- localStorage (セッション管理)

## 開発環境のセットアップ

```bash
# リポジトリをクローン
git clone https://github.com/enablerdao/OptimaChain.git
cd OptimaChain/optimachain-ui/wallet

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm start
```

## ファイル構造

- `index.html` - メインHTMLファイル
- `css/` - スタイルシート
- `js/` - JavaScriptファイル
  - `wallet.js` - ウォレット機能の実装
  - `transactions.js` - トランザクション処理
  - `ui.js` - UIコンポーネント
- `styles/` - 追加のスタイル定義

## 使用方法

1. ウォレットを作成またはインポート
2. トークンの残高を確認
3. 送金先アドレスとトークン量を入力して送金
4. トランザクション履歴で取引状況を確認

## 注意事項

現在はプロトタイプ版のため、実際の資産は使用しないでください。

## ライセンス

MIT
