// ブロックチェーンビジュアル
import * as THREE from 'three';

// パフォーマンス設定
const PERFORMANCE_CONFIG = {
  // 設定からFPSを取得、または30FPSをデフォルトとする
  maxFPS: window.OPTIMACHAIN_CONFIG?.performance?.maxFPS || 30,
  // モバイルデバイスや低スペックデバイス向けの設定
  lowQualityMode: window.innerWidth < 768 || (window.OPTIMACHAIN_CONFIG?.performance?.lowQualityMode === true),
  // パーティクル数を調整（低品質モードでは少なく）
  particleCount: window.innerWidth < 768 ? 100 : 200,
  // ブロック数を調整（低品質モードでは少なく）
  blockCount: window.innerWidth < 768 ? 7 : 10,
  // アニメーションのスロットリングを有効にするかどうか
  throttleAnimations: window.OPTIMACHAIN_CONFIG?.performance?.throttleAnimations !== false
};

// オブジェクトプール - 再利用可能なジオメトリとマテリアル
const objectPool = {
  geometries: {},
  materials: {}
};

export function initBlockchainVisual(canvas) {
  // シーン、カメラ、レンダラーの設定
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0e17);
  
  const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.z = 30;
  
  // レンダラーの設定 - 低品質モードではアンチエイリアスを無効化
  const renderer = new THREE.WebGLRenderer({ 
    canvas, 
    alpha: true, 
    antialias: !PERFORMANCE_CONFIG.lowQualityMode,
    powerPreference: 'high-performance' // GPUパフォーマンス優先
  });
  
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  // 低品質モードではピクセル比を1に固定して負荷を軽減
  renderer.setPixelRatio(PERFORMANCE_CONFIG.lowQualityMode ? 1 : window.devicePixelRatio);
  
  // ライトの追加
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(0, 10, 10);
  scene.add(directionalLight);
  
  // 共有ジオメトリの作成（メモリ効率化）
  objectPool.geometries.block = new THREE.BoxGeometry(5, 2, 2);
  
  // ブロックの作成
  const blocks = [];
  const blockCount = PERFORMANCE_CONFIG.blockCount;
  
  // ブロックの色配列を事前計算（パフォーマンス向上）
  const blockColors = [];
  for (let i = 0; i < blockCount; i++) {
    blockColors.push(
      new THREE.Color(0x0066ff).lerp(new THREE.Color(0xff3366), i / blockCount)
    );
  }
  
  for (let i = 0; i < blockCount; i++) {
    // グラデーションマテリアル
    const blockMaterial = new THREE.MeshPhongMaterial({
      color: blockColors[i],
      transparent: true,
      opacity: 0.8,
      shininess: 100,
      // 低品質モードではフラットシェーディングを使用
      flatShading: PERFORMANCE_CONFIG.lowQualityMode
    });
    
    const block = new THREE.Mesh(objectPool.geometries.block, blockMaterial);
    
    // ブロックの位置設定
    const angle = (i / blockCount) * Math.PI * 2;
    const radius = 15;
    block.position.x = Math.cos(angle) * radius;
    block.position.y = Math.sin(angle) * radius;
    block.position.z = 0;
    
    // ブロックの回転
    block.rotation.x = Math.random() * Math.PI;
    block.rotation.y = Math.random() * Math.PI;
    
    scene.add(block);
    blocks.push({
      mesh: block,
      initialAngle: angle,
      rotationSpeed: 0.01 + Math.random() * 0.01,
      pulseSpeed: 0.01 + Math.random() * 0.02,
      // 事前計算された値を保存（パフォーマンス向上）
      cachedSin: {},
      cachedCos: {}
    });
  }
  
  // 共有マテリアルの作成（メモリ効率化）
  objectPool.materials.line = new THREE.LineBasicMaterial({ 
    color: 0x0066ff,
    transparent: true,
    opacity: 0.3
  });
  
  // 接続線の作成
  const connections = [];
  
  for (let i = 0; i < blockCount; i++) {
    const nextIndex = (i + 1) % blockCount;
    const lineGeometry = new THREE.BufferGeometry();
    
    // 初期位置（更新される）
    const positions = new Float32Array(6); // 2点×3座標
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const line = new THREE.Line(lineGeometry, objectPool.materials.line);
    scene.add(line);
    
    connections.push({
      line,
      fromIndex: i,
      toIndex: nextIndex
    });
  }
  
  // パーティクルの最適化
  const particleCount = PERFORMANCE_CONFIG.particleCount;
  const particleGeometry = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleSizes = new Float32Array(particleCount);
  const particleVelocities = new Float32Array(particleCount); // 速度を保存
  
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    particlePositions[i3] = (Math.random() - 0.5) * 50;
    particlePositions[i3 + 1] = (Math.random() - 0.5) * 50;
    particlePositions[i3 + 2] = (Math.random() - 0.5) * 50;
    
    particleSizes[i] = Math.random() * 0.5 + 0.1;
    particleVelocities[i] = (Math.random() - 0.5) * 0.1; // 個別の速度を設定
  }
  
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
  
  // パーティクルマテリアルを共有プールに追加
  objectPool.materials.particle = new THREE.PointsMaterial({
    color: 0x0066ff,
    size: 0.5,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true
  });
  
  const particles = new THREE.Points(particleGeometry, objectPool.materials.particle);
  scene.add(particles);
  
  // パフォーマンスモニタリング
  let frameCount = 0;
  let lastTime = performance.now();
  let fps = 0;
  
  // FPSの計算（デバッグモード時のみ）
  function calculateFPS() {
    frameCount++;
    const currentTime = performance.now();
    const elapsed = currentTime - lastTime;
    
    if (elapsed >= 1000) {
      fps = Math.round((frameCount * 1000) / elapsed);
      frameCount = 0;
      lastTime = currentTime;
      
      if (window.OPTIMACHAIN_CONFIG?.debug) {
        console.log(`Blockchain Visual FPS: ${fps}`);
      }
    }
  }
  
  // 三角関数の結果をキャッシュするヘルパー関数
  function getCachedSin(block, value) {
    if (block.cachedSin[value] === undefined) {
      block.cachedSin[value] = Math.sin(value);
    }
    return block.cachedSin[value];
  }
  
  function getCachedCos(block, value) {
    if (block.cachedCos[value] === undefined) {
      block.cachedCos[value] = Math.cos(value);
    }
    return block.cachedCos[value];
  }
  
  // アニメーションスロットリング用の変数
  let lastFrameTime = 0;
  const frameInterval = 1000 / PERFORMANCE_CONFIG.maxFPS;
  
  // 最適化されたアニメーション関数
  function animate(currentTime) {
    requestAnimationFrame(animate);
    
    // FPS計算（デバッグモードの場合）
    if (window.OPTIMACHAIN_CONFIG?.debug) {
      calculateFPS();
    }
    
    // アニメーションのスロットリング
    if (PERFORMANCE_CONFIG.throttleAnimations) {
      if (currentTime - lastFrameTime < frameInterval) {
        return;
      }
      lastFrameTime = currentTime;
    }
    
    const time = currentTime * 0.001;
    
    // ブロックのアニメーション - for文で最適化
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      
      // 回転
      block.mesh.rotation.x += block.rotationSpeed;
      block.mesh.rotation.y += block.rotationSpeed * 0.7;
      
      // 軌道上の動き - キャッシュされた三角関数を使用
      const angleTime = block.initialAngle + time * 0.1;
      const pulseTime = time * block.pulseSpeed;
      const radius = 15 + getCachedSin(block, pulseTime) * 2;
      
      block.mesh.position.x = getCachedCos(block, angleTime) * radius;
      block.mesh.position.y = getCachedSin(block, angleTime) * radius;
      
      // スケールの脈動 - 低品質モードでは2つおきに処理
      if (!PERFORMANCE_CONFIG.lowQualityMode || i % 2 === 0) {
        const scale = 1 + getCachedSin(block, pulseTime * 2) * 0.1;
        block.mesh.scale.set(scale, scale, scale);
      }
    }
    
    // 接続線の更新 - バッチ処理で最適化
    for (let i = 0; i < connections.length; i++) {
      const connection = connections[i];
      const fromBlock = blocks[connection.fromIndex].mesh;
      const toBlock = blocks[connection.toIndex].mesh;
      
      const positions = connection.line.geometry.attributes.position.array;
      
      positions[0] = fromBlock.position.x;
      positions[1] = fromBlock.position.y;
      positions[2] = fromBlock.position.z;
      
      positions[3] = toBlock.position.x;
      positions[4] = toBlock.position.y;
      positions[5] = toBlock.position.z;
      
      connection.line.geometry.attributes.position.needsUpdate = true;
    }
    
    // パーティクルのアニメーション - バッチ処理で最適化
    const positions = particles.geometry.attributes.position.array;
    const sizes = particles.geometry.attributes.size.array;
    
    // 低品質モードでは更新頻度を下げる
    const updateFrequency = PERFORMANCE_CONFIG.lowQualityMode ? 3 : 1;
    
    for (let i = 0; i < particleCount; i++) {
      // 低品質モードでは一部のパーティクルのみ更新
      if (i % updateFrequency === 0) {
        const i3 = i * 3;
        
        // 保存された速度を使用
        positions[i3 + 1] += particleVelocities[i];
        
        // 範囲外に出たら反対側に
        if (positions[i3 + 1] > 25) positions[i3 + 1] = -25;
        else if (positions[i3 + 1] < -25) positions[i3 + 1] = 25;
        
        // サイズの脈動 - 計算を簡略化
        if (!PERFORMANCE_CONFIG.lowQualityMode || i % 6 === 0) {
          sizes[i] = (Math.sin(time + i * 0.1) * 0.2 + 0.8) * 0.3;
        }
      }
    }
    
    particles.geometry.attributes.position.needsUpdate = true;
    particles.geometry.attributes.size.needsUpdate = true;
    
    // カメラの自動回転 - 計算を簡略化
    const cameraAngle = time * 0.5;
    camera.position.x = Math.sin(cameraAngle) * 40;
    camera.position.z = Math.cos(cameraAngle) * 40;
    camera.lookAt(scene.position);
    
    renderer.render(scene, camera);
  }
  
  // ウィンドウリサイズ対応 - デバウンス処理を追加
  let resizeTimeout;
  function onWindowResize() {
    // デバウンス処理でリサイズイベントの頻度を制限
    if (resizeTimeout) clearTimeout(resizeTimeout);
    
    resizeTimeout = setTimeout(() => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      
      renderer.setSize(width, height);
    }, 100);
  }
  
  window.addEventListener('resize', onWindowResize);
  
  // アニメーション開始 - 現在時刻を渡す
  animate(performance.now());
  
  // クリーンアップ関数を返す
  return () => {
    // イベントリスナーの削除
    window.removeEventListener('resize', onWindowResize);
    if (resizeTimeout) clearTimeout(resizeTimeout);
    
    // メモリ解放 - 最適化
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      scene.remove(block.mesh);
      // ジオメトリは共有なので個別に解放しない
      block.mesh.material.dispose();
      block.mesh = null;
    }
    
    for (let i = 0; i < connections.length; i++) {
      const connection = connections[i];
      scene.remove(connection.line);
      connection.line.geometry.dispose();
      // マテリアルは共有なので個別に解放しない
      connection.line = null;
    }
    
    scene.remove(particles);
    particles.geometry.dispose();
    // マテリアルは共有なので個別に解放しない
    
    // 共有リソースの解放
    objectPool.geometries.block.dispose();
    objectPool.materials.line.dispose();
    objectPool.materials.particle.dispose();
    
    // レンダラーの破棄
    renderer.dispose();
    
    // オブジェクト参照の解放
    blocks.length = 0;
    connections.length = 0;
  };
}
