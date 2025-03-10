/**
 * OptimaChain バリデータシミュレーション
 * 
 * このモジュールはOptimaChainのバリデータノードをシミュレートし、
 * リアルタイムのメトリクスを提供します。
 */

const EventEmitter = require('events');
const crypto = require('crypto');
const os = require('os');

class ValidatorNode extends EventEmitter {
  constructor(options = {}) {
    super();
    
    // バリデータの設定
    this.id = options.id || crypto.randomBytes(20).toString('hex');
    this.moniker = options.moniker || `validator-${this.id.substring(0, 8)}`;
    this.power = options.power || Math.floor(Math.random() * 1000) + 1;
    this.commission = options.commission || (Math.random() * 0.1).toFixed(2);
    this.uptime = 100;
    this.status = 'active';
    
    // パフォーマンスメトリクス
    this.metrics = {
      blocksProposed: 0,
      blocksValidated: 0,
      transactions: 0,
      lastBlockTime: Date.now(),
      peers: Math.floor(Math.random() * 50) + 10,
      latency: Math.floor(Math.random() * 100) + 10,
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 0,
      bandwidth: {
        in: 0,
        out: 0
      }
    };
    
    // シミュレーション設定
    this.simulationInterval = null;
    this.metricsInterval = null;
    this.blockTime = options.blockTime || 2000; // ミリ秒
    this.running = false;
  }
  
  // バリデータの起動
  start() {
    if (this.running) return;
    
    this.running = true;
    this.status = 'active';
    
    // ブロック生成のシミュレーション
    this.simulationInterval = setInterval(() => {
      this.simulateBlockProduction();
    }, this.blockTime);
    
    // システムメトリクスの更新
    this.metricsInterval = setInterval(() => {
      this.updateSystemMetrics();
    }, 1000);
    
    this.emit('started', { id: this.id, moniker: this.moniker });
    return this;
  }
  
  // バリデータの停止
  stop() {
    if (!this.running) return;
    
    this.running = false;
    this.status = 'inactive';
    
    clearInterval(this.simulationInterval);
    clearInterval(this.metricsInterval);
    
    this.emit('stopped', { id: this.id, moniker: this.moniker });
    return this;
  }
  
  // ブロック生成のシミュレーション
  simulateBlockProduction() {
    // 新しいブロックの生成
    const now = Date.now();
    const blockHeight = Math.floor(now / this.blockTime);
    const transactionsCount = Math.floor(Math.random() * 100) + 1;
    
    // メトリクスの更新
    this.metrics.blocksProposed += Math.random() < 0.1 ? 1 : 0; // 10%の確率でブロック提案
    this.metrics.blocksValidated += 1;
    this.metrics.transactions += transactionsCount;
    this.metrics.lastBlockTime = now;
    
    // バンド幅の更新（KB単位）
    this.metrics.bandwidth.in += Math.floor(Math.random() * 500) + 100;
    this.metrics.bandwidth.out += Math.floor(Math.random() * 1000) + 200;
    
    // 稀にアップタイムの変動をシミュレート
    if (Math.random() < 0.01) {
      this.uptime = Math.max(99, this.uptime - Math.random() * 0.1);
    }
    
    // イベント発行
    const blockData = {
      height: blockHeight,
      hash: crypto.createHash('sha256').update(`${this.id}-${blockHeight}`).digest('hex'),
      transactions: transactionsCount,
      timestamp: now,
      proposer: Math.random() < 0.1 ? this.id : crypto.randomBytes(20).toString('hex')
    };
    
    this.emit('block', blockData);
    return blockData;
  }
  
  // システムメトリクスの更新
  updateSystemMetrics() {
    // 実際のシステムメトリクスを取得（実環境では）
    // ここではシミュレーションデータを生成
    this.metrics.cpuUsage = Math.min(100, Math.max(5, this.metrics.cpuUsage + (Math.random() * 10 - 5)));
    this.metrics.memoryUsage = Math.min(100, Math.max(10, this.metrics.memoryUsage + (Math.random() * 6 - 3)));
    this.metrics.diskUsage = Math.min(100, Math.max(20, this.metrics.diskUsage + (Math.random() * 0.2 - 0.1)));
    
    // ピア数の変動をシミュレート
    if (Math.random() < 0.1) {
      this.metrics.peers = Math.max(5, this.metrics.peers + (Math.random() < 0.5 ? 1 : -1));
    }
    
    // レイテンシーの変動をシミュレート
    this.metrics.latency = Math.max(5, this.metrics.latency + (Math.random() * 10 - 5));
    
    this.emit('metrics', this.getMetrics());
  }
  
  // 現在のメトリクスを取得
  getMetrics() {
    return {
      id: this.id,
      moniker: this.moniker,
      power: this.power,
      commission: this.commission,
      uptime: this.uptime,
      status: this.status,
      metrics: this.metrics
    };
  }
  
  // バリデータ情報を取得
  getInfo() {
    return {
      id: this.id,
      moniker: this.moniker,
      power: this.power,
      commission: this.commission,
      uptime: this.uptime,
      status: this.status,
      peers: this.metrics.peers,
      blocksProposed: this.metrics.blocksProposed,
      blocksValidated: this.metrics.blocksValidated,
      transactions: this.metrics.transactions
    };
  }
}

// バリデータネットワークのシミュレーション
class ValidatorNetwork extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.validators = [];
    this.validatorCount = options.validatorCount || 100;
    this.activeValidators = options.activeValidators || 50;
    this.blockTime = options.blockTime || 2000;
    this.totalStake = 0;
    this.totalTransactions = 0;
    this.networkStartTime = Date.now();
    
    // ネットワークメトリクス
    this.metrics = {
      tps: 0, // トランザクション/秒
      blockHeight: 0,
      lastBlockTime: 0,
      averageBlockTime: this.blockTime,
      activeValidators: 0,
      totalValidators: 0,
      totalStake: 0,
      networkUptime: 100,
      consensusRounds: 0
    };
    
    this.metricsInterval = null;
  }
  
  // ネットワークの初期化
  initialize() {
    // バリデータの作成
    for (let i = 0; i < this.validatorCount; i++) {
      const power = Math.floor(Math.random() * 10000) + 1000;
      const validator = new ValidatorNode({
        moniker: `validator-${i+1}`,
        power: power,
        commission: (Math.random() * 0.2).toFixed(2),
        blockTime: this.blockTime
      });
      
      this.validators.push(validator);
      this.totalStake += power;
      
      // バリデータのイベントをリッスン
      validator.on('block', (blockData) => {
        this.handleNewBlock(validator, blockData);
      });
      
      validator.on('metrics', (metrics) => {
        this.emit('validator:metrics', metrics);
      });
    }
    
    // アクティブバリデータの起動
    for (let i = 0; i < this.activeValidators; i++) {
      this.validators[i].start();
    }
    
    // ネットワークメトリクスの更新
    this.metricsInterval = setInterval(() => {
      this.updateNetworkMetrics();
    }, 1000);
    
    this.emit('initialized', {
      validators: this.validators.length,
      activeValidators: this.activeValidators,
      totalStake: this.totalStake
    });
    
    return this;
  }
  
  // ネットワークの停止
  shutdown() {
    // すべてのバリデータを停止
    this.validators.forEach(validator => {
      if (validator.running) {
        validator.stop();
      }
    });
    
    clearInterval(this.metricsInterval);
    
    this.emit('shutdown');
    return this;
  }
  
  // 新しいブロックの処理
  handleNewBlock(proposer, blockData) {
    this.metrics.blockHeight = blockData.height;
    this.metrics.lastBlockTime = blockData.timestamp;
    this.totalTransactions += blockData.transactions;
    this.metrics.consensusRounds++;
    
    this.emit('block', {
      ...blockData,
      proposerMoniker: proposer.moniker
    });
  }
  
  // ネットワークメトリクスの更新
  updateNetworkMetrics() {
    const now = Date.now();
    const runningTime = (now - this.networkStartTime) / 1000; // 秒単位
    
    // アクティブバリデータのカウント
    this.metrics.activeValidators = this.validators.filter(v => v.running).length;
    this.metrics.totalValidators = this.validators.length;
    
    // TPSの計算（直近1秒間）
    const recentTransactions = this.validators.reduce((sum, v) => {
      return sum + (v.metrics.transactions - v.metrics.transactions);
    }, 0);
    this.metrics.tps = recentTransactions;
    
    // 平均ブロック時間の計算
    if (this.metrics.consensusRounds > 0) {
      this.metrics.averageBlockTime = runningTime * 1000 / this.metrics.consensusRounds;
    }
    
    // ネットワークアップタイムの計算
    const validatorUptimes = this.validators
      .filter(v => v.running)
      .map(v => v.uptime);
    
    if (validatorUptimes.length > 0) {
      this.metrics.networkUptime = validatorUptimes.reduce((sum, uptime) => sum + uptime, 0) / validatorUptimes.length;
    }
    
    this.emit('metrics', this.getNetworkMetrics());
  }
  
  // ネットワークメトリクスの取得
  getNetworkMetrics() {
    return {
      ...this.metrics,
      totalStake: this.totalStake,
      totalTransactions: this.totalTransactions,
      runningTime: Math.floor((Date.now() - this.networkStartTime) / 1000)
    };
  }
  
  // バリデータリストの取得
  getValidators(activeOnly = false) {
    let validators = this.validators;
    
    if (activeOnly) {
      validators = validators.filter(v => v.running);
    }
    
    return validators.map(v => v.getInfo());
  }
  
  // 特定のバリデータの取得
  getValidator(id) {
    const validator = this.validators.find(v => v.id === id);
    return validator ? validator.getMetrics() : null;
  }
  
  // バリデータの起動
  startValidator(id) {
    const validator = this.validators.find(v => v.id === id);
    if (validator && !validator.running) {
      validator.start();
      return true;
    }
    return false;
  }
  
  // バリデータの停止
  stopValidator(id) {
    const validator = this.validators.find(v => v.id === id);
    if (validator && validator.running) {
      validator.stop();
      return true;
    }
    return false;
  }
}

// シングルトンインスタンスの作成
const network = new ValidatorNetwork({
  validatorCount: 100,
  activeValidators: 50,
  blockTime: 2000
});

module.exports = {
  ValidatorNode,
  ValidatorNetwork,
  network
};