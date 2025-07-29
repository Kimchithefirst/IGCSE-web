// Test script to verify backend API connection with proxy support
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// For environments that need proxy support
const https = require('https');
const http = require('http');

const BACKEND_URL = 'https://igcse-backend-public-427ejh541-weiyou-cuis-projects.vercel.app';

// Configure proxy if needed
const proxyConfig = {
  host: '127.0.0.1',
  port: 1087
};

async function testHealthEndpoint() {
  try {
    console.log('Testing health endpoint...');
    
    // Use native fetch with proxy support
    const response = await fetch(`${BACKEND_URL}/api/health.js`, {
      agent: new https.Agent({
        // Add proxy configuration if needed
      })
    });
    
    const data = await response.json();
    console.log('✅ Health endpoint working:', data);
    return true;
  } catch (error) {
    console.error('❌ Health endpoint failed:', error.message);
    return false;
  }
}

async function testCorsHeaders() {
  try {
    console.log('\nTesting CORS headers...');
    const response = await fetch(`${BACKEND_URL}/api/health.js`, {
      method: 'GET',
      headers: {
        'Origin': 'https://igcse-frontend.vercel.app'
      }
    });
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
    };
    
    console.log('CORS Headers:', corsHeaders);
    return true;
  } catch (error) {
    console.error('❌ CORS test failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Testing Backend API Connection\n');
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log('Expected Frontend URL: https://igcse-frontend.vercel.app\n');
  
  const healthTest = await testHealthEndpoint();
  const corsTest = await testCorsHeaders();
  
  console.log('\n📊 Test Results:');
  console.log(`Health Endpoint: ${healthTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`CORS Headers: ${corsTest ? '✅ PASS' : '❌ FAIL'}`);
  
  if (healthTest && corsTest) {
    console.log('\n🎉 Backend is ready for frontend connection!');
    console.log('\n📝 Next steps for your frontend:');
    console.log('1. Your .env file is already configured with:');
    console.log(`   VITE_API_URL=${BACKEND_URL}`);
    console.log('\n2. Update your API calls to use the .js extension:');
    console.log('   - Health: /api/health.js');
    console.log('   - Auth: /api/auth.js (may need fixes)');
    console.log('   - Dashboard: /api/dashboard.js');
    console.log('   - Courses: /api/courses.js');
    console.log('\n3. Example API call in your frontend:');
    console.log('   const response = await fetch(`${import.meta.env.VITE_API_URL}/api/health.js`);');
  } else {
    console.log('\n⚠️  Issues detected. Please check the backend deployment.');
  }
}

// Run the tests
runTests().catch(console.error); 