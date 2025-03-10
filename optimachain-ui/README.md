# OptimaChain UI

このディレクトリには、モダンなフロントエンドフレームワーク（Vite）を使用したOptimaChainのユーザーインターフェースが含まれています。

## 特徴

- 高速な開発環境
- モダンなJavaScriptとCSSのサポート
- 最適化されたビルド出力
- 旧実装から統合された追加ページ

## 開発方法

```bash
# 依存関係のインストール
cd vite-app
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build
```

## ディレクトリ構造

- `src/` - ソースコード
  - `assets/` - 静的アセット
  - `css/` - スタイルシート
  - `img/` - 画像ファイル
  - `js/` - JavaScriptファイル
- `public/` - 静的ファイル（そのままコピーされるファイル）
- `pages/` - 旧実装から統合されたHTMLページ
  - `community.html` - コミュニティページ
  - `developers.html` - 開発者ページ
  - `ecosystem.html` - エコシステムページ
  - `exchange.html` - 取引所ページ
  - `features.html` - 特徴ページ
  - `roadmap.html` - ロードマップページ
  - `testnet.html` - テストネットページ
  - `token.html` - トークンページ

## 技術スタック

- Vite - ビルドツール
- Three.js - 3Dグラフィックス
- Chart.js - データ可視化

## 注意事項

このディレクトリには、旧実装（トップレベルのHTMLファイル）から統合された内容が含まれています。将来的には、すべてのページがこの新しい実装に移行される予定です。