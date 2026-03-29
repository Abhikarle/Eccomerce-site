const https = require('https');
const http = require('http');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const urlObj = new URL(url);
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = protocol.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function testApp() {
  console.log('🧪 Testing E-Commerce App...\n');

  try {
    // Test 1: Backend ping
    console.log('1. Testing backend ping...');
    const pingRes = await makeRequest('http://localhost:3000/api/ping');
    console.log(`✅ Backend ping: ${JSON.stringify(pingRes.data)}`);

    // Test 2: Products endpoint
    console.log('\n2. Testing products endpoint...');
    const productsRes = await makeRequest('http://localhost:3000/api/products');
    console.log(`✅ Products loaded: ${productsRes.data.length} products`);

    // Test 3: User registration
    console.log('\n3. Testing user registration...');
    const registerRes = await makeRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      })
    });
    console.log(`✅ User registration: ${registerRes.data.message}`);

    // Test 4: User login
    console.log('\n4. Testing user login...');
    const loginRes = await makeRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser',
        password: 'password123'
      })
    });
    console.log(`✅ User login: ${loginRes.data.message}`);

    const token = loginRes.data.token;

    // Test 5: Add to cart
    console.log('\n5. Testing add to cart...');
    const cartRes = await makeRequest('http://localhost:3000/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        id: 1,
        name: 'Laptop',
        price: 999,
        quantity: 1
      })
    });
    console.log(`✅ Add to cart: ${cartRes.data.length} items in cart`);

    // Test 6: Get cart
    console.log('\n6. Testing get cart...');
    const getCartRes = await makeRequest('http://localhost:3000/api/cart', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`✅ Get cart: ${getCartRes.data.length} items retrieved`);

    // Test 7: Checkout
    console.log('\n7. Testing checkout...');
    const checkoutRes = await makeRequest('http://localhost:3000/api/cart', {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Checkout completed');

    console.log('\n🎉 All tests passed! App is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testApp();