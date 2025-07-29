// Test script to verify backend API connection
const BACKEND_URL = 'https://igcse-backend-public-427ejh541-weiyou-cuis-projects.vercel.app';

async function testHealthEndpoint() {
  try {
    console.log('Testing health endpoint...');
    const response = await fetch(`${BACKEND_URL}/api/health.js`);
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
    console.log('\n📝 Next steps:');
    console.log('1. Update your frontend .env file with:');
    console.log(`   VITE_API_URL=${BACKEND_URL}`);
    console.log('2. In your frontend API calls, use:');
    console.log('   - Health: /api/health.js');
    console.log('   - Auth: /api/auth.js');
    console.log('   - Dashboard: /api/dashboard.js');
    console.log('   - Courses: /api/courses.js');
  } else {
    console.log('\n⚠️  Issues detected. Please check the backend deployment.');
  }
}

// Run the tests
runTests().catch(console.error); 