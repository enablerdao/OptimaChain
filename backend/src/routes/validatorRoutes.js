const express = require('express');
const router = express.Router();
const { network } = require('../../../core/validator');

// バリデータネットワークの初期化（まだ初期化されていない場合）
if (!network.validators.length) {
  network.initialize();
}

// すべてのバリデータを取得
router.get('/', (req, res) => {
  const activeOnly = req.query.active === 'true';
  const validators = network.getValidators(activeOnly);
  res.json({ validators });
});

// ネットワークメトリクスを取得
router.get('/metrics', (req, res) => {
  const metrics = network.getNetworkMetrics();
  res.json({ metrics });
});

// 特定のバリデータを取得
router.get('/:id', (req, res) => {
  const validator = network.getValidator(req.params.id);
  if (!validator) {
    return res.status(404).json({ message: 'Validator not found' });
  }
  res.json({ validator });
});

// バリデータを起動
router.post('/:id/start', (req, res) => {
  const success = network.startValidator(req.params.id);
  if (!success) {
    return res.status(400).json({ message: 'Failed to start validator' });
  }
  res.json({ message: 'Validator started successfully' });
});

// バリデータを停止
router.post('/:id/stop', (req, res) => {
  const success = network.stopValidator(req.params.id);
  if (!success) {
    return res.status(400).json({ message: 'Failed to stop validator' });
  }
  res.json({ message: 'Validator stopped successfully' });
});

// バリデータコマンドの取得
router.get('/commands/setup', (req, res) => {
  // 各OSごとのセットアップコマンド
  const commands = {
    linux: {
      title: 'Linux',
      commands: [
        '# システムの更新',
        'sudo apt update && sudo apt upgrade -y',
        '',
        '# 必要なパッケージのインストール',
        'sudo apt install -y build-essential curl git jq lz4 unzip',
        '',
        '# Dockerのインストール',
        'curl -fsSL https://get.docker.com -o get-docker.sh',
        'sudo sh get-docker.sh',
        'sudo usermod -aG docker $USER',
        '',
        '# OptimaChainノードソフトウェアのダウンロード',
        'git clone https://github.com/enablerdao/OptimaChain-node.git',
        'cd OptimaChain-node',
        '',
        '# バリデータの起動',
        'docker-compose up -d'
      ]
    },
    macos: {
      title: 'macOS',
      commands: [
        '# Homebrewのインストール（まだインストールしていない場合）',
        '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"',
        '',
        '# 必要なパッケージのインストール',
        'brew install git jq lz4 unzip',
        '',
        '# Dockerのインストール',
        'brew install --cask docker',
        '',
        '# OptimaChainノードソフトウェアのダウンロード',
        'git clone https://github.com/enablerdao/OptimaChain-node.git',
        'cd OptimaChain-node',
        '',
        '# バリデータの起動',
        'docker-compose up -d'
      ]
    },
    windows: {
      title: 'Windows',
      commands: [
        '# Dockerのインストール',
        '# https://docs.docker.com/desktop/install/windows-install/ からDockerデスクトップをダウンロードしてインストール',
        '',
        '# GitのインストールとWSL2の有効化',
        '# https://git-scm.com/download/win からGitをダウンロードしてインストール',
        '',
        '# PowerShellを管理者として実行し、WSL2を有効化',
        'wsl --install',
        '',
        '# OptimaChainノードソフトウェアのダウンロード',
        'git clone https://github.com/enablerdao/OptimaChain-node.git',
        'cd OptimaChain-node',
        '',
        '# バリデータの起動',
        'docker-compose up -d'
      ]
    },
    cloud: {
      title: 'クラウド（AWS/GCP/Azure）',
      commands: [
        '# インスタンスの作成（推奨スペック: 8vCPU, 32GB RAM, 1TB SSD）',
        '',
        '# システムの更新',
        'sudo apt update && sudo apt upgrade -y',
        '',
        '# 必要なパッケージのインストール',
        'sudo apt install -y build-essential curl git jq lz4 unzip',
        '',
        '# Dockerのインストール',
        'curl -fsSL https://get.docker.com -o get-docker.sh',
        'sudo sh get-docker.sh',
        'sudo usermod -aG docker $USER',
        '',
        '# OptimaChainノードソフトウェアのダウンロード',
        'git clone https://github.com/enablerdao/OptimaChain-node.git',
        'cd OptimaChain-node',
        '',
        '# バリデータの起動',
        'docker-compose up -d'
      ]
    }
  };
  
  res.json({ commands });
});

module.exports = router;