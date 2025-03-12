/**
 * Network Stats Visualization Fix
 * This module provides fixes for the network stats visualization
 */

import * as threeUtils from './three-utils.js';

/**
 * Initialize network stats visualization with fallback
 * @param {HTMLElement} container - Container element for the visualization
 * @param {Object} data - Network stats data
 */
export function initNetworkStatsVisualization(container, data = null) {
  console.log('Initializing network stats visualization');
  
  // Check if THREE.js is available
  if (typeof THREE === 'undefined') {
    console.error('THREE.js is not available');
    showFallbackContent(container, 'THREE.js library not loaded');
    return;
  }
  
  // Check if WebGL is supported
  if (!threeUtils.isWebGLSupported()) {
    console.warn('WebGL is not supported');
    showFallbackContent(container, 'WebGL is not supported in your browser');
    return;
  }
  
  try {
    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.className = 'network-stats-canvas';
    container.appendChild(canvas);
    
    // Initialize renderer
    const renderer = threeUtils.initRenderer(canvas);
    if (!renderer) {
      throw new Error('Failed to initialize renderer');
    }
    
    // Create scene
    const { scene, camera } = threeUtils.createBasicScene(
      container.clientWidth, 
      container.clientHeight
    );
    
    // Position camera
    camera.position.z = 15;
    
    // Create network visualization
    createNetworkVisualization(scene, data);
    
    // Handle window resize
    window.addEventListener('resize', () => {
      threeUtils.handleResize(camera, renderer, container);
    });
    
    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      
      // Rotate scene slightly
      scene.rotation.y += 0.002;
      
      // Render scene
      renderer.render(scene, camera);
    }
    
    // Start animation
    animate();
    
    console.log('Network stats visualization initialized successfully');
  } catch (error) {
    console.error('Error initializing network stats visualization:', error);
    showFallbackContent(container, 'Failed to initialize visualization');
  }
}

/**
 * Create network visualization
 * @param {THREE.Scene} scene - THREE.js scene
 * @param {Object} data - Network stats data
 */
function createNetworkVisualization(scene, data) {
  // Default data if none provided
  const networkData = data || {
    nodes: 12,
    connections: 24,
    validators: 5
  };
  
  // Create nodes
  const nodes = [];
  const nodeGeometry = new THREE.BoxGeometry(1, 1, 1);
  const nodeMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x0088ff,
    transparent: true,
    opacity: 0.8
  });
  
  // Create central node (larger)
  const centralNode = new THREE.Mesh(
    new THREE.SphereGeometry(1.5, 32, 32),
    new THREE.MeshPhongMaterial({ 
      color: 0x6633cc,
      transparent: true,
      opacity: 0.8
    })
  );
  scene.add(centralNode);
  
  // Create surrounding nodes
  for (let i = 0; i < networkData.nodes; i++) {
    const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
    
    // Position nodes in a spherical pattern
    const radius = 8 + Math.random() * 4;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    
    node.position.x = radius * Math.sin(phi) * Math.cos(theta);
    node.position.y = radius * Math.sin(phi) * Math.sin(theta);
    node.position.z = radius * Math.cos(phi);
    
    // Randomize size slightly
    const scale = 0.5 + Math.random() * 0.5;
    node.scale.set(scale, scale, scale);
    
    scene.add(node);
    nodes.push(node);
  }
  
  // Create connections (lines)
  const lineMaterial = new THREE.LineBasicMaterial({ 
    color: 0xffffff,
    transparent: true,
    opacity: 0.3
  });
  
  // Connect nodes to central node
  for (const node of nodes) {
    const geometry = new THREE.BufferGeometry().setFromPoints([
      centralNode.position,
      node.position
    ]);
    const line = new THREE.Line(geometry, lineMaterial);
    scene.add(line);
  }
  
  // Connect some nodes to each other
  for (let i = 0; i < networkData.connections; i++) {
    const nodeA = nodes[Math.floor(Math.random() * nodes.length)];
    const nodeB = nodes[Math.floor(Math.random() * nodes.length)];
    
    if (nodeA !== nodeB) {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        nodeA.position,
        nodeB.position
      ]);
      const line = new THREE.Line(geometry, lineMaterial);
      scene.add(line);
    }
  }
  
  // Add some small particles
  const particleGeometry = new THREE.BufferGeometry();
  const particleCount = 50;
  const particlePositions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    const radius = 10 + Math.random() * 5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    
    particlePositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    particlePositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    particlePositions[i3 + 2] = radius * Math.cos(phi);
  }
  
  particleGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(particlePositions, 3)
  );
  
  const particleMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.1,
    transparent: true,
    opacity: 0.5
  });
  
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);
}

/**
 * Show fallback content when visualization fails
 * @param {HTMLElement} container - Container element
 * @param {string} message - Error message to display
 */
function showFallbackContent(container, message) {
  // Clear container
  container.innerHTML = '';
  
  // Create fallback element
  const fallback = document.createElement('div');
  fallback.className = 'network-stats-fallback';
  fallback.style.width = '100%';
  fallback.style.height = '100%';
  fallback.style.display = 'flex';
  fallback.style.flexDirection = 'column';
  fallback.style.alignItems = 'center';
  fallback.style.justifyContent = 'center';
  fallback.style.backgroundColor = '#0a0f1e';
  fallback.style.color = '#fff';
  fallback.style.padding = '20px';
  fallback.style.textAlign = 'center';
  
  // Add message
  const messageElement = document.createElement('p');
  messageElement.textContent = message;
  fallback.appendChild(messageElement);
  
  // Add static image as fallback
  const img = document.createElement('img');
  img.src = '/img/network-stats-fallback.png';
  img.alt = 'Network Statistics';
  img.style.maxWidth = '100%';
  img.style.marginTop = '20px';
  img.onerror = () => {
    img.style.display = 'none';
  };
  fallback.appendChild(img);
  
  // Add some static stats
  const statsContainer = document.createElement('div');
  statsContainer.style.display = 'flex';
  statsContainer.style.justifyContent = 'space-around';
  statsContainer.style.width = '100%';
  statsContainer.style.marginTop = '30px';
  
  const stats = [
    { label: 'ノード数', value: '12' },
    { label: 'バリデータ数', value: '5' },
    { label: 'ネットワーク負荷', value: '50%' }
  ];
  
  stats.forEach(stat => {
    const statElement = document.createElement('div');
    statElement.style.textAlign = 'center';
    
    const valueElement = document.createElement('div');
    valueElement.textContent = stat.value;
    valueElement.style.fontSize = '24px';
    valueElement.style.fontWeight = 'bold';
    valueElement.style.color = '#0088ff';
    
    const labelElement = document.createElement('div');
    labelElement.textContent = stat.label;
    labelElement.style.fontSize = '14px';
    labelElement.style.marginTop = '5px';
    
    statElement.appendChild(valueElement);
    statElement.appendChild(labelElement);
    statsContainer.appendChild(statElement);
  });
  
  fallback.appendChild(statsContainer);
  
  // Add to container
  container.appendChild(fallback);
}

export default { initNetworkStatsVisualization };
