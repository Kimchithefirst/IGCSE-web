// Simple Node.js test for backend connection with proxy support
const https = require('https');
const { HttpsProxyAgent } = require('https-proxy-agent');

const BACKEND_URL = 'https://igcse-backend-public-427ejh541-weiyou-cuis-projects.vercel.app';
const PROXY_URL = 'http://127.0.0.1:1087';

async function testBackendConnection() {
  return new Promise((resolve, reject) => {
    const proxyAgent = new HttpsProxyAgent(PROXY_URL);
    const options = {
      hostname: 'igcse-backend-public-427ejh541-weiyou-cuis-projects.vercel.app',
      port: 443,
      path: '/api/health.js',
      method: 'GET',
      agent: proxyAgent,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Node.js Test Client'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            success: true,
            status: res.statusCode,
            data: jsonData
          });
        } catch (error) {
          resolve({
            success: false,
            status: res.statusCode,
            error: 'Invalid JSON response',
            rawData: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject({
        success: false,
        error: error.message
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject({
        success: false,
        error: 'Request timeout'
      });
    });

    req.end();
  });
}

async function runTest() {
  console.log('🚀 Testing Backend Connection with Proxy');
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`Proxy: ${PROXY_URL}`);
  console.log('─'.repeat(50));

  try {
    const result = await testBackendConnection();
    
    if (result.success) {
      console.log('✅ SUCCESS: Backend connection established!');
      console.log(`📊 Status Code: ${result.status}`);
      console.log(`📝 Response:`, result.data);
      console.log('');
      console.log('🎉 Your backend is working correctly!');
      console.log('');
      console.log('📋 Next steps:');
      console.log('1. Configure your browser to use the proxy for development');
      console.log('2. Or test your React app with proxy configuration');
      console.log('3. Deploy your frontend to Vercel (where proxy won\'t be needed)');
      
    } else {
      console.log('❌ FAILED: Connection unsuccessful');
      console.log(`📊 Status Code: ${result.status}`);
      console.log(`❗ Error: ${result.error}`);
      if (result.rawData) {
        console.log(`📄 Raw Response: ${result.rawData}`);
      }
    }
    
  } catch (error) {
    console.log('❌ FAILED: Connection error');
    console.log(`❗ Error: ${error.error || error.message}`);
    console.log('');
    console.log('🔧 Troubleshooting suggestions:');
    console.log('- Check if proxy server is running on 127.0.0.1:1087');
    console.log('- Verify backend deployment status');
    console.log('- Try running: export http_proxy=http://127.0.0.1:1087 && curl [backend-url]');
  }
}

runTest(); 