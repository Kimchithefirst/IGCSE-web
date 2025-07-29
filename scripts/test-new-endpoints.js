#!/usr/bin/env node

/**
 * Test New Supabase API Endpoints
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

async function testNewAPI() {
  console.log('🚀 Testing New Supabase API Endpoints\n');
  
  // Test 1: Health check
  console.log('1️⃣ Health Check');
  await testEndpoint(`${API_BASE}/health`);
  console.log('');
  
  // Test 2: API root
  console.log('2️⃣ API Root');
  await testEndpoint(`${API_BASE}`);
  console.log('');
  
  // Test 3: Subjects endpoint
  console.log('3️⃣ Subjects Endpoint');
  await testEndpoint(`${API_BASE}/subjects`);
  console.log('');
  
  // Test 4: Courses endpoint
  console.log('4️⃣ Courses Endpoint');
  await testEndpoint(`${API_BASE}/courses`);
  console.log('');
  
  // Test 5: Courses meta/subjects
  console.log('5️⃣ Courses Meta Subjects');
  await testEndpoint(`${API_BASE}/courses/meta/subjects`);
  console.log('');
  
  // Test 6: Register a test user for dashboard testing
  console.log('6️⃣ Register Test User');
  const registerResult = await testEndpoint(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify({
      email: 'testuser@example.com',
      password: 'testpassword123',
      fullName: 'Test User',
      role: 'student'
    })
  });
  console.log('');
  
  // Test 7: Login test user
  console.log('7️⃣ Login Test User');
  const loginResult = await testEndpoint(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: 'testuser@example.com',
      password: 'testpassword123'
    })
  });
  console.log('');
  
  // Test 8: Dashboard with authentication
  if (loginResult.success && loginResult.data.session?.access_token) {
    console.log('8️⃣ Dashboard (Authenticated)');
    await testEndpoint(`${API_BASE}/dashboard`, {
      headers: {
        'Authorization': `Bearer ${loginResult.data.session.access_token}`
      }
    });
    console.log('');
    
    // Test 9: Dashboard Stats
    console.log('9️⃣ Dashboard Stats');
    await testEndpoint(`${API_BASE}/dashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${loginResult.data.session.access_token}`
      }
    });
    console.log('');
    
    // Test 10: Dashboard Activity
    console.log('🔟 Dashboard Activity');
    await testEndpoint(`${API_BASE}/dashboard/activity`, {
      headers: {
        'Authorization': `Bearer ${loginResult.data.session.access_token}`
      }
    });
    console.log('');
  }
  
  console.log('🏁 API testing completed!');
}

// Check if server is running
testEndpoint(`${API_BASE}/health`)
  .then(result => {
    if (result.success) {
      return testNewAPI();
    } else {
      console.log('❌ Server is not running on port 3001');
      console.log('Please start the server with: npm start');
    }
  })
  .catch(error => {
    console.error('❌ Failed to test API:', error);
  });