# OptimaChain Backend API

OptimaChainのバックエンドAPIサーバーです。ウォレット、取引所、ブロックチェーン関連の機能を提供します。

## 機能

- ユーザー認証（登録、ログイン）
- ウォレット管理
- トランザクション処理
- トークン情報
- マーケットデータ

## 技術スタック

- Node.js
- Express
- MongoDB (開発中はモックデータを使用)
- JWT認証

## インストール方法

```bash
# リポジトリをクローン
git clone https://github.com/optimachain/optimachain-backend.git
cd optimachain-backend

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集して必要な設定を行う

# 開発サーバーの起動
npm run dev
```

## API エンドポイント

### 認証

- `POST /api/users/login` - ユーザーログイン
- `POST /api/users/register` - ユーザー登録
- `GET /api/users/profile` - ユーザープロフィール取得
- `PUT /api/users/profile` - ユーザープロフィール更新

### ウォレット

- `GET /api/wallets` - ユーザーのウォレット一覧取得
- `POST /api/wallets` - 新規ウォレット作成
- `GET /api/wallets/:id` - ウォレット詳細取得
- `PUT /api/wallets/:id` - ウォレット更新
- `GET /api/wallets/:id/transactions` - ウォレットのトランザクション履歴取得
- `POST /api/wallets/:id/send` - トークン送金
- `GET /api/wallets/:id/balance` - ウォレット残高取得

### トランザクション

- `GET /api/transactions` - ユーザーのトランザクション一覧取得
- `GET /api/transactions/:id` - トランザクション詳細取得
- `GET /api/transactions/hash/:hash` - ハッシュによるトランザクション検索
- `POST /api/transactions/swap` - トークンスワップ

### トークン

- `GET /api/tokens` - トークン一覧取得
- `GET /api/tokens/:id` - トークン詳細取得
- `GET /api/tokens/symbol/:symbol` - シンボルによるトークン検索
- `POST /api/tokens` - 新規トークン作成 (管理者のみ)
- `PUT /api/tokens/:id` - トークン情報更新 (管理者のみ)

### マーケット

- `GET /api/market` - マーケット一覧取得
- `GET /api/market/:id` - マーケット詳細取得
- `GET /api/market/pair/:pair` - ペアによるマーケット検索
- `GET /api/market/:id/orderbook` - オーダーブック取得
- `GET /api/market/:id/trades` - 最近の取引履歴取得
- `GET /api/market/:id/chart` - チャートデータ取得
- `POST /api/market` - 新規マーケット作成 (管理者のみ)

## 開発モード

現在、開発モードではモックデータを使用しています。実際のデータベース接続は実装されていません。

## ライセンス

MIT