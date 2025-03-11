/**
 * OptimaChain Advanced Features Module
 * Provides advanced blockchain functionality for power users
 */

import { trackEvent } from './analytics.js';

// Feature flags
const FEATURES = {
  advancedValidation: true,
  customTransactions: true,
  developerTools: true,
  experimentalFeatures: false
};

// Initialize advanced features
function initAdvancedFeatures() {
  console.log('Advanced features initialized');
  
  // Register feature toggles in UI if available
  if (document.querySelector('#advanced-features-panel')) {
    renderFeatureToggles();
  }
}

// Render feature toggles in UI
function renderFeatureToggles() {
  const container = document.querySelector('#advanced-features-panel');
  if (!container) return;
  
  const togglesHtml = Object.entries(FEATURES).map(([key, enabled]) => {
    return `
      <div class="feature-toggle">
        <label class="toggle-switch">
          <input type="checkbox" data-feature="${key}" ${enabled ? 'checked' : ''}>
          <span class="toggle-slider"></span>
        </label>
        <span class="feature-name">${formatFeatureName(key)}</span>
      </div>
    `;
  }).join('');
  
  container.innerHTML = `
    <h3>Advanced Features</h3>
    <div class="feature-toggles">
      ${togglesHtml}
    </div>
  `;
  
  // Add event listeners
  container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', handleFeatureToggle);
  });
}

// Format feature name for display
function formatFeatureName(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase());
}

// Handle feature toggle change
function handleFeatureToggle(event) {
  const feature = event.target.dataset.feature;
  const enabled = event.target.checked;
  
  FEATURES[feature] = enabled;
  
  // Track feature toggle
  trackEvent('AdvancedFeatures', 'ToggleFeature', feature, enabled ? 1 : 0);
  
  console.log(`Feature "${feature}" ${enabled ? 'enabled' : 'disabled'}`);
}

// Check if a feature is enabled
function isFeatureEnabled(feature) {
  return FEATURES[feature] === true;
}

// Enable a specific feature
function enableFeature(feature) {
  if (FEATURES.hasOwnProperty(feature)) {
    FEATURES[feature] = true;
    trackEvent('AdvancedFeatures', 'EnableFeature', feature);
    return true;
  }
  return false;
}

// Disable a specific feature
function disableFeature(feature) {
  if (FEATURES.hasOwnProperty(feature)) {
    FEATURES[feature] = false;
    trackEvent('AdvancedFeatures', 'DisableFeature', feature);
    return true;
  }
  return false;
}

// Export functions
export {
  initAdvancedFeatures,
  isFeatureEnabled,
  enableFeature,
  disableFeature
};

// Auto-initialize if script is loaded directly
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initAdvancedFeatures);
}
