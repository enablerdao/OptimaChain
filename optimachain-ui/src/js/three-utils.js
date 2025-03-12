/**
 * THREE.js Utilities
 * Provides helper functions for THREE.js visualizations
 */

// Check if THREE.js is available
export function checkThreeAvailability() {
  if (typeof THREE === 'undefined') {
    console.error('THREE.js is not loaded or not available globally');
    return false;
  }
  
  // Check for required components
  const requiredComponents = [
    'Scene', 
    'PerspectiveCamera', 
    'WebGLRenderer', 
    'AmbientLight',
    'DirectionalLight',
    'SphereGeometry',
    'MeshPhongMaterial',
    'Mesh',
    'BufferGeometry',
    'BufferAttribute',
    'LineBasicMaterial',
    'Line'
  ];
  
  let missingComponents = [];
  
  requiredComponents.forEach(component => {
    if (typeof THREE[component] === 'undefined') {
      missingComponents.push(component);
    }
  });
  
  if (missingComponents.length > 0) {
    console.error('Missing THREE.js components:', missingComponents.join(', '));
    return false;
  }
  
  // Check for postprocessing components
  try {
    if (typeof THREE.ShaderPass === 'undefined') {
      console.warn('THREE.ShaderPass is not available, some visual effects may not work');
    }
    
    if (typeof THREE.EffectComposer === 'undefined') {
      console.warn('THREE.EffectComposer is not available, some visual effects may not work');
    }
  } catch (e) {
    console.warn('Error checking postprocessing components:', e);
  }
  
  return true;
}

// Create a fallback visualization when THREE.js is not available
export function createFallbackVisualization(container) {
  if (!container) return;
  
  // Remove any existing content
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  
  // Create fallback content
  const fallbackDiv = document.createElement('div');
  fallbackDiv.className = 'visualization-fallback';
  fallbackDiv.style.width = '100%';
  fallbackDiv.style.height = '100%';
  fallbackDiv.style.display = 'flex';
  fallbackDiv.style.flexDirection = 'column';
  fallbackDiv.style.justifyContent = 'center';
  fallbackDiv.style.alignItems = 'center';
  fallbackDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
  fallbackDiv.style.borderRadius = '8px';
  fallbackDiv.style.padding = '20px';
  
  const fallbackIcon = document.createElement('div');
  fallbackIcon.innerHTML = `
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
  fallbackIcon.style.marginBottom = '16px';
  fallbackIcon.style.color = 'rgba(0, 102, 255, 0.7)';
  
  const fallbackTitle = document.createElement('h3');
  fallbackTitle.textContent = '3Dビジュアライゼーションを読み込めませんでした';
  fallbackTitle.style.margin = '0 0 8px 0';
  fallbackTitle.style.fontSize = '18px';
  fallbackTitle.style.fontWeight = '600';
  fallbackTitle.style.color = 'var(--text-color-primary, #ffffff)';
  
  const fallbackMessage = document.createElement('p');
  fallbackMessage.textContent = 'ブラウザがWebGLをサポートしていることを確認してください。';
  fallbackMessage.style.margin = '0';
  fallbackMessage.style.fontSize = '14px';
  fallbackMessage.style.color = 'var(--text-color-secondary, rgba(255, 255, 255, 0.7))';
  fallbackMessage.style.textAlign = 'center';
  
  fallbackDiv.appendChild(fallbackIcon);
  fallbackDiv.appendChild(fallbackTitle);
  fallbackDiv.appendChild(fallbackMessage);
  
  container.appendChild(fallbackDiv);
  
  return fallbackDiv;
}

// Initialize a basic THREE.js scene
export function initBasicScene(container, options = {}) {
  if (!container || !checkThreeAvailability()) {
    return createFallbackVisualization(container);
  }
  
  try {
    // Default options
    const defaultOptions = {
      backgroundColor: 0x000000,
      backgroundAlpha: 0,
      cameraPosition: { x: 0, y: 0, z: 15 },
      ambientLightIntensity: 0.5,
      directionalLightIntensity: 0.8,
      directionalLightPosition: { x: 0, y: 10, z: 10 },
      antialias: true
    };
    
    // Merge options
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Create scene
    const scene = new THREE.Scene();
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75, 
      container.clientWidth / container.clientHeight, 
      0.1, 
      1000
    );
    
    // Set camera position
    camera.position.set(
      mergedOptions.cameraPosition.x,
      mergedOptions.cameraPosition.y,
      mergedOptions.cameraPosition.z
    );
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: mergedOptions.antialias,
      alpha: mergedOptions.backgroundAlpha < 1
    });
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Clear existing content
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    
    // Add renderer to container
    container.appendChild(renderer.domElement);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(
      0xffffff, 
      mergedOptions.ambientLightIntensity
    );
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(
      0xffffff, 
      mergedOptions.directionalLightIntensity
    );
    directionalLight.position.set(
      mergedOptions.directionalLightPosition.x,
      mergedOptions.directionalLightPosition.y,
      mergedOptions.directionalLightPosition.z
    );
    scene.add(directionalLight);
    
    // Handle window resize
    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Return scene objects
    return {
      scene,
      camera,
      renderer,
      container,
      dispose: () => {
        window.removeEventListener('resize', handleResize);
        renderer.dispose();
        // Remove renderer from container
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
    };
  } catch (error) {
    console.error('Error initializing THREE.js scene:', error);
    return createFallbackVisualization(container);
  }
}
