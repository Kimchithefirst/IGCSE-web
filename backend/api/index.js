require('dotenv').config();

const express = require('express');
const cors = require('cors');
// Fixed import paths for Vercel serverless
const authRoutes = require('./auth');
const dashboardRoutes = require('./dashboard');
const coursesRoutes = require('./courses'); // Import courses routes
const subjectRoutes = require('./subjects');
const authMiddleware = require('../middleware/auth');

// Create the express app
const app = express();

// CORS configuration - specifically for your Vercel frontend
const corsOptions = {
  origin: [
    'https://igcse-web.vercel.app', // Added this specific origin
    'https://igcse-nc6od7oj0-weiyou-cuis-projects.vercel.app',
    /^https:\/\/.*\.vercel\.app$/,
    'http://localhost:5173',
    'http://localhost:5174'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/courses', coursesRoutes); // Mount courses routes
app.use('/api/subjects', subjectRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    cors: 'properly configured'
  });
});

// Auth endpoints for testing
/*
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Default credentials
  if (username === 'student' && password === 'password123') {
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: 1,
        username: 'student',
        role: 'student'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});
*/

// IGCSE data endpoint
app.get('/api/quizzes/igcse', (req, res) => {
  res.status(200).json({
    success: true,
    data: [
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
          }
        ]
      }
    ]
  });
});

// Dashboard endpoint
/*
app.get('/api/dashboard', (req, res) => {
  res.json({
    success: true,
    message: 'Dashboard data',
    stats: {
      totalQuestions: 128,
      subjects: ['Physics'],
      papers: 16
    }
  });
});
*/

// Test endpoint
app.get('/api/test', (req, res) => {
  res.status(200).json({
    message: 'Backend is working!',
    frontend: 'https://igcse-nc6od7oj0-weiyou-cuis-projects.vercel.app',
    cors: 'configured and working'
  });
});

// Root endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'IGCSE Backend API',
    // Ensure this list is updated if other routes are restored or changed.
    endpoints: [
      '/api/health',
      '/api/auth',
      '/api/dashboard',
      '/api/courses',
      '/api/subjects', // Added new endpoint
      '/api/test',
      '/api/quizzes/igcse'
    ]
  });
});

// Handle 404 for any other /api paths not caught by specific routes
app.use('/api', (req, res, next) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.originalUrl // Using originalUrl to get the full path
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // VITE_API_URL is a frontend env var, but we log it here to see what the backend THINKS it should be, if set.
  // For Vercel serverless deployment, API routes are served from the same domain as the frontend.
  console.log(`Expected Frontend API Base URL (VITE_API_URL): ${process.env.VITE_API_URL || 'Not Set (defaults to relative paths or http://localhost:3001 for dev)'}`);
  console.log(`CORS configured for origins: ${JSON.stringify(corsOptions.origin)}`);
});

// Export for serverless (e.g. Vercel)
module.exports = app; 