require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Create the express app
const app = express();

// CORS configuration - specifically for your Vercel frontend
const corsOptions = {
  origin: [
    'https://igcse-web.vercel.app',
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running on Vercel',
    timestamp: new Date().toISOString(),
    cors: 'properly configured',
    platform: 'Vercel Serverless'
  });
});

// Auth routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Dashboard routes  
const dashboardRoutes = require('./routes/dashboard');
app.use('/api/dashboard', dashboardRoutes);

// Courses routes
const coursesRoutes = require('./routes/courses');
app.use('/api/courses', coursesRoutes);

// Subjects routes
const subjectsRoutes = require('./routes/subjects');
app.use('/api/subjects', subjectsRoutes);

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

// Test endpoint
app.get('/api/test', (req, res) => {
  res.status(200).json({
    message: 'Backend is working on Vercel!',
    platform: 'Vercel Serverless',
    cors: 'configured and working'
  });
});

// Root endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'IGCSE Backend API on Vercel',
    endpoints: [
      '/api/health',
      '/api/auth',
      '/api/dashboard', 
      '/api/courses',
      '/api/subjects',
      '/api/test',
      '/api/quizzes/igcse'
    ],
    platform: 'Vercel Serverless'
  });
});

// Handle 404 for any other /api paths
app.use('/api', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.originalUrl
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

// Export for serverless
module.exports = app;