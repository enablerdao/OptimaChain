/**
 * OptimaChain Error Handler Module
 * 
 * This module provides comprehensive error handling for the OptimaChain UI.
 * It includes error reporting, user notifications, and error recovery mechanisms.
 */

// エラーハンドリングの初期化
export function initErrorHandling() {
  // グローバルエラーハンドラーの設定
  window.addEventListener('error', handleGlobalError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);
  
  // コンソールエラーのオーバーライド（開発モードでのみ）
  if (window.OPTIMACHAIN_CONFIG?.debug) {
    enhanceConsoleErrors();
  }
  
  console.log('OptimaChain エラーハンドリングを初期化しました');
}

// グローバルエラーハンドラー
function handleGlobalError(event) {
  const error = event.error || new Error(event.message);
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    type: error.name,
    location: `${event.filename}:${event.lineno}:${event.colno}`,
    timestamp: new Date().toISOString()
  };
  
  // エラーをコンソールに記録
  console.error('グローバルエラーが発生しました:', errorInfo);
  
  // クリティカルなエラーの場合はユーザーに通知
  if (isCriticalError(error)) {
    showErrorNotification(
      'アプリケーションでエラーが発生しました。ページを再読み込みしてください。',
      true
    );
  }
  
  // エラーレポートの送信（本番環境のみ）
  if (shouldReportError(error)) {
    reportError(errorInfo);
  }
  
  // デフォルトのエラーハンドリングを防止
  event.preventDefault();
}

// 未処理のPromise拒否ハンドラー
function handleUnhandledRejection(event) {
  const error = event.reason;
  const errorInfo = {
    message: error.message || 'Unknown Promise rejection',
    stack: error.stack,
    type: 'UnhandledPromiseRejection',
    timestamp: new Date().toISOString()
  };
  
  // エラーをコンソールに記録
  console.error('未処理のPromise拒否が発生しました:', errorInfo);
  
  // エラーレポートの送信（本番環境のみ）
  if (shouldReportError(error)) {
    reportError(errorInfo);
  }
  
  // デフォルトのエラーハンドリングを防止
  event.preventDefault();
}

// コンソールエラーの拡張（開発モードでのみ使用）
function enhanceConsoleErrors() {
  const originalConsoleError = console.error;
  
  console.error = function(...args) {
    // 元のconsole.errorを呼び出す
    originalConsoleError.apply(console, args);
    
    // スタックトレースを取得して表示
    const stack = new Error().stack
      .split('\n')
      .slice(2)
      .join('\n');
    
    originalConsoleError.call(
      console,
      '%cエラー発生場所:\n%c' + stack,
      'color: #ff6b6b; font-weight: bold;',
      'color: #5f7d95; font-size: 0.9em;'
    );
  };
}

// エラーが重大かどうかを判断
function isCriticalError(error) {
  // 特定のエラータイプに基づく判断
  if (error instanceof TypeError || error instanceof ReferenceError) {
    return true;
  }
  
  // エラーメッセージに基づく判断
  const criticalKeywords = [
    'undefined is not a function',
    'null is not an object',
    'cannot read property',
    'is not defined',
    'is not a function'
  ];
  
  return criticalKeywords.some(keyword => 
    error.message && error.message.toLowerCase().includes(keyword)
  );
}

// エラーを報告すべきかどうかを判断
function shouldReportError(error) {
  // 本番環境でのみエラーを報告
  if (window.OPTIMACHAIN_CONFIG?.environment !== 'production') {
    return false;
  }
  
  // 無視すべきエラーをフィルタリング
  const ignoredErrors = [
    'ResizeObserver loop limit exceeded',
    'Script error.',
    'Load failed'
  ];
  
  return !ignoredErrors.some(ignored => 
    error.message && error.message.includes(ignored)
  );
}

// エラーレポートの送信
function reportError(errorInfo) {
  // 環境情報を追加
  const reportData = {
    ...errorInfo,
    url: window.location.href,
    userAgent: navigator.userAgent,
    appVersion: window.OPTIMACHAIN_CONFIG?.version || 'unknown',
    environment: window.OPTIMACHAIN_CONFIG?.environment || 'unknown',
    sessionId: getSessionId()
  };
  
  // デバッグモードではコンソールに出力
  if (window.OPTIMACHAIN_CONFIG?.debug) {
    console.log('エラーレポート:', reportData);
    return;
  }
  
  // 本番環境では実際にAPIに送信
  try {
    const apiUrl = window.OPTIMACHAIN_CONFIG?.apiBaseUrl 
      ? `${window.OPTIMACHAIN_CONFIG.apiBaseUrl}/api/error-report`
      : '/api/error-report';
      
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reportData),
      // エラーレポート自体が失敗してもユーザー体験に影響しないようにする
      keepalive: true
    }).catch(e => console.warn('エラーレポートの送信に失敗しました:', e));
  } catch (e) {
    console.warn('エラーレポートの送信に失敗しました:', e);
  }
}

// セッションIDの取得または生成
function getSessionId() {
  let sessionId = sessionStorage.getItem('optimachain-session-id');
  
  if (!sessionId) {
    sessionId = generateUUID();
    sessionStorage.setItem('optimachain-session-id', sessionId);
  }
  
  return sessionId;
}

// UUIDの生成
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// エラー通知の表示
export function showErrorNotification(message, showReloadButton = false) {
  // 既存の通知を削除
  const existingNotification = document.querySelector('.error-notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // 新しい通知を作成
  const notification = document.createElement('div');
  notification.className = 'error-notification';
  
  // 通知アイコン
  const icon = document.createElement('div');
  icon.className = 'error-icon';
  icon.innerHTML = '⚠️';
  notification.appendChild(icon);
  
  // 通知メッセージ
  const messageEl = document.createElement('div');
  messageEl.className = 'error-message';
  messageEl.textContent = message;
  notification.appendChild(messageEl);
  
  // 再読み込みボタン（オプション）
  if (showReloadButton) {
    const reloadButton = document.createElement('button');
    reloadButton.className = 'reload-btn';
    reloadButton.textContent = '再読み込み';
    reloadButton.addEventListener('click', () => window.location.reload());
    notification.appendChild(reloadButton);
  }
  
  // 閉じるボタン
  const closeButton = document.createElement('button');
  closeButton.className = 'close-btn';
  closeButton.textContent = '×';
  closeButton.setAttribute('aria-label', '閉じる');
  closeButton.addEventListener('click', () => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  });
  notification.appendChild(closeButton);
  
  // 通知をDOMに追加
  document.body.appendChild(notification);
  
  // 表示アニメーション
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // 自動的に閉じる（再読み込みボタンがない場合のみ）
  if (!showReloadButton) {
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }
  
  return notification;
}

// 特定のコンポーネントのエラーハンドリング
export function handleComponentError(error, componentName, fallbackUI = null) {
  console.error(`${componentName}でエラーが発生しました:`, error);
  
  // エラーレポートの送信
  if (shouldReportError(error)) {
    reportError({
      message: error.message,
      stack: error.stack,
      type: error.name,
      component: componentName,
      timestamp: new Date().toISOString()
    });
  }
  
  // フォールバックUIがある場合は表示
  if (fallbackUI && typeof fallbackUI === 'function') {
    try {
      return fallbackUI(error);
    } catch (fallbackError) {
      console.error('フォールバックUIの表示に失敗しました:', fallbackError);
    }
  }
  
  // デフォルトのフォールバックUI
  return `<div class="error-container">
    <div class="error-icon">⚠️</div>
    <h3>コンポーネントの読み込みに失敗しました</h3>
    <p>${componentName}の表示中にエラーが発生しました。</p>
    <button onclick="window.location.reload()">再読み込み</button>
  </div>`;
}

// エラーバウンダリの実装（React風）
export class ErrorBoundary {
  constructor(container, fallbackUI) {
    this.container = container;
    this.fallbackUI = fallbackUI;
    this.hasError = false;
  }
  
  // コンポーネントをラップして実行
  render(renderFn) {
    if (this.hasError) {
      return this.renderFallbackUI();
    }
    
    try {
      return renderFn();
    } catch (error) {
      this.hasError = true;
      handleComponentError(error, this.container.id || 'unknown-component');
      return this.renderFallbackUI(error);
    }
  }
  
  // フォールバックUIのレンダリング
  renderFallbackUI(error) {
    if (typeof this.fallbackUI === 'function') {
      return this.fallbackUI(error);
    }
    
    return `<div class="error-boundary">
      <h3>コンポーネントの読み込みに失敗しました</h3>
      <p>問題が解決しない場合は、ページを再読み込みしてください。</p>
      <button onclick="window.location.reload()">再読み込み</button>
    </div>`;
  }
  
  // エラー状態のリセット
  reset() {
    this.hasError = false;
  }
}

// エラーハンドリングのユーティリティ関数
export const ErrorUtils = {
  // 安全な関数実行
  tryCatch: (fn, fallback, context) => {
    try {
      return fn();
    } catch (error) {
      console.error(`Error in ${context}:`, error);
      return typeof fallback === 'function' ? fallback(error) : fallback;
    }
  },
  
  // 非同期関数の安全な実行
  async tryCatchAsync(asyncFn, fallback, context) {
    try {
      return await asyncFn();
    } catch (error) {
      console.error(`Error in async ${context}:`, error);
      return typeof fallback === 'function' ? fallback(error) : fallback;
    }
  },
  
  // エラーメッセージのフォーマット
  formatErrorMessage: (error, userFriendly = true) => {
    if (userFriendly) {
      // ユーザーフレンドリーなエラーメッセージ
      const errorMap = {
        'NetworkError': '接続エラーが発生しました。インターネット接続を確認してください。',
        'TypeError': 'アプリケーションでエラーが発生しました。',
        'SyntaxError': 'データの処理中にエラーが発生しました。',
        'ReferenceError': 'アプリケーションでエラーが発生しました。',
        'RangeError': '無効な値が使用されました。',
        'URIError': 'URLの処理中にエラーが発生しました。',
        'EvalError': 'コードの評価中にエラーが発生しました。'
      };
      
      return errorMap[error.name] || 'エラーが発生しました。もう一度お試しください。';
    }
    
    // 開発者向けの詳細なエラーメッセージ
    return `${error.name}: ${error.message}\n${error.stack || ''}`;
  }
};
