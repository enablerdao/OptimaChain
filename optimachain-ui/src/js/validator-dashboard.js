/**
 * OptimaChain バリデータダッシュボード
 * 
 * このスクリプトはバリデータネットワークのリアルタイムデータを表示するためのダッシュボードを提供します。
 */

import { io } from 'https://cdn.socket.io/4.4.1/socket.io.esm.min.js';

// ソケット接続の設定
const socket = io('http://localhost:3000');

// チャートの設定
let networkMetricsChart;
let validatorMetricsChart;
let blockTimeChart;
let tpsChart;

// 最新のネットワークメトリクス
let latestNetworkMetrics = null;

// 最新のバリデータリスト
let latestValidators = [];

// 最新のブロックデータ
let latestBlocks = [];

// チャートデータ
const chartData = {
  networkMetrics: {
    labels: [],
    datasets: [
      {
        label: 'アクティブバリデータ',
        data: [],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4
      },
      {
        label: 'ネットワークアップタイム (%)',
        data: [],
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        tension: 0.4
      }
    ]
  },
  blockTime: {
    labels: [],
    datasets: [
      {
        label: 'ブロック生成時間 (ms)',
        data: [],
        borderColor: 'rgba(255, 159, 64, 1)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        tension: 0.4
      }
    ]
  },
  tps: {
    labels: [],
    datasets: [
      {
        label: 'トランザクション/秒',
        data: [],
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4
      }
    ]
  }
};

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', () => {
  initCharts();
  setupSocketListeners();
  setupUIListeners();
  loadValidatorCommands();
});

// チャートの初期化
function initCharts() {
  const networkCtx = document.getElementById('network-metrics-chart').getContext('2d');
  const blockTimeCtx = document.getElementById('block-time-chart').getContext('2d');
  const tpsCtx = document.getElementById('tps-chart').getContext('2d');
  
  // ネットワークメトリクスチャート
  networkMetricsChart = new Chart(networkCtx, {
    type: 'line',
    data: chartData.networkMetrics,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
  
  // ブロック時間チャート
  blockTimeChart = new Chart(blockTimeCtx, {
    type: 'line',
    data: chartData.blockTime,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
  
  // TPSチャート
  tpsChart = new Chart(tpsCtx, {
    type: 'line',
    data: chartData.tps,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// ソケットリスナーの設定
function setupSocketListeners() {
  // ネットワークメトリクスの更新
  socket.on('network:metrics', (metrics) => {
    latestNetworkMetrics = metrics;
    updateNetworkMetricsUI(metrics);
    updateNetworkMetricsChart(metrics);
  });
  
  // バリデータリストの更新
  socket.on('validators:list', (validators) => {
    latestValidators = validators;
    updateValidatorsTable(validators);
  });
  
  // 新しいブロックの処理
  socket.on('network:block', (blockData) => {
    latestBlocks.unshift(blockData);
    if (latestBlocks.length > 10) {
      latestBlocks.pop();
    }
    updateBlocksTable(latestBlocks);
  });
  
  // バリデータメトリクスの更新
  socket.on('validator:metrics', (validatorMetrics) => {
    updateValidatorMetrics(validatorMetrics);
  });
  
  // 接続エラー処理
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
    showNotification('サーバーへの接続に失敗しました。', 'error');
  });
  
  // 再接続処理
  socket.on('reconnect', (attemptNumber) => {
    console.log(`Reconnected after ${attemptNumber} attempts`);
    showNotification('サーバーに再接続しました。', 'success');
  });
}

// UIリスナーの設定
function setupUIListeners() {
  // OSタブの切り替え
  const osTabs = document.querySelectorAll('.os-tab');
  const osContents = document.querySelectorAll('.os-content');
  
  osTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const os = tab.getAttribute('data-os');
      
      // タブのアクティブ状態を切り替え
      osTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // コンテンツの表示を切り替え
      osContents.forEach(content => {
        if (content.getAttribute('data-os') === os) {
          content.classList.add('active');
        } else {
          content.classList.remove('active');
        }
      });
    });
  });
  
  // コマンドのコピーボタン
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('copy-btn')) {
      const commandBlock = e.target.closest('.command-block');
      const commandText = commandBlock.querySelector('code').textContent;
      
      navigator.clipboard.writeText(commandText)
        .then(() => {
          showNotification('コマンドをクリップボードにコピーしました。', 'success');
        })
        .catch(err => {
          console.error('コピーに失敗しました:', err);
          showNotification('コピーに失敗しました。', 'error');
        });
    }
  });
}

// ネットワークメトリクスUIの更新
function updateNetworkMetricsUI(metrics) {
  document.getElementById('active-validators').textContent = metrics.activeValidators;
  document.getElementById('total-validators').textContent = metrics.totalValidators;
  document.getElementById('block-height').textContent = metrics.blockHeight.toLocaleString();
  document.getElementById('avg-block-time').textContent = metrics.averageBlockTime.toFixed(2) + ' ms';
  document.getElementById('network-uptime').textContent = metrics.networkUptime.toFixed(2) + '%';
  document.getElementById('tps-value').textContent = metrics.tps.toFixed(2);
  document.getElementById('total-transactions').textContent = metrics.totalTransactions.toLocaleString();
  document.getElementById('total-stake').textContent = metrics.totalStake.toLocaleString();
  
  // 最終ブロック時間の表示
  if (metrics.lastBlockTime) {
    const date = new Date(metrics.lastBlockTime);
    document.getElementById('last-block-time').textContent = date.toLocaleTimeString();
  }
  
  // 稼働時間の表示
  const runningTimeInSeconds = metrics.runningTime || 0;
  const hours = Math.floor(runningTimeInSeconds / 3600);
  const minutes = Math.floor((runningTimeInSeconds % 3600) / 60);
  const seconds = runningTimeInSeconds % 60;
  document.getElementById('network-running-time').textContent = 
    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// ネットワークメトリクスチャートの更新
function updateNetworkMetricsChart(metrics) {
  const now = new Date().toLocaleTimeString();
  
  // 時間ラベルの追加
  chartData.networkMetrics.labels.push(now);
  chartData.blockTime.labels.push(now);
  chartData.tps.labels.push(now);
  
  // データの追加
  chartData.networkMetrics.datasets[0].data.push(metrics.activeValidators);
  chartData.networkMetrics.datasets[1].data.push(metrics.networkUptime);
  chartData.blockTime.datasets[0].data.push(metrics.averageBlockTime);
  chartData.tps.datasets[0].data.push(metrics.tps);
  
  // データポイントを最大30に制限
  if (chartData.networkMetrics.labels.length > 30) {
    chartData.networkMetrics.labels.shift();
    chartData.networkMetrics.datasets.forEach(dataset => dataset.data.shift());
    chartData.blockTime.labels.shift();
    chartData.blockTime.datasets.forEach(dataset => dataset.data.shift());
    chartData.tps.labels.shift();
    chartData.tps.datasets.forEach(dataset => dataset.data.shift());
  }
  
  // チャートの更新
  networkMetricsChart.update();
  blockTimeChart.update();
  tpsChart.update();
}

// バリデータテーブルの更新
function updateValidatorsTable(validators) {
  const tableBody = document.getElementById('validators-table-body');
  if (!tableBody) return;
  
  // テーブルをクリア
  tableBody.innerHTML = '';
  
  // バリデータをパワー順にソート
  validators.sort((a, b) => b.power - a.power);
  
  // 上位10バリデータを表示
  validators.slice(0, 10).forEach((validator, index) => {
    const row = document.createElement('tr');
    
    // ステータスに応じたクラスを追加
    if (validator.status === 'active') {
      row.classList.add('active-validator');
    }
    
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${validator.moniker}</td>
      <td>${validator.power.toLocaleString()}</td>
      <td>${validator.commission * 100}%</td>
      <td>${validator.uptime.toFixed(2)}%</td>
      <td>${validator.blocksProposed}</td>
      <td>${validator.blocksValidated}</td>
      <td>
        <span class="status-indicator ${validator.status}"></span>
        ${validator.status === 'active' ? 'アクティブ' : '非アクティブ'}
      </td>
    `;
    
    tableBody.appendChild(row);
  });
}

// ブロックテーブルの更新
function updateBlocksTable(blocks) {
  const tableBody = document.getElementById('blocks-table-body');
  if (!tableBody) return;
  
  // テーブルをクリア
  tableBody.innerHTML = '';
  
  // 最新10ブロックを表示
  blocks.forEach(block => {
    const row = document.createElement('tr');
    const date = new Date(block.timestamp);
    
    row.innerHTML = `
      <td>${block.height.toLocaleString()}</td>
      <td>${block.hash.substring(0, 8)}...${block.hash.substring(block.hash.length - 8)}</td>
      <td>${block.transactions}</td>
      <td>${date.toLocaleTimeString()}</td>
      <td>${block.proposerMoniker || 'Unknown'}</td>
    `;
    
    tableBody.appendChild(row);
  });
}

// バリデータメトリクスの更新
function updateValidatorMetrics(validatorMetrics) {
  // バリデータリストの更新
  if (latestValidators) {
    const validatorIndex = latestValidators.findIndex(v => v.id === validatorMetrics.id);
    if (validatorIndex !== -1) {
      latestValidators[validatorIndex] = {
        ...latestValidators[validatorIndex],
        ...validatorMetrics
      };
      updateValidatorsTable(latestValidators);
    }
  }
}

// バリデータコマンドの読み込み
async function loadValidatorCommands() {
  try {
    const response = await fetch('http://localhost:3000/api/validators/commands/setup');
    const data = await response.json();
    
    if (data.commands) {
      updateCommandsUI(data.commands);
    }
  } catch (error) {
    console.error('Failed to load validator commands:', error);
    showNotification('バリデータコマンドの読み込みに失敗しました。', 'error');
  }
}

// コマンドUIの更新
function updateCommandsUI(commands) {
  const linuxCommands = document.getElementById('linux-commands');
  const macosCommands = document.getElementById('macos-commands');
  const windowsCommands = document.getElementById('windows-commands');
  const cloudCommands = document.getElementById('cloud-commands');
  
  if (linuxCommands && commands.linux) {
    linuxCommands.innerHTML = `
      <div class="command-block">
        <div class="command-header">
          <h4>${commands.linux.title}</h4>
          <button class="copy-btn">コピー</button>
        </div>
        <pre><code>${commands.linux.commands.join('\n')}</code></pre>
      </div>
    `;
  }
  
  if (macosCommands && commands.macos) {
    macosCommands.innerHTML = `
      <div class="command-block">
        <div class="command-header">
          <h4>${commands.macos.title}</h4>
          <button class="copy-btn">コピー</button>
        </div>
        <pre><code>${commands.macos.commands.join('\n')}</code></pre>
      </div>
    `;
  }
  
  if (windowsCommands && commands.windows) {
    windowsCommands.innerHTML = `
      <div class="command-block">
        <div class="command-header">
          <h4>${commands.windows.title}</h4>
          <button class="copy-btn">コピー</button>
        </div>
        <pre><code>${commands.windows.commands.join('\n')}</code></pre>
      </div>
    `;
  }
  
  if (cloudCommands && commands.cloud) {
    cloudCommands.innerHTML = `
      <div class="command-block">
        <div class="command-header">
          <h4>${commands.cloud.title}</h4>
          <button class="copy-btn">コピー</button>
        </div>
        <pre><code>${commands.cloud.commands.join('\n')}</code></pre>
      </div>
    `;
  }
}

// 通知の表示
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // アニメーション
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // 自動的に消える
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// エクスポート
export default {
  socket,
  latestNetworkMetrics,
  latestValidators,
  latestBlocks
};