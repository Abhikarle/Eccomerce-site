// Sample products
const products = [
    { id: 1, name: 'Laptop', price: 999, image: 'https://m.media-amazon.com/images/I/71XMY67putL._SX679_.jpg' },
    { id: 2, name: 'Phone', price: 599, image: 'https://m.media-amazon.com/images/I/41cslOLNecL._SY300_SX300_QL70_FMwebp_.jpg' },
    { id: 3, name: 'Tablet', price: 399, image: 'https://m.media-amazon.com/images/I/71PwporL-mL._SX679_.jpg' },
    { id: 4, name: 'Headphones', price: 199, image: 'https://m.media-amazon.com/images/I/41VFJcUHTvL._SY300_SX300_QL70_FMwebp_.jpg' },
    { id: 5, name: 'Watch', price: 299, image: 'https://m.media-amazon.com/images/I/816eXKgDfIL._SY879_.jpg' },
    { id: 6, name: 'Camera', price: 799, image: 'https://m.media-amazon.com/images/I/71D+YWeR5GL._SX522_.jpg' }
];

// Initialize cart and wishlist
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

// Display products on page load
document.addEventListener('DOMContentLoaded', () => {
    displayProducts();
    updateCartCount();
    updateWishlistCount();
});

// Display products
function displayProducts() {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';

    products.forEach(product => {
        const isWishlisted = wishlist.some(item => item.id === product.id);
        const productEl = document.createElement('div');
        productEl.className = 'product';
        productEl.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>$${product.price}</p>
            <div class="stars">★★★★★</div>
            <button onclick="addToCart(${product.id})">Add to Cart</button>
            <i class="heart fa-regular fa-heart ${isWishlisted ? 'liked' : ''}" onclick="toggleWishlist(${product.id})"></i>
        `;
        productList.appendChild(productEl);
    });
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCart();
    showNotification('Product added to cart!');
}

// Update cart display
function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    cartItems.innerHTML = '';

    let total = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = '<li><p>Your cart is empty</p></li>';
        cartTotal.textContent = '0';
        return;
    }

    cart.forEach((item, index) => {
        total += item.price * item.quantity;
        const li = document.createElement('li');
        li.className = 'cart-item';
        li.innerHTML = `
            <div>
                <strong>${item.name}</strong><br>
                $${item.price} x <input type="number" value="${item.quantity}" min="1" onchange="updateQuantity(${index}, this.value)" style="width: 40px;">
            </div>
            <button onclick="removeFromCart(${index})" style="background-color: #ff6b6b; padding: 5px 10px;">Delete</button>
        `;
        cartItems.appendChild(li);
    });

    cartTotal.textContent = total;
}

// Update quantity
function updateQuantity(index, quantity) {
    quantity = parseInt(quantity);
    if (quantity < 1) quantity = 1;
    cart[index].quantity = quantity;
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCart();
}

// Remove from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCart();
    showNotification('Product removed from cart!');
}

// Toggle cart
function toggleCart() {
    const cartEl = document.getElementById('cart');
    cartEl.classList.toggle('active');
    updateCart();
}

// Update cart count
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

// Toggle wishlist
function toggleWishlist(productId) {
    const index = wishlist.findIndex(item => item.id === productId);
    if (index > -1) {
        wishlist.splice(index, 1);
    } else {
        const product = products.find(p => p.id === productId);
        wishlist.push(product);
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistCount();
    displayProducts();
    showNotification(index > -1 ? 'Removed from wishlist!' : 'Added to wishlist!');
}

// Update wishlist count
function updateWishlistCount() {
    document.getElementById('wishlist-count').textContent = wishlist.length;
}

// Login
function showLogin() {
    const loginBox = document.getElementById('login-box');
    loginBox.classList.add('active');
}

// Close login on background click
document.addEventListener('click', (e) => {
    const loginBox = document.getElementById('login-box');
    if (loginBox.classList.contains('active') && e.target === loginBox) {
        loginBox.classList.remove('active');
    }
    const cart = document.getElementById('cart');
    if (cart.classList.contains('active') && !e.target.closest('.cart') && !e.target.closest('.cart-btn')) {
        cart.classList.remove('active');
    }
});

// Login function
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username && password) {
        localStorage.setItem('user', JSON.stringify({ username }));
        document.getElementById('login-box').classList.remove('active');
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        showNotification('Logged in successfully!');
    } else {
        showNotification('Please enter username and password!', true);
    }
}

// Checkout
function checkout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', true);
        return;
    }
    localStorage.setItem('cart', JSON.stringify([]));
    cart = [];
    updateCartCount();
    updateCart();
    document.getElementById('cart').classList.remove('active');
    showNotification('Order placed successfully!');
}

// Search products
document.getElementById('search').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const productList = document.getElementById('product-list');
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm)
    );

    productList.innerHTML = '';
    filteredProducts.forEach(product => {
        const isWishlisted = wishlist.some(item => item.id === product.id);
        const productEl = document.createElement('div');
        productEl.className = 'product';
        productEl.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>$${product.price}</p>
            <div class="stars">★★★★★</div>
            <button onclick="addToCart(${product.id})">Add to Cart</button>
            <i class="heart fa-regular fa-heart ${isWishlisted ? 'liked' : ''}" onclick="toggleWishlist(${product.id})"></i>
        `;
        productList.appendChild(productEl);
    });

    if (filteredProducts.length === 0) {
        productList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px;">No products found</p>';
    }
});

// Notification system
function showNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${isError ? '#ff6b6b' : '#51cf66'};
        color: white;
        padding: 15px 20px;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 1002;
        animation: slideIn 0.3s ease-in-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
