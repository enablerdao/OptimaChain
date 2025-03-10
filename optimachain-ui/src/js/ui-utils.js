// UI utilities for OptimaChain

const UIUtils = {
  // Show loading spinner
  showLoading: (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = '<div class="loading-spinner"></div>';
    }
  },
  
  // Hide loading spinner
  hideLoading: (elementId, content) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = content || '';
    }
  },
  
  // Show error message
  showError: (elementId, message) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = `<div class="error-message">${message}</div>`;
    }
  },
  
  // Show success message
  showSuccess: (elementId, message) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = `<div class="success-message">${message}</div>`;
    }
  },
  
  // Create confirmation dialog
  confirmAction: (message, onConfirm) => {
    if (confirm(message)) {
      onConfirm();
    }
  },
  
  // Format currency
  formatCurrency: (amount, symbol) => {
    return `${parseFloat(amount).toLocaleString()} ${symbol}`;
  },
  
  // Format date
  formatDate: (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }
};

// Export UIUtils
window.UIUtils = UIUtils;
