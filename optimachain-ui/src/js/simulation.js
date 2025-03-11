// OptimaChain シミュレーション機能
// Use global THREE object instead of importing to avoid duplicate instances
// THREE is already loaded via CDN in the HTML

/**
 * ブロックチェーンシミュレーションの初期化
 * @param {Object} options - シミュレーションオプション
 */
window.initSimulation = function(options = {}) {
  const defaultOptions = {
    nodeCount: 100,
    tps: 5000,
    shardCount: 16,
    simulationSpeed: 1,
    visualize: true,
    logLevel: 'info'
  };

  const config = { ...defaultOptions, ...options };
  console.log('シミュレーション初期化:', config);

  if (config.visualize) {
    initVisualization(config);
  }

  return {
    start: () => startSimulation(config),
    stop: stopSimulation,
    addNode: (nodeType) => addNode(nodeType, config),
    removeNode: removeNode,
    setTPS: (tps) => setTPS(tps, config),
    getStats: getSimulationStats,
    adjustSharding: (shardCount) => adjustSharding(shardCount, config)
  };
}

/**
 * シミュレーションの視覚化を初期化
 * @param {Object} config - 設定オブジェクト
 */
function initVisualization(config) {
  console.log('視覚化初期化中...');
  
  // シミュレーションキャンバスの取得
  const canvas = document.getElementById('simulation-canvas');
  if (!canvas) {
    console.error('シミュレーションキャンバスが見つかりません');
    return;
  }
  
  const ctx = canvas.getContext('2d');
  
  // キャンバスサイズの設定
  const resizeCanvas = () => {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  };
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // ノードの初期配置
  const nodes = [];
  const shards = [];
  
  for (let i = 0; i < config.shardCount; i++) {
    shards.push({
      id: i,
      color: `hsl(${(i * 360) / config.shardCount}, 70%, 60%)`,
      nodes: []
    });
  }
  
  for (let i = 0; i < config.nodeCount; i++) {
    const shardId = i % config.shardCount;
    const node = {
      id: i,
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: 5,
      type: i < config.nodeCount * 0.2 ? 'validator' : 'normal',
      shardId: shardId,
      connections: []
    };
    
    nodes.push(node);
    shards[shardId].nodes.push(node);
  }
  
  // ノード間の接続を作成
  nodes.forEach(node => {
    // 同じシャード内のノードと接続
    const sameShardNodes = shards[node.shardId].nodes.filter(n => n.id !== node.id);
    const connectCount = Math.min(5, sameShardNodes.length);
    
    for (let i = 0; i < connectCount; i++) {
      const targetIndex = Math.floor(Math.random() * sameShardNodes.length);
      const target = sameShardNodes[targetIndex];
      
      if (!node.connections.includes(target.id)) {
        node.connections.push(target.id);
        target.connections.push(node.id);
      }
      
      sameShardNodes.splice(targetIndex, 1);
    }
    
    // 他のシャードとの接続（バリデーターノードのみ）
    if (node.type === 'validator') {
      const otherShards = shards.filter(s => s.id !== node.shardId);
      const connectShardCount = Math.min(3, otherShards.length);
      
      for (let i = 0; i < connectShardCount; i++) {
        const targetShardIndex = Math.floor(Math.random() * otherShards.length);
        const targetShard = otherShards[targetShardIndex];
        const validatorNodes = targetShard.nodes.filter(n => n.type === 'validator');
        
        if (validatorNodes.length > 0) {
          const targetNode = validatorNodes[Math.floor(Math.random() * validatorNodes.length)];
          
          if (!node.connections.includes(targetNode.id)) {
            node.connections.push(targetNode.id);
            targetNode.connections.push(node.id);
          }
        }
        
        otherShards.splice(targetShardIndex, 1);
      }
    }
  });
  
  // トランザクションの配列
  const transactions = [];
  
  // アニメーションフレーム
  let animationId = null;
  let lastTime = 0;
  const fps = 60;
  const interval = 1000 / fps;
  
  // トランザクション生成
  setInterval(() => {
    const transactionsPerFrame = config.tps / fps;
    const transactionsToAdd = Math.floor(transactionsPerFrame) + (Math.random() < (transactionsPerFrame % 1) ? 1 : 0);
    
    for (let i = 0; i < transactionsToAdd; i++) {
      const sourceShardId = Math.floor(Math.random() * config.shardCount);
      const targetShardId = Math.floor(Math.random() * config.shardCount);
      
      const sourceNode = shards[sourceShardId].nodes[Math.floor(Math.random() * shards[sourceShardId].nodes.length)];
      const targetNode = shards[targetShardId].nodes[Math.floor(Math.random() * shards[targetShardId].nodes.length)];
      
      transactions.push({
        id: Math.random().toString(36).substr(2, 9),
        source: sourceNode,
        target: targetNode,
        progress: 0,
        speed: 0.02 + Math.random() * 0.03,
        color: sourceShardId === targetShardId ? shards[sourceShardId].color : '#ffffff'
      });
    }
  }, interval);
  
  // アニメーション関数
  function animate(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const elapsed = timestamp - lastTime;
    
    if (elapsed > interval) {
      lastTime = timestamp - (elapsed % interval);
      
      // キャンバスをクリア
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // シャードの背景を描画
      shards.forEach(shard => {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(canvas.width, canvas.height) * 0.4;
        const angle = (shard.id * 2 * Math.PI) / config.shardCount;
        const shardX = centerX + radius * Math.cos(angle);
        const shardY = centerY + radius * Math.sin(angle);
        
        ctx.beginPath();
        ctx.arc(shardX, shardY, radius * 0.3, 0, 2 * Math.PI);
        ctx.fillStyle = `${shard.color}20`;
        ctx.fill();
        
        // シャードラベルを描画
        ctx.fillStyle = shard.color;
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Shard ${shard.id}`, shardX, shardY - radius * 0.3 - 10);
      });
      
      // 接続を描画
      ctx.strokeStyle = '#555555';
      ctx.lineWidth = 0.5;
      
      nodes.forEach(node => {
        node.connections.forEach(targetId => {
          const target = nodes.find(n => n.id === targetId);
          
          if (target && target.id > node.id) { // 各接続を一度だけ描画
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(target.x, target.y);
            ctx.stroke();
          }
        });
      });
      
      // トランザクションを描画・更新
      for (let i = transactions.length - 1; i >= 0; i--) {
        const tx = transactions[i];
        
        // 進行状況を更新
        tx.progress += tx.speed * config.simulationSpeed;
        
        if (tx.progress >= 1) {
          transactions.splice(i, 1);
          continue;
        }
        
        // トランザクションの現在位置を計算
        const x = tx.source.x + (tx.target.x - tx.source.x) * tx.progress;
        const y = tx.source.y + (tx.target.y - tx.source.y) * tx.progress;
        
        // トランザクションを描画
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = tx.color;
        ctx.fill();
      }
      
      // ノードを描画
      nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.type === 'validator' ? 7 : 5, 0, 2 * Math.PI);
        ctx.fillStyle = shards[node.shardId].color;
        ctx.fill();
        
        if (node.type === 'validator') {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
      
      // 統計情報を表示
      const activeTransactions = transactions.length;
      const completedTransactions = simulationStats.completedTransactions;
      const currentTPS = simulationStats.currentTPS;
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`アクティブトランザクション: ${activeTransactions}`, 20, 30);
      ctx.fillText(`完了トランザクション: ${completedTransactions}`, 20, 50);
      ctx.fillText(`現在のTPS: ${currentTPS.toFixed(0)}`, 20, 70);
      ctx.fillText(`シャード数: ${config.shardCount}`, 20, 90);
      ctx.fillText(`ノード数: ${config.nodeCount}`, 20, 110);
    }
    
    animationId = requestAnimationFrame(animate);
  }
  
  // シミュレーション統計
  const simulationStats = {
    startTime: Date.now(),
    completedTransactions: 0,
    currentTPS: 0,
    peakTPS: 0,
    averageTPS: 0
  };
  
  // 統計情報の更新
  setInterval(() => {
    const elapsedSeconds = (Date.now() - simulationStats.startTime) / 1000;
    simulationStats.completedTransactions += Math.floor(config.tps);
    simulationStats.currentTPS = config.tps;
    simulationStats.averageTPS = simulationStats.completedTransactions / elapsedSeconds;
    simulationStats.peakTPS = Math.max(simulationStats.peakTPS, simulationStats.currentTPS);
  }, 1000);
  
  // アニメーションを開始
  animationId = requestAnimationFrame(animate);
  
  // グローバルオブジェクトに保存
  window.simulationState = {
    canvas,
    ctx,
    nodes,
    shards,
    transactions,
    animationId,
    stats: simulationStats
  };
}

/**
 * シミュレーションを開始
 * @param {Object} config - 設定オブジェクト
 */
function startSimulation(config) {
  console.log('シミュレーション開始:', config);
  
  if (window.simulationState && window.simulationState.animationId === null) {
    window.simulationState.animationId = requestAnimationFrame(function animate(timestamp) {
      // アニメーション再開のロジック
    });
  }
  
  // シミュレーション開始イベントをディスパッチ
  document.dispatchEvent(new CustomEvent('simulation:started', { detail: config }));
  
  return true;
}

/**
 * シミュレーションを停止
 */
function stopSimulation() {
  console.log('シミュレーション停止');
  
  if (window.simulationState && window.simulationState.animationId !== null) {
    cancelAnimationFrame(window.simulationState.animationId);
    window.simulationState.animationId = null;
  }
  
  // シミュレーション停止イベントをディスパッチ
  document.dispatchEvent(new CustomEvent('simulation:stopped'));
  
  return true;
}

/**
 * ノードを追加
 * @param {string} nodeType - ノードタイプ ('validator' または 'normal')
 * @param {Object} config - 設定オブジェクト
 */
function addNode(nodeType, config) {
  if (!window.simulationState) return false;
  
  const { nodes, shards, canvas } = window.simulationState;
  
  // シャードをランダムに選択
  const shardId = Math.floor(Math.random() * config.shardCount);
  
  // 新しいノードを作成
  const newNode = {
    id: nodes.length,
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: 5,
    type: nodeType || 'normal',
    shardId: shardId,
    connections: []
  };
  
  // 同じシャード内のノードと接続
  const sameShardNodes = shards[shardId].nodes;
  const connectCount = Math.min(5, sameShardNodes.length);
  
  for (let i = 0; i < connectCount; i++) {
    const targetIndex = Math.floor(Math.random() * sameShardNodes.length);
    const target = sameShardNodes[targetIndex];
    
    newNode.connections.push(target.id);
    target.connections.push(newNode.id);
  }
  
  // ノードをシャードに追加
  nodes.push(newNode);
  shards[shardId].nodes.push(newNode);
  
  // 設定を更新
  config.nodeCount = nodes.length;
  
  console.log(`${nodeType} ノードを追加しました (ID: ${newNode.id}, シャード: ${shardId})`);
  
  return newNode.id;
}

/**
 * ノードを削除
 * @param {number} nodeId - 削除するノードのID
 */
function removeNode(nodeId) {
  if (!window.simulationState) return false;
  
  const { nodes, shards } = window.simulationState;
  
  // ノードを検索
  const nodeIndex = nodes.findIndex(node => node.id === nodeId);
  if (nodeIndex === -1) return false;
  
  const node = nodes[nodeIndex];
  
  // 接続を削除
  node.connections.forEach(targetId => {
    const target = nodes.find(n => n.id === targetId);
    if (target) {
      const connectionIndex = target.connections.indexOf(nodeId);
      if (connectionIndex !== -1) {
        target.connections.splice(connectionIndex, 1);
      }
    }
  });
  
  // シャードからノードを削除
  const shardNodeIndex = shards[node.shardId].nodes.findIndex(n => n.id === nodeId);
  if (shardNodeIndex !== -1) {
    shards[node.shardId].nodes.splice(shardNodeIndex, 1);
  }
  
  // ノードを削除
  nodes.splice(nodeIndex, 1);
  
  console.log(`ノードを削除しました (ID: ${nodeId})`);
  
  return true;
}

/**
 * TPSを設定
 * @param {number} tps - 1秒あたりのトランザクション数
 * @param {Object} config - 設定オブジェクト
 */
function setTPS(tps, config) {
  if (tps < 0) return false;
  
  config.tps = tps;
  console.log(`TPSを設定: ${tps}`);
  
  return true;
}

/**
 * シミュレーション統計を取得
 */
function getSimulationStats() {
  if (!window.simulationState) return null;
  
  return { ...window.simulationState.stats };
}

/**
 * シャーディングを調整
 * @param {number} shardCount - シャード数
 * @param {Object} config - 設定オブジェクト
 */
function adjustSharding(shardCount, config) {
  if (!window.simulationState || shardCount < 1) return false;
  
  const { nodes, shards, canvas } = window.simulationState;
  
  // 現在のシャード数
  const currentShardCount = shards.length;
  
  // シャード数が同じ場合は何もしない
  if (shardCount === currentShardCount) return true;
  
  // シャード数を増やす場合
  if (shardCount > currentShardCount) {
    for (let i = currentShardCount; i < shardCount; i++) {
      shards.push({
        id: i,
        color: `hsl(${(i * 360) / shardCount}, 70%, 60%)`,
        nodes: []
      });
    }
  }
  // シャード数を減らす場合
  else {
    // 削除するシャードのノードを残りのシャードに再分配
    for (let i = shardCount; i < currentShardCount; i++) {
      const nodesToRedistribute = shards[i].nodes;
      
      nodesToRedistribute.forEach(node => {
        const newShardId = Math.floor(Math.random() * shardCount);
        node.shardId = newShardId;
        shards[newShardId].nodes.push(node);
        
        // 接続をリセット
        node.connections = [];
      });
    }
    
    // シャード配列を切り詰める
    shards.length = shardCount;
  }
  
  // 既存のシャードの色を更新
  shards.forEach((shard, index) => {
    shard.color = `hsl(${(index * 360) / shardCount}, 70%, 60%)`;
  });
  
  // すべてのノードの接続を再構築
  nodes.forEach(node => {
    // 接続をクリア
    node.connections = [];
    
    // 同じシャード内のノードと接続
    const sameShardNodes = shards[node.shardId].nodes.filter(n => n.id !== node.id);
    const connectCount = Math.min(5, sameShardNodes.length);
    
    for (let i = 0; i < connectCount; i++) {
      if (sameShardNodes.length === 0) break;
      
      const targetIndex = Math.floor(Math.random() * sameShardNodes.length);
      const target = sameShardNodes[targetIndex];
      
      node.connections.push(target.id);
      target.connections.push(node.id);
      
      sameShardNodes.splice(targetIndex, 1);
    }
    
    // 他のシャードとの接続（バリデーターノードのみ）
    if (node.type === 'validator') {
      const otherShards = shards.filter(s => s.id !== node.shardId);
      const connectShardCount = Math.min(3, otherShards.length);
      
      for (let i = 0; i < connectShardCount; i++) {
        if (otherShards.length === 0) break;
        
        const targetShardIndex = Math.floor(Math.random() * otherShards.length);
        const targetShard = otherShards[targetShardIndex];
        const validatorNodes = targetShard.nodes.filter(n => n.type === 'validator');
        
        if (validatorNodes.length > 0) {
          const targetNode = validatorNodes[Math.floor(Math.random() * validatorNodes.length)];
          
          node.connections.push(targetNode.id);
          targetNode.connections.push(node.id);
        }
        
        otherShards.splice(targetShardIndex, 1);
      }
    }
  });
  
  // 設定を更新
  config.shardCount = shardCount;
  
  console.log(`シャード数を調整: ${shardCount}`);
  
  return true;
}

// シミュレーションUIコントロールの初期化
window.initSimulationControls = function(simulation) {
  document.addEventListener('DOMContentLoaded', () => {
    // TPSスライダー
    const tpsSlider = document.getElementById('tps-slider');
    const tpsValue = document.getElementById('tps-value');
    
    if (tpsSlider && tpsValue) {
      tpsSlider.addEventListener('input', () => {
        const tps = parseInt(tpsSlider.value);
        tpsValue.textContent = tps.toLocaleString();
        simulation.setTPS(tps);
      });
    }
    
    // シャード数スライダー
    const shardSlider = document.getElementById('shard-slider');
    const shardValue = document.getElementById('shard-value');
    
    if (shardSlider && shardValue) {
      shardSlider.addEventListener('input', () => {
        const shardCount = parseInt(shardSlider.value);
        shardValue.textContent = shardCount;
        simulation.adjustSharding(shardCount);
      });
    }
    
    // ノード追加ボタン
    const addValidatorBtn = document.getElementById('add-validator-btn');
    const addNodeBtn = document.getElementById('add-node-btn');
    
    if (addValidatorBtn) {
      addValidatorBtn.addEventListener('click', () => {
        simulation.addNode('validator');
      });
    }
    
    if (addNodeBtn) {
      addNodeBtn.addEventListener('click', () => {
        simulation.addNode('normal');
      });
    }
    
    // シミュレーション開始/停止ボタン
    const startStopBtn = document.getElementById('start-stop-btn');
    
    if (startStopBtn) {
      let isRunning = true;
      
      startStopBtn.addEventListener('click', () => {
        if (isRunning) {
          simulation.stop();
          startStopBtn.textContent = 'シミュレーション開始';
        } else {
          simulation.start();
          startStopBtn.textContent = 'シミュレーション停止';
        }
        
        isRunning = !isRunning;
      });
    }
  });
}
