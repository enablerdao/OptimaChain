# OptimaChain スマートコントラクト

OptimaChainの核となるスマートコントラクト群です。高度なセキュリティと効率性を実現するための基盤技術を提供します。

## コントラクト概要

### MultiSigWallet.sol
複数の署名者による承認が必要なマルチシグネチャウォレット。プロジェクト資金の安全な管理に使用されます。

- 複数オーナーによる取引承認
- 柔軟な承認数設定
- 透明性の高いトランザクション管理

### OptimaTokenBridge.sol
異なるブロックチェーン間のトークン移動を管理するブリッジコントラクト。

- クロスチェーン資産移動（ETH、SOL、BTCなど対応）
- バリデータによる検証システム
- セキュアなトークンロック・リリースメカニズム

### OptimaStaking.sol
バリデータのステーキングと報酬分配を管理するコントラクト。

- 柔軟なステーキングメカニズム
- 自動報酬計算
- 調整可能な報酬率

## セットアップ手順

1. リポジトリをクローン
```
git clone https://github.com/optimachain/contracts.git
cd contracts
```

2. 依存関係をインストール
```
npm install
```

3. コントラクトをコンパイル
```
npx hardhat compile
```

4. テストを実行
```
npx hardhat test
```

5. デプロイ
```
npx hardhat run scripts/deploy.js --network <network-name>
```

## マルチシグウォレットの使用方法

1. トランザクションの提案
```javascript
await multiSig.submitTransaction(to, value, data);
```

2. トランザクションの承認
```javascript
await multiSig.confirmTransaction(txIndex);
```

3. トランザクションの実行
```javascript
await multiSig.executeTransaction(txIndex);
```

## バリデータノードのセットアップ

バリデータノードを実行するには、以下のコマンドを使用します：

```bash
# OptimaChainノードソフトウェアのダウンロード
git clone https://github.com/optimachain/node.git
cd node

# バリデータキーの生成
./scripts/generate-keys.sh

# 設定ファイルの編集
cp config/config.example.toml config/config.toml
nano config/config.toml

# ノードの起動
docker-compose up -d
```

詳細な手順については、[validator-guide.md](/validator-guide.md)を参照してください。

## クロスチェーン対応

OptimaChainは以下の主要ブロックチェーンとの相互運用性をサポートしています：

- Ethereum (ETH)
- Solana (SOL)
- Bitcoin (BTC)
- Binance Smart Chain (BNB)
- Polygon (MATIC)

## セキュリティ

- すべてのコントラクトは複数の監査を受けています
- 権限管理と検証メカニズムによる多層防御
- 厳格なテストカバレッジ

## ライセンス

MIT