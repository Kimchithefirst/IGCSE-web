const http = require('http');
const url = require('url');

// Simple CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Origin, X-Requested-With',
  'Access-Control-Max-Age': '86400',
  'Content-Type': 'application/json'
};

// Sample quiz data
const quizData = [
  {
    paperCode: 'PHYSICS_JUNE_2020_P1',
    examSession: 'June 2020',
    paperType: 'Paper 1',
    subject: 'Physics',
    questions: [
      {
        id: 1,
        questionText: 'What is the SI unit of force?',
        options: ['Newton', 'Joule', 'Watt', 'Pascal'],
        correctAnswer: 'Newton'
      },
      {
        id: 2,
        questionText: 'What is the speed of light in vacuum?',
        options: ['3 × 10^8 m/s', '3 × 10^6 m/s', '3 × 10^9 m/s', '3 × 10^7 m/s'],
        correctAnswer: '3 × 10^8 m/s'
      },
      {
        id: 3,
        questionText: 'What is Newton\'s first law of motion?',
        options: [
          'An object at rest stays at rest unless acted upon by force',
          'Force equals mass times acceleration',
          'For every action there is an equal and opposite reaction',
          'Energy cannot be created or destroyed'
        ],
        correctAnswer: 'An object at rest stays at rest unless acted upon by force'
      }
    ]
  }
];

// Parse request body
const parseBody = (req) => {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
};

// Simple HTTP server
const server = http.createServer(async (req, res) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // Set CORS headers for all requests
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling OPTIONS preflight request');
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  try {
    // Health check
    if (path === '/api/health' || path === '/api') {
      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'success',
        message: 'Simple backend is working with CORS!',
        timestamp: new Date().toISOString(),
        method: req.method,
        path: path
      }));
      return;
    }

    // Auth login
    if (path === '/api/auth/login' && req.method === 'POST') {
      const body = await parseBody(req);
      const { username, password } = body;
      
      console.log('Login attempt:', { username });
      
      if (username === 'student' && password === 'password123') {
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          message: 'Login successful',
          user: {
            id: 1,
            username: 'student',
            role: 'student'
          }
        }));
      } else {
        res.writeHead(401);
        res.end(JSON.stringify({
          success: false,
          message: 'Invalid credentials'
        }));
      }
      return;
    }

    // Quiz data
    if (path === '/api/quizzes/igcse' && req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: quizData
      }));
      return;
    }

    // Dashboard
    if (path === '/api/dashboard' && req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        message: 'Dashboard data',
        stats: {
          totalQuestions: 128,
          subjects: ['Physics'],
          papers: 16
        }
      }));
      return;
    }

    // Test endpoint
    if (path === '/api/test' && req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({
        message: 'Simple backend is working perfectly!',
        cors: 'configured and working',
        timestamp: new Date().toISOString()
      }));
      return;
    }

    // Root endpoint
    if (path === '/') {
      res.writeHead(200);
      res.end(JSON.stringify({
        message: 'Simple IGCSE Backend - Working!',
        version: '1.0.0',
        endpoints: ['/api/health', '/api/test', '/api/auth/login', '/api/quizzes/igcse', '/api/dashboard']
      }));
      return;
    }

    // 404 for unknown routes
    res.writeHead(404);
    res.end(JSON.stringify({
      error: 'API endpoint not found',
      path: path,
      method: req.method,
      available: ['/api/health', '/api/auth/login', '/api/quizzes/igcse', '/api/dashboard', '/api/test']
    }));

  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500);
    res.end(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }));
  }
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Simple backend running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log('✅ CORS properly configured for all origins');
});

module.exports = server; 