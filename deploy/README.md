# OptimaChain デプロイスクリプト

OptimaChainのスマートコントラクトをデプロイするためのスクリプトとツールです。

## 概要

このディレクトリには、OptimaChainのスマートコントラクトをさまざまなネットワーク（テストネット、メインネットなど）にデプロイするためのスクリプトが含まれています。

## 主要なスクリプト

- `deploy.js` - メインデプロイスクリプト（MultiSigWallet、OptimaTokenBridge、OptimaStakingなど）

## 使用方法

### 環境設定

1. `.env`ファイルを作成し、必要な環境変数を設定します：

```
PRIVATE_KEY=your_private_key
INFURA_API_KEY=your_infura_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### デプロイ手順

```bash
# 依存関係のインストール
npm install

# テストネットへのデプロイ
npx hardhat run deploy.js --network goerli

# メインネットへのデプロイ
npx hardhat run deploy.js --network mainnet
```

## デプロイ設定

デプロイ設定は`hardhat.config.js`ファイルで管理されています。新しいネットワークを追加する場合は、このファイルを編集してください。

## セキュリティ注意事項

- 秘密鍵は`.env`ファイルに保存し、Gitにコミットしないでください
- 本番環境へのデプロイ前に、必ずテストネットでテストしてください
- マルチシグウォレットのオーナーは慎重に選択してください

## ライセンス

MIT
