import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import supabaseAuthRoutes from './routes/supabaseAuthRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import subjectsRoutes from './routes/subjectsRoutes';
import coursesRoutes from './routes/coursesRoutes';
import { authenticate } from './middleware/supabaseAuth';

// Load environment variables
dotenv.config();

// Create the express app
const app = express();

// CORS configuration
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
    message: 'Server is running with Supabase',
    timestamp: new Date().toISOString(),
    cors: 'properly configured',
    database: 'Supabase PostgreSQL'
  });
});

// Auth routes (new Supabase-based)
app.use('/api/auth', supabaseAuthRoutes);

// New Supabase-based API routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/courses', coursesRoutes);

// Legacy routes for backward compatibility (will be removed later)
const legacyAuthRoutes = require('../api/auth');
const legacyDashboardRoutes = require('../api/dashboard');
const legacyCoursesRoutes = require('../api/courses');
const legacySubjectRoutes = require('../api/subjects');

app.use('/api/auth-legacy', legacyAuthRoutes);
app.use('/api/dashboard-legacy', authenticate, legacyDashboardRoutes);
app.use('/api/courses-legacy', legacyCoursesRoutes);
app.use('/api/subjects-legacy', legacySubjectRoutes);

// IGCSE data endpoint (temporary - should be moved to proper controller)
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
    message: 'Backend is working with Supabase!',
    auth: 'Supabase Auth enabled',
    database: 'PostgreSQL via Supabase'
  });
});

// Root endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'IGCSE Backend API - Supabase Edition',
    endpoints: [
      '/api/health',
      '/api/auth/register',
      '/api/auth/login',
      '/api/auth/logout', 
      '/api/auth/verify',
      '/api/auth/profile',
      '/api/dashboard',
      '/api/dashboard/stats',
      '/api/dashboard/activity',
      '/api/subjects',
      '/api/subjects/:id',
      '/api/courses',
      '/api/courses/:id',
      '/api/courses/:id/topics',
      '/api/courses/meta/subjects',
      '/api/test',
      '/api/quizzes/igcse',
      '--- Legacy Endpoints ---',
      '/api/auth-legacy',
      '/api/dashboard-legacy',
      '/api/courses-legacy',
      '/api/subjects-legacy'
    ],
    database: 'Supabase PostgreSQL',
    auth: 'Supabase Auth'
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
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

export default app;