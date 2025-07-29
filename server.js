const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
// const config = require('./config'); // Removed as it's unused
const { generateSimilarQuestions } = require('./scripts/ai/ai-question-generator.js'); // Corrected path

const ALLOWED_ORIGIN = 'https://igcse-web.vercel.app';
const PORT = process.env.PORT || 3001;

// MongoDB Atlas connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://igcse-admin:51UwmbZ2KRD1LOfQ@igcse-mock-test.jbrdwgb.mongodb.net/igcse-mock-test?retryWrites=true&w=majority&appName=IGCSE-Mock-Test';

// Question Schema
const questionSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  text: { type: String, required: true },
  options: [{
    text: { type: String, required: true },
    isCorrect: { type: Boolean, required: true }
  }],
  correctAnswer: { type: String, required: true },
  explanation: { type: String },
  subject: { type: String, required: true },
  topics: [{ type: String }],
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
  source: { type: String },
  paperCode: { type: String }
});

// Quiz Schema
const quizSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  subject: { type: String, required: true },
  duration: { type: Number, required: true },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
  questions: [{ type: Number, ref: 'Question' }],
  isPublished: { type: Boolean, default: true }
});

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  username: {
    type: String,
    required: [true, 'Please add a username'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student',
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailVerificationToken: String,
  emailVerificationExpire: Date
}, {
  timestamps: true,
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
    return;
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function() {
  const secret = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
  return jwt.sign(
    { id: this._id.toString() },
    secret,
    { expiresIn: parseInt(process.env.JWT_EXPIRE || '30') * 24 * 60 * 60 }
  );
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Question = mongoose.model('Question', questionSchema);
const Quiz = mongoose.model('Quiz', quizSchema);
const User = mongoose.model('User', userSchema);

// Global data storage
let quizData = [];
let allQuestions = [];

// Connect to MongoDB Atlas
async function connectToMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    // Load data from MongoDB
    const questions = await Question.find({});
    const quizzes = await Quiz.find({});
    
    if (questions.length > 0 && quizzes.length > 0) {
      console.log(`📚 Loaded ${questions.length} questions and ${quizzes.length} quizzes from MongoDB Atlas`);
      
      // Convert MongoDB data to expected format
      allQuestions = questions.map(q => ({
        id: q.id,
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        subject: q.subject,
        topics: q.topics || [],
        difficulty: q.difficulty,
        source: q.source,
        paperCode: q.paperCode
      }));
      
      quizData = quizzes.map(quiz => ({
        id: quiz.id,
        title: quiz.title,
        subject: quiz.subject,
        duration: quiz.duration,
        difficulty: quiz.difficulty,
        questions: quiz.questions.map(qId => allQuestions.find(q => q.id === qId)).filter(Boolean),
        isPublished: quiz.isPublished
      }));
      
      return true;
    }
  } catch (error) {
    console.error('❌ MongoDB Atlas connection failed:', error.message);
  }
  return false;
}

// Load fallback data
function loadFallbackData() {
  try {
    const physicsData = JSON.parse(fs.readFileSync('./data/physics_questions.json', 'utf8'));
    quizData = physicsData.quizzes || [];
    allQuestions = [];
    
    quizData.forEach(quiz => {
      if (quiz.questions) {
        allQuestions.push(...quiz.questions);
      }
    });
    
    console.log(`📚 Loaded ${quizData.length} quizzes from physics_questions.json`);
    return true;
  } catch (error) {
    console.error('❌ Failed to load fallback data:', error.message);
    return false;
  }
}

// Helper function to extract topics from question text
function extractTopics(questionText) {
  const topicKeywords = {
    'forces': ['force', 'newton', 'pressure', 'weight', 'mass', 'acceleration', 'friction'],
    'waves': ['wave', 'frequency', 'wavelength', 'amplitude', 'sound', 'light', 'electromagnetic'],
    'energy': ['energy', 'kinetic', 'potential', 'work', 'power', 'joule', 'watt'],
    'electricity': ['current', 'voltage', 'resistance', 'circuit', 'ohm', 'electrical', 'charge'],
    'thermal': ['temperature', 'heat', 'thermal', 'conduction', 'convection', 'radiation', 'evaporation'],
    'atomic': ['atom', 'nuclear', 'radioactive', 'electron', 'proton', 'neutron'],
    'mechanics': ['motion', 'velocity', 'speed', 'displacement', 'momentum'],
    'magnetism': ['magnetic', 'magnet', 'field', 'pole'],
    'fluids': ['density', 'pressure', 'liquid', 'gas', 'float', 'buoyancy', 'volume'],
    'general': ['unit', 'measurement', 'SI', 'meter', 'kilogram', 'second']
  };
  
  const text = questionText.toLowerCase();
  const detectedTopics = [];
  
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      detectedTopics.push(topic);
    }
  }
  
  return detectedTopics.length > 0 ? detectedTopics : ['general'];
}

// Helper function to calculate similarity between questions
function calculateSimilarity(question1, question2) {
  const topics1 = question1.topics || extractTopics(question1.text);
  const topics2 = question2.topics || extractTopics(question2.text);
  
  // Topic overlap (60% weight)
  const commonTopics = topics1.filter(topic => topics2.includes(topic));
  const topicScore = commonTopics.length / Math.max(topics1.length, topics2.length, 1);
  
  // Text similarity (40% weight)
  const words1 = question1.text.toLowerCase().split(/\s+/);
  const words2 = question2.text.toLowerCase().split(/\s+/);
  const commonWords = words1.filter(word => words2.includes(word) && word.length > 3);
  const textScore = commonWords.length / Math.max(words1.length, words2.length, 1);
  
  return (topicScore * 0.6) + (textScore * 0.4);
}

// Helper function to send token response
function sendTokenResponse(user, statusCode, res) {
  const token = user.getSignedJwtToken();
  
  const options = {
    expires: new Date(Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRE || '30') * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };
  
  // Remove password from user object
  const userResponse = {
    _id: user._id.toString(), // Ensure _id is a string
    name: user.name,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
  
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Origin, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Set-Cookie': `token=${token}; ${Object.entries(options).map(([key, value]) => `${key}=${value}`).join('; ')}`
  });
  
  res.end(JSON.stringify({
    success: true,
    token,
    data: userResponse
  }));
}

// Helper function to parse request body
function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        if (body.trim() === '') {
          resolve({});
        } else {
          resolve(JSON.parse(body));
        }
      } catch (error) {
        reject(new Error('Invalid JSON'));
      }
    });
    
    req.on('error', reject);
  });
}

// Helper function to find similar questions
async function findSimilarQuestions(questionId, targetCount = 3) {
  const sourceQuestion = allQuestions.find(q => q.id === parseInt(questionId));
  if (!sourceQuestion) {
    return { success: false, error: 'Question not found' };
  }
  
  const sourceTopics = sourceQuestion.topics || extractTopics(sourceQuestion.text);
  console.log(`📋 Source question topics: [${sourceTopics.join(', ')}]`);
  
  // Find similar questions from database
  const similarQuestions = allQuestions
    .filter(q => q.id !== parseInt(questionId))
    .map(q => ({
      ...q,
      similarity: calculateSimilarity(sourceQuestion, q)
    }))
    .filter(q => q.similarity > 0.3)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, targetCount);
  
  console.log(`📊 Found ${similarQuestions.length} similar questions in database`);
  
  // Generate AI questions if needed
  const aiQuestionsNeeded = Math.max(0, targetCount - similarQuestions.length);
  let aiQuestions = [];
  
  if (aiQuestionsNeeded > 0) {
    console.log(`🤖 Generating ${aiQuestionsNeeded} AI questions to reach target of ${targetCount}`);
    try {
      aiQuestions = await generateSimilarQuestions(sourceQuestion, aiQuestionsNeeded);
      console.log(`✅ Successfully generated ${aiQuestions.length} AI questions`);
    } catch (error) {
      console.error('❌ AI question generation failed:', error.message);
      aiQuestions = [];
    }
  }
  
  const allSimilarQuestions = [...similarQuestions, ...aiQuestions].slice(0, targetCount);
  console.log(`🎯 Returning ${allSimilarQuestions.length} questions: ${similarQuestions.length} from DB + ${aiQuestions.length} from AI`);
  
  return {
    success: true,
    data: allSimilarQuestions,
    metadata: {
      fromDatabase: similarQuestions.length,
      fromAI: aiQuestions.length,
      sourceQuestion: sourceQuestion
    }
  };
}

// Helper function to send JSON response
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Origin, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true'
  });
  res.end(JSON.stringify(data));
}

// Helper function to send CORS preflight response
function sendCORS(res) {
  res.writeHead(204, { // Changed to 204
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Origin, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true'
  });
  res.end();
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;
  
  console.log(`[${new Date().toISOString()}] ${method} ${pathname}`);
  
  // Handle CORS preflight
  if (method === 'OPTIONS') {
    sendCORS(res);
    return;
  }

  // Health check endpoint
  if (pathname === '/api/health' && method === 'GET') {
    sendJSON(res, 200, {
      success: true,
      message: 'IGCSE Mock Test API is running',
        timestamp: new Date().toISOString(),
      database: mongoose.connection.readyState === 1 ? 'MongoDB Atlas' : 'Local JSON',
      totalQuestions: allQuestions.length,
      totalQuizzes: quizData.length
    });
      return;
    }

  // Get all quizzes
  if (pathname === '/api/quizzes/igcse' && method === 'GET') {
    sendJSON(res, 200, {
          success: true,
      data: quizData,
      metadata: {
        totalQuizzes: quizData.length,
        totalQuestions: allQuestions.length,
        source: mongoose.connection.readyState === 1 ? 'MongoDB Atlas' : 'Local JSON'
      }
    });
      return;
    }

  // Get subjects with question counts and sample questions for quiz selection
  if (pathname === '/api/subjects' && method === 'GET') {
    // Group questions by subject
    const subjectGroups = {};
    
    allQuestions.forEach(question => {
      const subject = question.subject || 'Unknown';
      if (!subjectGroups[subject]) {
        subjectGroups[subject] = [];
      }
      subjectGroups[subject].push(question);
    });
    
    // Create subject summary
    const subjects = Object.entries(subjectGroups).map(([subject, questions]) => ({
      id: subject.toLowerCase().replace(/\s+/g, '-'),
      name: subject,
      questionCount: questions.length,
      description: `Practice ${subject} with ${questions.length} authentic IGCSE questions`,
      sampleQuestions: questions.slice(0, 3).map(q => ({
        id: q.id,
        text: q.text.substring(0, 100) + (q.text.length > 100 ? '...' : '')
      }))
    }));
    
    sendJSON(res, 200, {
      success: true,
      data: subjects,
      metadata: {
        totalSubjects: subjects.length,
        totalQuestions: allQuestions.length
      }
    });
    return;
  }

  // Get questions for a specific subject
  if (pathname.match(/^\/api\/subjects\/[^\/]+\/questions$/) && method === 'GET') {
    const subjectId = pathname.split('/')[3];
    const subjectName = subjectId.replace(/-/g, ' ');
    
    // Find questions for this subject (case-insensitive)
    const subjectQuestions = allQuestions.filter(q => 
      q.subject && q.subject.toLowerCase() === subjectName.toLowerCase()
    );
    
    if (subjectQuestions.length === 0) {
      sendJSON(res, 404, { 
        success: false, 
        error: `No questions found for subject: ${subjectName}` 
      });
      return;
    }
    
    // Create a quiz-like structure for the subject
    const subjectQuiz = {
      _id: subjectId,
      title: `${subjectQuestions[0].subject} Practice Quiz`,
      subject: subjectQuestions[0].subject,
      paperCode: `${subjectId.toUpperCase()}-ALL`,
      examSession: 'Practice',
      duration: Math.max(30, Math.min(120, Math.ceil(subjectQuestions.length * 1.5))), // 1.5 min per question, min 30, max 120
      questions: subjectQuestions
    };
    
    sendJSON(res, 200, {
      success: true,
      data: subjectQuiz,
      metadata: {
        totalQuestions: subjectQuestions.length,
        subject: subjectQuestions[0].subject
      }
    });
    return;
  }

  // Get specific question
  if (pathname.match(/^\/api\/questions\/\d+$/) && method === 'GET') {
    const questionId = parseInt(pathname.split('/')[3]);
    const question = allQuestions.find(q => q.id === questionId);
    
    if (question) {
      sendJSON(res, 200, { success: true, data: question });
    } else {
      sendJSON(res, 404, { success: false, error: 'Question not found' });
    }
        return;
      }
      
  // Get similar questions
  if (pathname.match(/^\/api\/questions\/\d+\/similar$/) && method === 'GET') {
    const questionId = parseInt(pathname.split('/')[3]);
    console.log(`🔍 Finding 3 similar questions for ID: ${questionId}`);
    
    try {
      const result = await findSimilarQuestions(questionId, 3);
      if (result.success) {
        sendJSON(res, 200, result);
      } else {
        sendJSON(res, 404, result);
      }
    } catch (error) {
      console.error('Error finding similar questions:', error);
      sendJSON(res, 500, { success: false, error: 'Internal server error' });
    }
      return;
    }

  // Auth Routes

  // Register user
  if (pathname === '/api/auth/register' && method === 'POST') {
    try {
      const { name, username, email, password, role } = await parseRequestBody(req);
      
      // Validate required fields
      if (!name || !username || !email || !password) {
        sendJSON(res, 400, {
          success: false,
          message: 'Please provide name, username, email and password'
        });
        return;
      }
      
      // Check if user already exists (by username or email)
      const existingUser = await User.findOne({ 
        $or: [{ username }, { email }] 
      });
      if (existingUser) {
        const field = existingUser.username === username ? 'username' : 'email';
        sendJSON(res, 400, {
          success: false,
          message: `User already exists with this ${field}`
        });
        return;
      }
      
      // Create user
      const user = await User.create({
        name,
        username,
        email,
        password,
        role: role || 'student'
      });
      
      // Send token response
      sendTokenResponse(user, 201, res);
    } catch (error) {
      console.error('Error registering user:', error);
      sendJSON(res, 500, {
        success: false,
        message: 'Server error while registering user',
        error: error.message
      });
    }
    return;
  }

  // Login user
  if (pathname === '/api/auth/login' && method === 'POST') {
    try {
      const { username, password } = await parseRequestBody(req);
      
      // Validate required fields
      if (!username || !password) {
        sendJSON(res, 400, {
          success: false,
          message: 'Please provide username and password'
        });
        return;
      }
      
      // Check for user
      const user = await User.findOne({ username }).select('+password');
      if (!user) {
        sendJSON(res, 401, {
          success: false,
          message: 'Invalid credentials'
        });
        return;
      }
      
      // Check if password matches
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        sendJSON(res, 401, {
          success: false,
          message: 'Invalid credentials'
        });
        return;
      }
      
      // Send token response
      sendTokenResponse(user, 200, res);
    } catch (error) {
      console.error('Error logging in:', error);
      sendJSON(res, 500, {
        success: false,
        message: 'Server error while logging in',
        error: error.message
      });
    }
    return;
  }

  // Get current logged in user
  if (pathname === '/api/auth/me' && method === 'GET') {
    try {
      // Extract token from Authorization header or cookie
      let token;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      } else if (req.headers.cookie) {
        const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        }, {});
        token = cookies.token;
      }
      
      if (!token) {
        sendJSON(res, 401, {
          success: false,
          message: 'No token provided'
        });
        return;
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
      const user = await User.findById(decoded.id);
      
      if (!user) {
        sendJSON(res, 401, {
          success: false,
          message: 'User not found'
        });
        return;
      }
      
      sendJSON(res, 200, {
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error getting user profile:', error);
      sendJSON(res, 401, {
        success: false,
        message: 'Invalid token'
      });
    }
    return;
  }

  // Logout user
  if (pathname === '/api/auth/logout' && method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Credentials': 'true',
      'Set-Cookie': 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; httpOnly=true; secure=' + (process.env.NODE_ENV === 'production') + '; sameSite=strict'
    });
    
    res.end(JSON.stringify({
      success: true,
      message: 'User logged out successfully'
    }));
    return;
  }

  // Serve static files (React app)
  if (pathname === '/' || pathname.startsWith('/static/') || pathname.endsWith('.js') || pathname.endsWith('.css')) {
    const filePath = pathname === '/' ? './frontend/dist/index.html' : `./frontend/dist${pathname}`;
    
    try {
      const data = fs.readFileSync(filePath);
      const ext = path.extname(filePath);
      let contentType = 'text/html';
      
      if (ext === '.js') contentType = 'application/javascript';
      else if (ext === '.css') contentType = 'text/css';
      else if (ext === '.json') contentType = 'application/json';
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    } catch (error) {
      sendJSON(res, 404, { success: false, error: 'File not found' });
    }
        return;
      }
      
  // 404 for all other routes
  sendJSON(res, 404, { success: false, error: 'Endpoint not found' });
});

// Initialize server
async function startServer() {
  // Try to connect to MongoDB Atlas first
  const mongoConnected = await connectToMongoDB();
  
  // If MongoDB fails, load fallback data
  if (!mongoConnected) {
    console.log('📝 Using fallback quiz data');
    loadFallbackData();
  }
  
  // Start server
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Enhanced IGCSE backend running on 0.0.0.0:${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
    console.log(`✅ CORS configured for origin: ${ALLOWED_ORIGIN}`);
    console.log(`🔗 Enhanced similar questions endpoint: /api/questions/{id}/similar (returns 3 questions)`);
    
    if (process.env.OPENROUTER_API_KEY) {
      console.log(`🤖 AI Question Generation: ENABLED`);
      console.log(`🔧 OpenRouter Model: ${process.env.OPENROUTER_MODEL || 'default'}`);
    } else {
      console.log(`🤖 AI Question Generation: DISABLED`);
      console.log(`⚠️  Set OPENROUTER_API_KEY and OPENROUTER_MODEL to enable AI generation`);
    }
  });
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await mongoose.disconnect();
  server.close(() => {
    console.log('✅ Server shut down gracefully');
    process.exit(0);
  });
});

// Start the server
startServer().catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
}); 