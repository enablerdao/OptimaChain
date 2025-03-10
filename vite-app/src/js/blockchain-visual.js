// ブロックチェーンビジュアル
import * as THREE from 'three';

export function initBlockchainVisual(canvas) {
  // シーン、カメラ、レンダラーの設定
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  
  renderer.setSize(canvas.width, canvas.height);
  renderer.setPixelRatio(window.devicePixelRatio);
  
  // カメラの位置設定
  camera.position.z = 30;
  
  // ライトの追加
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(0, 10, 10);
  scene.add(directionalLight);
  
  // ブロックの作成
  const blocks = [];
  const blockCount = 10;
  const blockGeometry = new THREE.BoxGeometry(5, 2, 2);
  
  for (let i = 0; i < blockCount; i++) {
    // グラデーションマテリアル
    const blockMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color(0x0066ff).lerp(new THREE.Color(0xff3366), i / blockCount),
      transparent: true,
      opacity: 0.8,
      shininess: 100
    });
    
    const block = new THREE.Mesh(blockGeometry, blockMaterial);
    
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
      pulseSpeed: 0.01 + Math.random() * 0.02
    });
  }
  
  // 接続線の作成
  const connections = [];
  const lineMaterial = new THREE.LineBasicMaterial({ 
    color: 0x0066ff,
    transparent: true,
    opacity: 0.3
  });
  
  for (let i = 0; i < blockCount; i++) {
    const nextIndex = (i + 1) % blockCount;
    const lineGeometry = new THREE.BufferGeometry();
    
    // 初期位置（更新される）
    const positions = new Float32Array(6); // 2点×3座標
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const line = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(line);
    
    connections.push({
      line,
      fromIndex: i,
      toIndex: nextIndex
    });
  }
  
  // パーティクルの作成
  const particleCount = 200;
  const particleGeometry = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleSizes = new Float32Array(particleCount);
  
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    particlePositions[i3] = (Math.random() - 0.5) * 50;
    particlePositions[i3 + 1] = (Math.random() - 0.5) * 50;
    particlePositions[i3 + 2] = (Math.random() - 0.5) * 50;
    
    particleSizes[i] = Math.random() * 0.5 + 0.1;
  }
  
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
  
  const particleMaterial = new THREE.PointsMaterial({
    color: 0x0066ff,
    size: 0.5,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true
  });
  
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);
  
  // アニメーション
  function animate() {
    requestAnimationFrame(animate);
    
    // ブロックのアニメーション
    blocks.forEach((block, index) => {
      const time = Date.now() * 0.001;
      
      // 回転
      block.mesh.rotation.x += block.rotationSpeed;
      block.mesh.rotation.y += block.rotationSpeed * 0.7;
      
      // 軌道上の動き
      const angle = block.initialAngle + time * 0.1;
      const radius = 15 + Math.sin(time * block.pulseSpeed) * 2;
      block.mesh.position.x = Math.cos(angle) * radius;
      block.mesh.position.y = Math.sin(angle) * radius;
      
      // スケールの脈動
      const scale = 1 + Math.sin(time * block.pulseSpeed * 2) * 0.1;
      block.mesh.scale.set(scale, scale, scale);
    });
    
    // 接続線の更新
    connections.forEach(connection => {
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
    });
    
    // パーティクルのアニメーション
    const positions = particles.geometry.attributes.position.array;
    const sizes = particles.geometry.attributes.size.array;
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // 位置の更新
      positions[i3 + 1] += (Math.random() - 0.5) * 0.1;
      
      // 範囲外に出たら反対側に
      if (positions[i3 + 1] > 25) positions[i3 + 1] = -25;
      if (positions[i3 + 1] < -25) positions[i3 + 1] = 25;
      
      // サイズの脈動
      const time = Date.now() * 0.001;
      sizes[i] = (Math.sin(time + i) * 0.2 + 0.8) * (Math.random() * 0.3 + 0.2);
    }
    
    particles.geometry.attributes.position.needsUpdate = true;
    particles.geometry.attributes.size.needsUpdate = true;
    
    // カメラの自動回転
    camera.position.x = Math.sin(Date.now() * 0.0005) * 40;
    camera.position.z = Math.cos(Date.now() * 0.0005) * 40;
    camera.lookAt(scene.position);
    
    renderer.render(scene, camera);
  }
  
  // ウィンドウリサイズ対応
  function onWindowResize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    renderer.setSize(width, height);
  }
  
  window.addEventListener('resize', onWindowResize);
  
  // アニメーション開始
  animate();
  
  // クリーンアップ関数を返す
  return () => {
    window.removeEventListener('resize', onWindowResize);
    
    // メモリ解放
    blocks.forEach(block => {
      scene.remove(block.mesh);
      block.mesh.geometry.dispose();
      block.mesh.material.dispose();
    });
    
    connections.forEach(connection => {
      scene.remove(connection.line);
      connection.line.geometry.dispose();
      connection.line.material.dispose();
    });
    
    scene.remove(particles);
    particles.geometry.dispose();
    particles.material.dispose();
    
    renderer.dispose();
  };
}