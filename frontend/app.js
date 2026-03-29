let products = [];
let cart = [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let currentUser = null;
let authToken = localStorage.getItem('authToken');

const API_BASE = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', async () => {
  checkAuthStatus();
  await loadProducts();
  await loadCart();
  updateWishlistCount();
  updateAuthUI();
  initializeSearch();
});

async function loadProducts() {
  try {
    const res = await fetch(`${API_BASE}/products`);
    products = await res.json();
    displayProducts();
  } catch (err) {
    console.error('Error loading products', err);
    showNotification('Unable to load product list', true);
  }
}

async function loadCart() {
  if (!authToken) return;

  try {
    const res = await fetch(`${API_BASE}/cart`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    cart = await res.json();
    updateCartCount();
    updateCart();
  } catch (err) {
    console.error('Error loading cart', err);
    showNotification('Unable to load cart', true);
  }
}

function displayProducts(productsToDisplay = products) {
  const productList = document.getElementById('product-list');
  productList.innerHTML = '';

  if (productsToDisplay.length === 0) {
    productList.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; animation: fadeIn 0.3s ease;">
        <i class="fa fa-search" style="font-size: 48px; color: #ccc; margin-bottom: 20px; animation: pulse 2s infinite;"></i>
        <p style="color: #999; font-size: 18px;">No products found. Try a different search.</p>
      </div>
    `;
    return;
  }

  productsToDisplay.forEach(product => {
    const isWishlisted = wishlist.some(item => item.id === product.id);
    const productEl = document.createElement('div');
    productEl.className = 'product';
    productEl.innerHTML = `
      <img src="${product.image}" alt="${product.name}" loading="lazy">
      <div class="product-content">
        <h3>${product.name}</h3>
        <p>${product.description || 'High quality product'}</p>
        <div class="product-price">$${product.price.toFixed(2)}</div>
        <div class="product-rating">
          <div class="stars">★★★★★</div>
          <span class="rating-count">(${Math.floor(Math.random() * 500) + 10} reviews)</span>
        </div>
        <div class="product-actions">
          <button class="btn-primary add-to-cart-btn" onclick="addToCart(${product.id})">
            <i class="fa fa-shopping-cart"></i> Add to Cart
          </button>
          <button class="wishlist-btn ${isWishlisted ? 'liked' : ''}" onclick="toggleWishlist(${product.id})" title="Add to wishlist">
            <i class="fa-${isWishlisted ? 'solid' : 'regular'} fa-heart"></i>
          </button>
        </div>
      </div>
    `;
    productList.appendChild(productEl);
  });
}

async function addToCart(productId) {
  if (!authToken) {
    showNotification('Please login to add items to cart', true);
    showLogin();
    return;
  }

  const button = event.target.closest('.add-to-cart-btn');
  const originalText = button.innerHTML;

  // Show loading state
  button.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Adding...';
  button.disabled = true;
  button.classList.add('loading');

  const product = products.find(p => p.id === productId);
  if (!product) return;

  try {
    const res = await fetch(`${API_BASE}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ id: product.id, name: product.name, price: product.price, quantity: 1 }),
    });

    cart = await res.json();
    updateCartCount();
    updateCart();
    toggleCart(); // Open the cart sidebar after adding
    showNotification('Product added to cart!');

    // Animate cart icon
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
      cartIcon.classList.add('bounce');
      setTimeout(() => cartIcon.classList.remove('bounce'), 600);
    }

  } catch (err) {
    console.error('Error adding to cart', err);
    showNotification('Unable to add to cart', true);
  } finally {
    // Reset button state
    setTimeout(() => {
      button.innerHTML = originalText;
      button.disabled = false;
      button.classList.remove('loading');
    }, 1000);
  }
}

async function updateQuantity(productId, quantity) {
  quantity = Math.max(1, Number(quantity) || 1);
  try {
    const res = await fetch(`${API_BASE}/cart/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ quantity }),
    });

    cart = await res.json();
    updateCartCount();
    updateCart();
  } catch (err) {
    console.error('Error updating quantity', err);
    showNotification('Unable to update quantity', true);
  }
}

async function removeFromCart(productId) {
  try {
    const res = await fetch(`${API_BASE}/cart/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    cart = await res.json();
    updateCartCount();
    updateCart();
    showNotification('Product removed from cart!');
  } catch (err) {
    console.error('Error removing from cart', err);
    showNotification('Unable to remove from cart', true);
  }
}

async function checkout() {
  if (!authToken) {
    showNotification('Please login to checkout', true);
    showLogin();
    return;
  }

  if (cart.length === 0) {
    showNotification('Your cart is empty!', true);
    return;
  }

  try {
    await fetch(`${API_BASE}/cart`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    cart = [];
    updateCartCount();
    updateCart();
    document.getElementById('cart').classList.remove('active');
    showNotification('Order placed successfully!');
  } catch (err) {
    console.error('Checkout error', err);
    showNotification('Unable to checkout', true);
  }
}

function updateCart() {
  const cartItems = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  cartItems.innerHTML = '';

  let total = 0;

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <li style="padding: 40px 20px; text-align: center; color: #6b7280; animation: fadeIn 0.3s ease;">
        <i class="fa fa-shopping-cart" style="font-size: 48px; margin-bottom: 20px; display: block; opacity: 0.5; animation: pulse 2s infinite;"></i>
        <p style="font-size: 16px; margin-bottom: 20px;">Your cart is empty</p>
        <button class="btn-secondary" onclick="toggleCart(); document.querySelector('.products-section').scrollIntoView({behavior: 'smooth'});" style="font-size: 14px;">
          <i class="fa fa-arrow-left"></i> Continue Shopping
        </button>
      </li>
    `;
    cartTotal.textContent = '$0.00';
    return;
  }

  cart.forEach(item => {
    total += item.price * item.quantity;
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.innerHTML = `
      <div style="flex: 1;">
        <strong style="font-size: 14px; margin-bottom: 4px; display: block;">${item.name}</strong>
        <span style="color: #6366f1; font-weight: 600; font-size: 14px;">$${item.price.toFixed(2)} each</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <input type="number" value="${item.quantity}" min="1" onchange="updateQuantity(${item.id}, this.value)" class="quantity-input" style="width: 50px; padding: 8px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px; text-align: center;">
        <button onclick="removeFromCart(${item.id})" class="btn-danger" style="padding: 8px 12px; font-size: 12px;" title="Remove item">
          <i class="fa fa-trash"></i>
        </button>
      </div>
    `;
    cartItems.appendChild(li);
  });

  cartTotal.textContent = `$${total.toFixed(2)}`;
}

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('cart-count').textContent = count;
}

function toggleCart() {
  const cartEl = document.getElementById('cart');
  cartEl.classList.toggle('active');
  updateCart();
}

function toggleWishlist(productId) {
  const index = wishlist.findIndex(item => item.id === productId);
  if (index > -1) {
    wishlist.splice(index, 1);
  } else {
    const product = products.find(p => p.id === productId);
    if (product) wishlist.push(product);
  }
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  updateWishlistCount();
  displayProducts();
  showNotification(index > -1 ? 'Removed from wishlist!' : 'Added to wishlist!');
}

function updateWishlistCount() {
  document.getElementById('wishlist-count').textContent = wishlist.length;
}

// Search functionality
function initializeSearch() {
  const searchInput = document.getElementById('search');
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
  }
}

function handleSearch(e) {
  const searchQuery = e.target.value.toLowerCase().trim();
  
  if (searchQuery === '') {
    displayProducts();
    return;
  }
  
  const filteredProducts = products.filter(product => {
    const matchesName = product.name.toLowerCase().includes(searchQuery);
    const matchesDescription = (product.description || '').toLowerCase().includes(searchQuery);
    const matchesPrice = product.price.toString().includes(searchQuery);
    
    return matchesName || matchesDescription || matchesPrice;
  });
  
  displayProducts(filteredProducts);
}

function showLogin() {
  document.getElementById('login-box').classList.add('active');
}

document.addEventListener('click', (e) => {
  const loginBox = document.getElementById('login-box');
  if (loginBox.classList.contains('active') && e.target === loginBox) loginBox.classList.remove('active');
  const registerBox = document.getElementById('register-box');
  if (registerBox.classList.contains('active') && e.target === registerBox) registerBox.classList.remove('active');
  const forgotPasswordBox = document.getElementById('forgot-password-box');
  if (forgotPasswordBox.classList.contains('active') && e.target === forgotPasswordBox) forgotPasswordBox.classList.remove('active');
  const resetPasswordBox = document.getElementById('reset-password-box');
  if (resetPasswordBox.classList.contains('active') && e.target === resetPasswordBox) resetPasswordBox.classList.remove('active');
  const cartEl = document.getElementById('cart');
  if (cartEl.classList.contains('active') && !e.target.closest('.cart') && !e.target.closest('.cart-btn')) cartEl.classList.remove('active');
});

async function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (!username || !password) {
    showNotification('Please enter username and password!', true);
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      authToken = data.token;
      currentUser = data.user;
      localStorage.setItem('authToken', authToken);
      document.getElementById('login-box').classList.remove('active');
      document.getElementById('username').value = '';
      document.getElementById('password').value = '';
      updateAuthUI();
      await loadCart(); // Reload cart after login
      showNotification('Logged in successfully!');
    } else {
      showNotification(data.error || 'Login failed', true);
    }
  } catch (err) {
    console.error('Error logging in', err);
    showNotification('Unable to login', true);
  }
}

function showNotification(message, isError = false) {
  const container = document.getElementById('notification-container');
  const notification = document.createElement('div');
  notification.className = `notification ${isError ? 'error' : 'success'}`;
  notification.innerHTML = `
    <i class="fa fa-${isError ? 'exclamation-circle' : 'check-circle'}"></i>
    <span>${message}</span>
    <button class="notification-close" onclick="this.parentElement.remove()" aria-label="Close notification">
      <i class="fa fa-times"></i>
    </button>
  `;

  container.appendChild(notification);

  // Auto remove after 3 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 300);
    }
  }, 3000);
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn { from { opacity: 0; transform: translateX(50px);} to {opacity: 1; transform: translateX(0);} }
  @keyframes slideOut { from { opacity: 1; transform: translateX(0);} to {opacity: 0; transform: translateX(50px);} }
`;
document.head.appendChild(style);

// Authentication functions
async function checkAuthStatus() {
  if (!authToken) return;

  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (res.ok) {
      const data = await res.json();
      currentUser = data.user;
    } else {
      // Token is invalid, clear it
      logout();
    }
  } catch (err) {
    console.error('Error checking auth status', err);
    logout();
  }
}

function updateAuthUI() {
  const authBtn = document.querySelector('.auth-btn');

  if (currentUser) {
    authBtn.innerHTML = `<i class="fa fa-user"></i> ${currentUser.username}`;
    authBtn.onclick = showUserMenu;
  } else {
    authBtn.innerHTML = `<i class="fa fa-user"></i> Login`;
    authBtn.onclick = showLogin;
  }
}

function showUserMenu() {
  // Create a simple dropdown menu
  const existingMenu = document.getElementById('user-menu');
  if (existingMenu) {
    existingMenu.remove();
    return;
  }

  const menu = document.createElement('div');
  menu.id = 'user-menu';
  menu.innerHTML = `
    <div class="user-info">${currentUser.username}</div>
    <button onclick="logout()">
      <i class="fa fa-sign-out-alt"></i> Logout
    </button>
  `;

  document.body.appendChild(menu);

  // Close menu when clicking outside
  document.addEventListener('click', function closeMenu(e) {
    if (!menu.contains(e.target) && !e.target.closest('.auth-btn')) {
      menu.remove();
      document.removeEventListener('click', closeMenu);
    }
  });
}

function logout() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('authToken');
  cart = [];
  updateAuthUI();
  updateCartCount();
  updateCart();
  showNotification('Logged out successfully!');
}

async function register() {
  const username = document.getElementById('reg-username').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const confirmPassword = document.getElementById('reg-confirm-password').value;

  if (!username || !email || !password || !confirmPassword) {
    showNotification('All fields are required!', true);
    return;
  }

  if (password !== confirmPassword) {
    showNotification('Passwords do not match!', true);
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      authToken = data.token;
      currentUser = data.user;
      localStorage.setItem('authToken', authToken);
      document.getElementById('register-box').classList.remove('active');
      document.getElementById('reg-username').value = '';
      document.getElementById('reg-email').value = '';
      document.getElementById('reg-password').value = '';
      document.getElementById('reg-confirm-password').value = '';
      updateAuthUI();
      showNotification('Account created successfully!');
    } else {
      showNotification(data.error || 'Registration failed', true);
    }
  } catch (err) {
    console.error('Error registering', err);
    showNotification('Unable to register', true);
  }
}

function showRegister() {
  document.getElementById('login-box').classList.remove('active');
  document.getElementById('register-box').classList.add('active');
}

function showLoginFromReset() {
  document.getElementById('reset-password-box').classList.remove('active');
  document.getElementById('login-box').classList.add('active');
}

async function requestPasswordReset() {
  const email = document.getElementById('reset-email').value;

  if (!email) {
    showNotification('Please enter your email address!', true);
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (res.ok) {
      // In a real app, this would send an email. For demo, show the token
      showNotification(`Reset token: ${data.resetToken} (Save this for demo purposes)`, false);
      document.getElementById('forgot-password-box').classList.remove('active');
      document.getElementById('reset-password-box').classList.add('active');
      document.getElementById('reset-email').value = '';
    } else {
      showNotification(data.error || 'Failed to send reset email', true);
    }
  } catch (err) {
    console.error('Error requesting password reset', err);
    showNotification('Unable to request password reset', true);
  }
}

async function resetPassword() {
  const token = document.getElementById('reset-token').value;
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-new-password').value;

  if (!token || !newPassword || !confirmPassword) {
    showNotification('All fields are required!', true);
    return;
  }

  if (newPassword !== confirmPassword) {
    showNotification('Passwords do not match!', true);
    return;
  }

  if (newPassword.length < 6) {
    showNotification('Password must be at least 6 characters long!', true);
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });

    const data = await res.json();

    if (res.ok) {
      document.getElementById('reset-password-box').classList.remove('active');
      document.getElementById('login-box').classList.add('active');
      document.getElementById('reset-token').value = '';
      document.getElementById('new-password').value = '';
      document.getElementById('confirm-new-password').value = '';
      showNotification('Password reset successfully! Please login with your new password.', false);
    } else {
      showNotification(data.error || 'Failed to reset password', true);
    }
  } catch (err) {
    console.error('Error resetting password', err);
    showNotification('Unable to reset password', true);
  }
}

function showForgotPassword() {
  document.getElementById('login-box').classList.remove('active');
  document.getElementById('forgot-password-box').classList.add('active');
}

function showLoginFromForgot() {
  document.getElementById('forgot-password-box').classList.remove('active');
  document.getElementById('login-box').classList.add('active');
}
