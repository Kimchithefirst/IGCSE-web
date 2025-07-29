#!/usr/bin/env node

/**
 * Test Supabase Auth Endpoints
 */

const API_BASE = 'http://localhost:3001/api';

async function testEndpoint(url, options = {}) {
  try {
    console.log(`🔄 Testing: ${url}`);
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    console.log(`✅ Status: ${response.status}`);
    console.log(`📄 Response:`, JSON.stringify(data, null, 2));
    return { success: true, data, status: response.status };
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testAuthFlow() {
  console.log('🚀 Testing Supabase Auth Endpoints\n');
  
  // Test 1: Health check
  console.log('1️⃣ Health Check');
  await testEndpoint(`${API_BASE}/health`);
  console.log('');
  
  // Test 2: API root
  console.log('2️⃣ API Root');
  await testEndpoint(`${API_BASE}`);
  console.log('');
  
  // Test 3: Register a new user
  console.log('3️⃣ Register User');
  const registerResult = await testEndpoint(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'testpassword123',
      fullName: 'Test User',
      role: 'student'
    })
  });
  console.log('');
  
  // Test 4: Login
  console.log('4️⃣ Login User');
  const loginResult = await testEndpoint(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'testpassword123'
    })
  });
  console.log('');
  
  // Test 5: Verify token (if login was successful)
  if (loginResult.success && loginResult.data.session?.access_token) {
    console.log('5️⃣ Verify Token');
    await testEndpoint(`${API_BASE}/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${loginResult.data.session.access_token}`
      }
    });
    console.log('');
    
    // Test 6: Get Profile
    console.log('6️⃣ Get Profile');
    await testEndpoint(`${API_BASE}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${loginResult.data.session.access_token}`
      }
    });
    console.log('');
  }
  
  console.log('🏁 Auth testing completed!');
}

// Check if server is running
testEndpoint(`${API_BASE}/health`)
  .then(result => {
    if (result.success) {
      return testAuthFlow();
    } else {
      console.log('❌ Server is not running on port 3001');
      console.log('Please start the server with: npm start');
    }
  })
  .catch(error => {
    console.error('❌ Failed to test auth:', error);
  });