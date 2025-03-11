// OptimaChain - ネットワーク統計ビジュアライゼーション
import * as THREE from 'three';

// ネットワーク統計ビジュアライゼーションの初期化
export function initNetworkStatsVisualization() {
  // ネットワーク統計セクションが存在するか確認
  const container = document.getElementById('network-stats-container');
  if (!container) {
    console.log('ネットワーク統計コンテナが見つかりません');
    
    // コンテナが存在しない場合は作成して挿入
    createNetworkStatsSection();
    return;
  }
  
  // タブ切り替え機能の初期化
  initTabs();
  
  // ネットワークビジュアルの初期化
  initNetworkVisual();
  
  // スライダーの初期化
  initLoadSlider();
}

// ネットワーク統計セクションの作成
function createNetworkStatsSection() {
  // メインコンテンツの最初のセクションを取得
  const heroSection = document.querySelector('.hero');
  if (!heroSection) return;
  
  // 新しいセクションを作成
  const statsSection = document.createElement('section');
  statsSection.className = 'network-stats-section';
  
  // HTMLコンテンツを設定
  statsSection.innerHTML = `
    <div class="wrapper">
      <div class="section-header">
        <div class="section-tag">NETWORK</div>
        <h2 class="section-title">ネットワーク統計</h2>
        <p class="section-subtitle">
          OptimaChainネットワークのリアルタイム統計情報
        </p>
      </div>
      
      <div class="network-tabs">
        <div class="tab active" data-tab="apos">AI-Adaptive PoS</div>
        <div class="tab" data-tab="sharding">自己最適化シャーディング</div>
        <div class="tab" data-tab="smart-contract">AI予測型スマートコントラクト</div>
      </div>
      
      <div class="network-stats-container" id="network-stats-container">
        <div class="network-stats-info">
          <div class="stats-item">
            <div class="stats-label">エポック:</div>
            <div class="stats-value" id="epoch-value">12</div>
          </div>
          <div class="stats-item">
            <div class="stats-label">バリデータ数:</div>
            <div class="stats-value" id="validator-count">5</div>
          </div>
          <div class="stats-item">
            <div class="stats-label">ネットワーク負荷:</div>
            <div class="stats-value" id="network-load">50%</div>
          </div>
        </div>
        
        <div class="network-visual">
          <canvas id="network-canvas" width="600" height="400"></canvas>
        </div>
        
        <div class="network-controls">
          <div class="load-slider-container">
            <span class="slider-label">ネットワーク負荷:</span>
            <input type="range" id="load-slider" min="0" max="100" value="50" class="load-slider">
            <span class="slider-value">50%</span>
            <button id="apply-load" class="apply-button">適用</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // ヒーローセクションの後に挿入
  heroSection.parentNode.insertBefore(statsSection, heroSection.nextSibling);
  
  // スタイルを追加
  addNetworkStatsStyles();
  
  // 機能を初期化
  initTabs();
  initNetworkVisual();
  initLoadSlider();
}

// ネットワーク統計のスタイルを追加
function addNetworkStatsStyles() {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    .network-stats-section {
      padding: 80px 0;
      background-color: var(--bg-color-secondary);
      position: relative;
      overflow: hidden;
    }
    
    .network-tabs {
      display: flex;
      margin-bottom: 30px;
      border-bottom: 2px solid rgba(var(--primary-rgb), 0.2);
    }
    
    .network-tabs .tab {
      padding: 12px 24px;
      cursor: pointer;
      font-weight: 600;
      color: var(--text-color-secondary);
      transition: all 0.3s ease;
      position: relative;
    }
    
    .network-tabs .tab.active {
      color: var(--primary-color);
    }
    
    .network-tabs .tab.active::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: var(--primary-color);
    }
    
    .network-stats-container {
      display: flex;
      flex-direction: column;
      background-color: var(--bg-color-tertiary);
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    }
    
    .network-stats-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    
    .stats-item {
      display: flex;
      align-items: center;
    }
    
    .stats-label {
      font-size: 14px;
      color: var(--text-color-secondary);
      margin-right: 8px;
    }
    
    .stats-value {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-color-primary);
    }
    
    .network-visual {
      width: 100%;
      height: 400px;
      position: relative;
      margin-bottom: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .network-controls {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .load-slider-container {
      display: flex;
      align-items: center;
      background-color: rgba(var(--primary-rgb), 0.1);
      padding: 10px 20px;
      border-radius: 30px;
    }
    
    .slider-label {
      font-size: 14px;
      color: var(--text-color-secondary);
      margin-right: 10px;
    }
    
    .load-slider {
      width: 200px;
      margin: 0 10px;
      -webkit-appearance: none;
      height: 6px;
      background: linear-gradient(to right, var(--primary-color) 0%, var(--primary-color) 50%, rgba(var(--primary-rgb), 0.3) 50%, rgba(var(--primary-rgb), 0.3) 100%);
      border-radius: 3px;
      outline: none;
    }
    
    .load-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: var(--primary-color);
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    }
    
    .slider-value {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-color-primary);
      width: 40px;
      text-align: center;
    }
    
    .apply-button {
      background-color: var(--primary-color);
      color: white;
      border: none;
      border-radius: 20px;
      padding: 8px 16px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-left: 10px;
    }
    
    .apply-button:hover {
      background-color: var(--primary-color-dark);
    }
    
    @media (max-width: 768px) {
      .network-stats-info {
        flex-direction: column;
        gap: 10px;
      }
      
      .network-tabs {
        flex-wrap: wrap;
      }
      
      .load-slider-container {
        flex-wrap: wrap;
        justify-content: center;
      }
      
      .load-slider {
        width: 100%;
        margin: 10px 0;
      }
    }
  `;
  
  document.head.appendChild(styleElement);
}

// タブ切り替え機能の初期化
function initTabs() {
  const tabs = document.querySelectorAll('.network-tabs .tab');
  if (!tabs.length) return;
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // アクティブクラスを切り替え
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // タブに応じたコンテンツ切り替え
      const tabId = tab.getAttribute('data-tab');
      updateNetworkVisual(tabId);
    });
  });
}

// ネットワークビジュアルの初期化
function initNetworkVisual() {
  const canvas = document.getElementById('network-canvas');
  if (!canvas) return;
  
  // シーン、カメラ、レンダラーの設定
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  
  renderer.setSize(canvas.width, canvas.height);
  renderer.setPixelRatio(window.devicePixelRatio);
  
  // カメラの位置設定
  camera.position.z = 15;
  
  // ライトの追加
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(0, 10, 10);
  scene.add(directionalLight);
  
  // 中央のAIノード
  const centerGeometry = new THREE.SphereGeometry(1.5, 32, 32);
  const centerMaterial = new THREE.MeshPhongMaterial({
    color: 0x00ff66,
    emissive: 0x00ff66,
    emissiveIntensity: 0.5,
    transparent: true,
    opacity: 0.9
  });
  
  const centerNode = new THREE.Mesh(centerGeometry, centerMaterial);
  centerNode.position.set(0, 0, 0);
  scene.add(centerNode);
  
  // AIテキスト
  const textDiv = document.createElement('div');
  textDiv.style.position = 'absolute';
  textDiv.style.width = '100%';
  textDiv.style.height = '100%';
  textDiv.style.display = 'flex';
  textDiv.style.justifyContent = 'center';
  textDiv.style.alignItems = 'center';
  textDiv.style.color = '#ffffff';
  textDiv.style.fontSize = '24px';
  textDiv.style.fontWeight = 'bold';
  textDiv.style.pointerEvents = 'none';
  textDiv.textContent = 'AI';
  
  canvas.parentNode.style.position = 'relative';
  canvas.parentNode.appendChild(textDiv);
  
  // 周囲のノード
  const nodes = [];
  const nodeCount = 16;
  const nodeGeometry = new THREE.SphereGeometry(0.8, 32, 32);
  
  for (let i = 0; i < nodeCount; i++) {
    const nodeMaterial = new THREE.MeshPhongMaterial({
      color: 0x0066ff,
      emissive: 0x0066ff,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.8
    });
    
    const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
    
    // ノードの位置設定（円形に配置）
    const angle = (i / nodeCount) * Math.PI * 2;
    const radius = 8;
    node.position.x = Math.cos(angle) * radius;
    node.position.y = Math.sin(angle) * radius;
    node.position.z = 0;
    
    scene.add(node);
    nodes.push({
      mesh: node,
      initialAngle: angle,
      pulseSpeed: 0.01 + Math.random() * 0.02,
      active: Math.random() > 0.3 // 一部のノードをアクティブに
    });
  }
  
  // 接続線の作成
  const connections = [];
  const lineMaterial = new THREE.LineBasicMaterial({ 
    color: 0x0066ff,
    transparent: true,
    opacity: 0.3
  });
  
  // 中央ノードと各ノードを接続
  for (let i = 0; i < nodeCount; i++) {
    const lineGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(6); // 2点×3座標
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const line = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(line);
    
    connections.push({
      line,
      fromIndex: i,
      toCenter: true
    });
  }
  
  // アニメーション
  function animate() {
    requestAnimationFrame(animate);
    
    const time = Date.now() * 0.001;
    
    // 中央ノードのアニメーション
    centerNode.scale.x = 1 + Math.sin(time * 0.5) * 0.1;
    centerNode.scale.y = 1 + Math.sin(time * 0.5) * 0.1;
    centerNode.scale.z = 1 + Math.sin(time * 0.5) * 0.1;
    
    // 周囲のノードのアニメーション
    nodes.forEach((node, index) => {
      if (node.active) {
        // アクティブノードは明るく脈動
        node.mesh.material.emissiveIntensity = 0.5 + Math.sin(time * node.pulseSpeed * 2) * 0.3;
        node.mesh.material.opacity = 0.8 + Math.sin(time * node.pulseSpeed) * 0.2;
      } else {
        // 非アクティブノードは暗め
        node.mesh.material.emissiveIntensity = 0.1;
        node.mesh.material.opacity = 0.5;
      }
      
      // 軌道上の微小な動き
      const angle = node.initialAngle + time * 0.05;
      const radius = 8 + Math.sin(time * node.pulseSpeed) * 0.5;
      node.mesh.position.x = Math.cos(angle) * radius;
      node.mesh.position.y = Math.sin(angle) * radius;
    });
    
    // 接続線の更新
    connections.forEach((connection, index) => {
      const positions = connection.line.geometry.attributes.position.array;
      
      if (connection.toCenter) {
        const fromNode = nodes[connection.fromIndex].mesh;
        
        positions[0] = fromNode.position.x;
        positions[1] = fromNode.position.y;
        positions[2] = fromNode.position.z;
        
        positions[3] = centerNode.position.x;
        positions[4] = centerNode.position.y;
        positions[5] = centerNode.position.z;
        
        // アクティブノードの接続線は明るく
        if (nodes[connection.fromIndex].active) {
          connection.line.material.opacity = 0.5 + Math.sin(time * 2) * 0.2;
        } else {
          connection.line.material.opacity = 0.1;
        }
      }
      
      connection.line.geometry.attributes.position.needsUpdate = true;
    });
    
    // カメラの自動回転（軽微）
    camera.position.x = Math.sin(time * 0.2) * 2;
    camera.position.z = 15 + Math.cos(time * 0.2) * 2;
    camera.lookAt(scene.position);
    
    renderer.render(scene, camera);
  }
  
  // アニメーション開始
  animate();
  
  // ウィンドウリサイズ対応
  function onWindowResize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    renderer.setSize(width, height);
  }
  
  window.addEventListener('resize', onWindowResize);
  
  // グローバルに保存
  window.networkVisual = {
    scene,
    camera,
    renderer,
    centerNode,
    nodes,
    connections,
    updateNetworkLoad: function(load) {
      // 負荷に応じてノードのアクティブ状態を更新
      const activeCount = Math.floor((load / 100) * nodes.length);
      
      nodes.forEach((node, index) => {
        node.active = index < activeCount;
      });
      
      // 負荷表示を更新
      const loadDisplay = document.getElementById('network-load');
      if (loadDisplay) {
        loadDisplay.textContent = `${load}%`;
      }
    }
  };
}

// ネットワークビジュアルの更新（タブ切り替え時）
function updateNetworkVisual(tabId) {
  if (!window.networkVisual) return;
  
  // タブに応じて中央ノードの色を変更
  switch (tabId) {
    case 'apos':
      window.networkVisual.centerNode.material.color.set(0x00ff66);
      window.networkVisual.centerNode.material.emissive.set(0x00ff66);
      break;
    case 'sharding':
      window.networkVisual.centerNode.material.color.set(0xff6600);
      window.networkVisual.centerNode.material.emissive.set(0xff6600);
      break;
    case 'smart-contract':
      window.networkVisual.centerNode.material.color.set(0x9900ff);
      window.networkVisual.centerNode.material.emissive.set(0x9900ff);
      break;
  }
}

// 負荷スライダーの初期化
function initLoadSlider() {
  const slider = document.getElementById('load-slider');
  const sliderValue = document.querySelector('.slider-value');
  const applyButton = document.getElementById('apply-load');
  
  if (!slider || !sliderValue || !applyButton) return;
  
  // スライダー値の表示を更新
  slider.addEventListener('input', () => {
    const value = slider.value;
    sliderValue.textContent = `${value}%`;
    
    // スライダーの背景グラデーションを更新
    slider.style.background = `linear-gradient(to right, var(--primary-color) 0%, var(--primary-color) ${value}%, rgba(var(--primary-rgb), 0.3) ${value}%, rgba(var(--primary-rgb), 0.3) 100%)`;
  });
  
  // 適用ボタンのクリックイベント
  applyButton.addEventListener('click', () => {
    const value = parseInt(slider.value);
    
    // ネットワーク負荷を更新
    if (window.networkVisual) {
      window.networkVisual.updateNetworkLoad(value);
    }
    
    // アニメーション効果
    applyButton.classList.add('applying');
    setTimeout(() => {
      applyButton.classList.remove('applying');
    }, 500);
  });
}
