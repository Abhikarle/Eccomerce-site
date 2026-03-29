const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const JWT_SECRET = 'your-secret-key'; // In production, use environment variable

const products = [
  { id: 1, name: 'Laptop', price: 999, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop' },
  { id: 2, name: 'Phone', price: 599, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop' },
  { id: 3, name: 'Tablet', price: 399, image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop' },
  { id: 4, name: 'Headphones', price: 199, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop' },
  { id: 5, name: 'Watch', price: 299, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop' },
  { id: 6, name: 'Camera', price: 799, image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop' },
  { id: 7, name: 'Gaming Console', price: 449, image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop' },
  { id: 8, name: 'Bluetooth Speaker', price: 129, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop' },
  { id: 9, name: 'Smart Home Hub', price: 149, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop' },
  { id: 10, name: 'Fitness Tracker', price: 89, image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&h=300&fit=crop' }
];

let cart = [];
let users = []; // In production, use a database
let resetTokens = {}; // Store reset tokens temporarily (in production, use database with expiration)

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' });
});

app.get('/', (req, res) => {
  res.json({
    message: 'E-Commerce API Server',
    version: '1.0.0',
    description: 'Backend API for ModernShop',
    endpoints: {
      products: '/api/products',
      cart: '/api/cart',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        forgotPassword: 'POST /api/auth/forgot-password',
        resetPassword: 'POST /api/auth/reset-password',
        me: 'GET /api/auth/me',
        logout: 'POST /api/auth/logout'
      }
    }
  });
});

// Authentication endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = users.find(user => user.email === email || user.username === username);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: users.length + 1,
      username,
      email,
      password: hashedPassword,
      createdAt: new Date()
    };

    users.push(user);

    // Generate JWT token
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user
    const user = users.find(user => user.username === username || user.email === username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json({
    user: { id: user.id, username: user.username, email: user.email }
  });
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email
    const user = users.find(user => user.email === email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate reset token (in production, use crypto.randomBytes)
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Store token with user ID (in production, store in database with expiration)
    resetTokens[resetToken] = {
      userId: user.id,
      expires: Date.now() + 3600000 // 1 hour
    };

    // In production, send email with reset link
    // For demo purposes, return the token
    res.json({
      message: 'Password reset token generated',
      resetToken: resetToken,
      note: 'In production, this token would be sent via email'
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET handler for forgot-password (returns info about the endpoint)
app.get('/api/auth/forgot-password', (req, res) => {
  res.json({
    message: 'Password reset endpoint - use POST with email in body',
    method: 'POST',
    body: { email: 'string' },
    example: 'curl -X POST http://localhost:3000/api/auth/forgot-password -H "Content-Type: application/json" -d \'{"email":"user@example.com"}\''
  });
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if token exists and is valid
    const tokenData = resetTokens[token];
    if (!tokenData) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    if (Date.now() > tokenData.expires) {
      delete resetTokens[token];
      return res.status(400).json({ error: 'Reset token has expired' });
    }

    // Find user
    const user = users.find(u => u.id === tokenData.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;

    // Remove used token
    delete resetTokens[token];

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  // In a stateless JWT system, logout is handled on the client side
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/cart', authenticateToken, (req, res) => {
  res.json(cart);
});

app.post('/api/cart', authenticateToken, (req, res) => {
  const item = req.body;
  if (!item || !item.id) return res.status(400).json({ error: 'Invalid item' });

  const existing = cart.find((p) => p.id === item.id);
  if (existing) {
    existing.quantity += item.quantity || 1;
  } else {
    cart.push({ ...item, quantity: item.quantity || 1 });
  }

  res.json(cart);
});

app.put('/api/cart/:id', authenticateToken, (req, res) => {
  const id = Number(req.params.id);
  const { quantity } = req.body;
  const item = cart.find((p) => p.id === id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  item.quantity = Math.max(1, Number(quantity) || 1);
  res.json(cart);
});

app.delete('/api/cart/:id', authenticateToken, (req, res) => {
  const id = Number(req.params.id);
  cart = cart.filter((p) => p.id !== id);
  res.json(cart);
});

app.delete('/api/cart', authenticateToken, (req, res) => {
  cart = [];
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
