# OptimaChain バリデータセットアップガイド

このガイドでは、OptimaChainのバリデータノードをセットアップして実行する方法を説明します。

## 必要条件

### ハードウェア要件
- CPU: 8コア以上（推奨: 16コア）
- RAM: 32GB以上（推奨: 64GB）
- ストレージ: 1TB以上のNVMe SSD
- ネットワーク: 1Gbps以上の安定した接続

### ソフトウェア要件
- Ubuntu 22.04 LTS以上
- Docker 20.10以上
- Docker Compose 2.0以上
- Git

## インストール手順

### 1. 依存関係のインストール

```bash
# システムの更新
sudo apt update && sudo apt upgrade -y

# 必要なパッケージのインストール
sudo apt install -y build-essential curl git jq lz4 unzip

# Dockerのインストール
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Docker Composeのインストール
sudo curl -L "https://github.com/docker/compose/releases/download/v2.18.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. OptimaChainノードソフトウェアのダウンロード

```bash
# リポジトリのクローン
git clone https://github.com/optimachain/node.git
cd node

# 最新のリリースに切り替え
git checkout $(git describe --tags $(git rev-list --tags --max-count=1))
```

### 3. バリデータキーの生成

```bash
# キー生成ツールの実行
./scripts/generate-keys.sh

# 出力されたキー情報を安全に保管してください
# validator_key.json と node_key.json が生成されます
```

### 4. 設定ファイルの編集

```bash
# 設定テンプレートのコピー
cp config/config.example.toml config/config.toml

# お好みのエディタで設定ファイルを編集
nano config/config.toml
```

主な設定項目:
- `moniker`: バリデータの識別名
- `external_address`: パブリックIPアドレスとポート
- `seeds`: シードノードのリスト（デフォルト値を使用可）
- `persistent_peers`: 永続的なピア接続（オプション）

### 5. ノードの起動

```bash
# Docker Composeでノードを起動
docker-compose up -d

# ログの確認
docker-compose logs -f
```

### 6. ステーキングとバリデータ登録

OptimaChainのウェブウォレットにアクセスし、以下の手順でバリデータを登録します:

1. ウォレットを作成または復元
2. 必要な量のOPTトークンを入金
3. 「バリデータ」セクションに移動
4. 「新規バリデータ作成」をクリック
5. 必要情報を入力:
   - バリデータ名
   - 説明
   - コミッション率
   - ウェブサイト（オプション）
   - バリデータ公開鍵（`validator_key.json`から）
6. 必要な量のOPTをステーキング
7. トランザクションを確認

### 7. バリデータステータスの確認

```bash
# ノードのステータス確認
curl http://localhost:26657/status

# バリデータセットの確認
curl http://localhost:26657/validators

# 自分のバリデータ情報の確認
curl http://localhost:1317/staking/validators/{YOUR_VALIDATOR_ADDRESS}
```

## 運用とメンテナンス

### ノードの更新

```bash
# 最新コードの取得
git pull

# 最新のリリースに切り替え
git checkout $(git describe --tags $(git rev-list --tags --max-count=1))

# ノードの再起動
docker-compose down
docker-compose up -d
```

### バックアップ

定期的にデータディレクトリとキーファイルをバックアップしてください:

```bash
# データディレクトリのバックアップ
tar -czf optima-data-backup-$(date +%Y%m%d).tar.gz data/

# キーファイルのバックアップ
cp validator_key.json validator_key.json.backup
cp node_key.json node_key.json.backup
```

### モニタリング

Prometheusとgrafanaを使用したモニタリング設定:

```bash
# モニタリングスタックの起動
docker-compose -f docker-compose.monitoring.yml up -d
```

Grafanaダッシュボードは http://your-server-ip:3000 でアクセス可能です。

## トラブルシューティング

### ノードが同期しない場合

```bash
# ノードの再起動
docker-compose restart

# ログの確認
docker-compose logs -f
```

### ピア接続の問題

```bash
# ネットワーク設定の確認
curl http://localhost:26657/net_info

# 手動でピアを追加
docker-compose exec node optima-cli tendermint show-node-id
# 出力されたノードIDを使用して他のノードに接続
```

### バリデータがアクティブでない場合

1. ステーキング量が最小要件を満たしているか確認
2. バリデータ公開鍵が正しいか確認
3. ノードが完全に同期しているか確認

## サポートとリソース

- [公式ドキュメント](https://docs.optimachain.network)
- [Discord コミュニティ](https://discord.gg/optimachain)
- [GitHub リポジトリ](https://github.com/optimachain)
- [ブロックエクスプローラー](https://explorer.optimachain.network)

問題が解決しない場合は、Discordの #validator-support チャンネルでサポートを受けてください。