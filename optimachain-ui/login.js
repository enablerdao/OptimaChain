// Login/Register functionality

document.addEventListener('DOMContentLoaded', () => {
  // Tab switching
  const authTabs = document.querySelectorAll('.auth-tab');
  const authContents = document.querySelectorAll('.auth-content');
  
  authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs and contents
      authTabs.forEach(t => t.classList.remove('active'));
      authContents.forEach(c => c.classList.remove('active'));
      
      // Add active class to clicked tab and corresponding content
      tab.classList.add('active');
      const tabName = tab.getAttribute('data-tab');
      document.getElementById(`${tabName}-panel`).classList.add('active');
    });
  });
  
  // Login form submission
  const loginButton = document.getElementById('login-button');
  loginButton.addEventListener('click', async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorContainer = document.getElementById('login-error');
    
    // Validate inputs
    if (!email || !password) {
      errorContainer.innerHTML = '<div class="error-message">メールアドレスとパスワードを入力してください。</div>';
      return;
    }
    
    try {
      // Show loading state
      loginButton.disabled = true;
      loginButton.textContent = 'ログイン中...';
      
      // Make API request
      const response = await fetch('http://localhost:3000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'ログインに失敗しました。');
      }
      
      // Store token and user data
      Auth.setToken(data.token);
      Auth.setUser(data.user);
      
      // Redirect to wallet page
      window.location.href = 'wallet/index.html';
    } catch (error) {
      errorContainer.innerHTML = `<div class="error-message">${error.message}</div>`;
    } finally {
      // Reset button state
      loginButton.disabled = false;
      loginButton.textContent = 'ログイン';
    }
  });
  
  // Register form submission
  const registerButton = document.getElementById('register-button');
  registerButton.addEventListener('click', async () => {
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const errorContainer = document.getElementById('register-error');
    
    // Validate inputs
    if (!username || !email || !password || !confirmPassword) {
      errorContainer.innerHTML = '<div class="error-message">すべての項目を入力してください。</div>';
      return;
    }
    
    if (password !== confirmPassword) {
      errorContainer.innerHTML = '<div class="error-message">パスワードが一致しません。</div>';
      return;
    }
    
    try {
      // Show loading state
      registerButton.disabled = true;
      registerButton.textContent = '登録中...';
      
      // Make API request
      const response = await fetch('http://localhost:3000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '登録に失敗しました。');
      }
      
      // Store token and user data
      Auth.setToken(data.token);
      Auth.setUser(data.user);
      
      // Redirect to wallet page
      window.location.href = 'wallet/index.html';
    } catch (error) {
      errorContainer.innerHTML = `<div class="error-message">${error.message}</div>`;
    } finally {
      // Reset button state
      registerButton.disabled = false;
      registerButton.textContent = '登録';
    }
  });
  
  // Check if user is already logged in
  if (Auth.isAuthenticated()) {
    window.location.href = 'wallet/index.html';
  }
});
