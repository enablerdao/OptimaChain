/**
 * THREE.js Utility Functions
 * This module provides utility functions for THREE.js visualizations
 */

// Check if THREE is available
const hasThree = typeof THREE !== 'undefined';

/**
 * Initialize WebGL renderer with fallback
 * @param {HTMLCanvasElement} canvas - Canvas element to render to
 * @param {Object} options - Renderer options
 * @returns {THREE.WebGLRenderer|null} - WebGL renderer or null if not supported
 */
export function initRenderer(canvas, options = {}) {
  if (!hasThree) {
    console.error('THREE.js is not available');
    return null;
  }
  
  try {
    // Default options
    const defaultOptions = {
      canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true
    };
    
    // Merge options
    const rendererOptions = { ...defaultOptions, ...options };
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer(rendererOptions);
    
    // Check if renderer was created successfully
    if (!renderer) {
      throw new Error('Failed to create WebGL renderer');
    }
    
    // Configure renderer
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    
    console.log('WebGL renderer initialized successfully');
    return renderer;
  } catch (error) {
    console.error('Error initializing WebGL renderer:', error);
    
    // Show fallback message on canvas
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = '16px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('WebGL not supported or enabled', canvas.width / 2, canvas.height / 2);
        ctx.fillText('Please enable WebGL in your browser settings', canvas.width / 2, canvas.height / 2 + 30);
      }
    }
    
    return null;
  }
}

/**
 * Check if WebGL is supported
 * @returns {boolean} - True if WebGL is supported
 */
export function isWebGLSupported() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

/**
 * Create a basic scene with camera and lights
 * @param {number} width - Viewport width
 * @param {number} height - Viewport height
 * @returns {Object} - Object containing scene, camera, and lights
 */
export function createBasicScene(width, height) {
  if (!hasThree) {
    console.error('THREE.js is not available');
    return null;
  }
  
  // Create scene
  const scene = new THREE.Scene();
  
  // Create camera
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.z = 5;
  
  // Create lights
  const ambientLight = new THREE.AmbientLight(0x404040);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(1, 1, 1);
  
  // Add lights to scene
  scene.add(ambientLight);
  scene.add(directionalLight);
  
  return { scene, camera, ambientLight, directionalLight };
}

/**
 * Handle window resize for responsive rendering
 * @param {THREE.PerspectiveCamera} camera - Camera to update
 * @param {THREE.WebGLRenderer} renderer - Renderer to update
 * @param {HTMLElement} container - Container element to match size with
 */
export function handleResize(camera, renderer, container) {
  if (!hasThree || !camera || !renderer || !container) {
    return;
  }
  
  const width = container.clientWidth;
  const height = container.clientHeight;
  
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  
  renderer.setSize(width, height);
}

export default {
  initRenderer,
  isWebGLSupported,
  createBasicScene,
  handleResize
};
