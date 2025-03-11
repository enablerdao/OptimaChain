# OptimaDEX

OptimaChainの分散型取引所（DEX）アプリケーションです。トークンのスワップや取引を安全かつ効率的に行うことができます。

## 機能

- トークンスワップ
- 指値注文・成行注文
- リアルタイム価格チャート
- 流動性提供
- 取引履歴
- ウォレット連携

## 技術スタック

- HTML/CSS/JavaScript
- Web3.js
- Chart.js (価格チャート)
- Socket.io (リアルタイム更新)

## 開発環境のセットアップ

```bash
# リポジトリをクローン
git clone https://github.com/enablerdao/OptimaChain.git
cd OptimaChain/optimachain-ui/dex

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm start
```

## ファイル構造

- `index.html` - メインHTMLファイル
- `css/` - スタイルシート
- `js/` - JavaScriptファイル
  - `dex.js` - DEX機能の実装
  - `orderbook.js` - オーダーブック処理
  - `charts.js` - チャート表示
  - `liquidity.js` - 流動性プール管理

## 使用方法

1. ウォレットを接続
2. 取引したいトークンペアを選択
3. スワップまたは指値/成行注文を選択
4. 取引を実行

## 注意事項

現在はプロトタイプ版のため、実際の資産は使用しないでください。

## ライセンス

MIT
