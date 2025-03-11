/**
 * OptimaChain Error Handler Module
 * Provides centralized error handling for the application
 */

// Configuration
const ERROR_CONFIG = {
  logToConsole: true,
  logToServer: false,
  showUserFriendlyMessages: true,
  serverLogEndpoint: '/api/log-error'
};

// Initialize error handler
function initErrorHandler() {
  console.log('Error handler initialized');
  
  // Set up global error listener
  window.addEventListener('error', handleGlobalError);
  
  // Set up promise rejection handler
  window.addEventListener('unhandledrejection', handlePromiseRejection);
}

// Handle global errors
function handleGlobalError(event) {
  const { message, filename, lineno, colno, error } = event;
  
  const errorData = {
    type: 'runtime',
    message,
    source: filename,
    line: lineno,
    column: colno,
    stack: error?.stack,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  };
  
  processError(errorData);
  
  // Prevent default browser error handling if we're handling it
  if (ERROR_CONFIG.showUserFriendlyMessages) {
    event.preventDefault();
  }
}

// Handle unhandled promise rejections
function handlePromiseRejection(event) {
  const { reason } = event;
  
  const errorData = {
    type: 'promise',
    message: reason?.message || String(reason),
    stack: reason?.stack,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  };
  
  processError(errorData);
  
  // Prevent default browser error handling if we're handling it
  if (ERROR_CONFIG.showUserFriendlyMessages) {
    event.preventDefault();
  }
}

// Process and log errors
function processError(errorData) {
  // Log to console if enabled
  if (ERROR_CONFIG.logToConsole) {
    console.error('[OptimaChain Error]', errorData);
  }
  
  // Log to server if enabled
  if (ERROR_CONFIG.logToServer) {
    logErrorToServer(errorData);
  }
  
  // Show user-friendly message if enabled
  if (ERROR_CONFIG.showUserFriendlyMessages) {
    showUserFriendlyError(errorData);
  }
}

// Log error to server
function logErrorToServer(errorData) {
  try {
    fetch(ERROR_CONFIG.serverLogEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(errorData)
    });
  } catch (e) {
    console.error('Failed to send error to server:', e);
  }
}

// Show user-friendly error message
function showUserFriendlyError(errorData) {
  // Create error container if it doesn't exist
  let errorContainer = document.getElementById('error-container');
  
  if (!errorContainer) {
    errorContainer = document.createElement('div');
    errorContainer.id = 'error-container';
    errorContainer.className = 'error-container';
    document.body.appendChild(errorContainer);
    
    // Add styles if not already present
    if (!document.getElementById('error-handler-styles')) {
      const style = document.createElement('link');
      style.id = 'error-handler-styles';
      style.rel = 'stylesheet';
      style.href = '/src/css/error-handler.css';
      document.head.appendChild(style);
    }
  }
  
  // Create error message element
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  
  // Create error content
  const errorContent = document.createElement('div');
  errorContent.className = 'error-content';
  
  // Add error title
  const errorTitle = document.createElement('h3');
  errorTitle.textContent = 'エラーが発生しました';
  errorContent.appendChild(errorTitle);
  
  // Add error message
  const errorText = document.createElement('p');
  errorText.textContent = getUserFriendlyMessage(errorData);
  errorContent.appendChild(errorText);
  
  // Add close button
  const closeButton = document.createElement('button');
  closeButton.className = 'error-close';
  closeButton.textContent = '×';
  closeButton.addEventListener('click', () => {
    errorElement.remove();
  });
  
  // Assemble error element
  errorElement.appendChild(errorContent);
  errorElement.appendChild(closeButton);
  
  // Add to container
  errorContainer.appendChild(errorElement);
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    errorElement.remove();
  }, 10000);
}

// Get user-friendly error message
function getUserFriendlyMessage(errorData) {
  // Map technical errors to user-friendly messages
  const defaultMessage = 'アプリケーションでエラーが発生しました。もう一度お試しください。';
  
  // Check for specific error types
  if (errorData.message.includes('NetworkError') || 
      errorData.message.includes('Failed to fetch')) {
    return 'ネットワーク接続に問題があります。インターネット接続を確認してください。';
  }
  
  if (errorData.message.includes('TypeError')) {
    return '予期しないエラーが発生しました。ページを更新してもう一度お試しください。';
  }
  
  if (errorData.message.includes('Permission denied') || 
      errorData.message.includes('Access denied')) {
    return 'このアクションを実行する権限がありません。ログインしているか確認してください。';
  }
  
  return defaultMessage;
}

// Export functions
export {
  initErrorHandler,
  handleGlobalError,
  handlePromiseRejection,
  processError
};

// Auto-initialize if script is loaded directly
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initErrorHandler);
}
