# OptimaChain Core

OptimaChainのコアブロックチェーン実装です。Rustで書かれており、高性能で安全なブロックチェーンネットワークを実現します。

## 機能

- **Adaptive Proof-of-Stake（APoS）** コンセンサスアルゴリズム
- **動的シャーディング** によるスケーラビリティの向上
- **並列実行エンジン** による高速トランザクション処理
- **WASM仮想マシン** によるスマートコントラクト実行
- **P2Pネットワーク** による分散通信

## 技術スタック

- Rust
- libp2p (P2Pネットワーキング)
- RocksDB (ストレージ)
- Tokio (非同期ランタイム)
- WASM (WebAssembly)

## ディレクトリ構造

- `src/consensus` - コンセンサスアルゴリズムの実装
- `src/network` - P2Pネットワーク通信
- `src/sharding` - シャーディングロジック
- `src/storage` - ブロックチェーンデータの永続化
- `src/types` - 共通データ型
- `src/utils` - ユーティリティ関数
- `src/wasm` - WASM実行環境

## ビルド方法

```bash
# 依存関係のインストール
sudo apt update
sudo apt install -y build-essential pkg-config libssl-dev

# Rustツールチェーンのインストール（未インストールの場合）
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# リポジトリのクローン
git clone https://github.com/enablerdao/OptimaChain.git
cd OptimaChain/core

# ビルド
cargo build

# テスト実行
cargo test
```

## 開発ガイドライン

- コードはRustのスタイルガイドラインに従ってください
- 新機能を追加する前に、必ずテストを書いてください
- パフォーマンスクリティカルな部分は`#[bench]`でベンチマークを作成してください

## ライセンス

MIT
