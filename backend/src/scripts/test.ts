console.log('⭐ TypeScript is working!');
console.log('Current timestamp:', new Date().toISOString());
console.log('Node.js version:', process.version);
console.log('Current directory:', process.cwd());
console.log('Environment variables:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI
});

// Try to import the Quiz and Question models
try {
  const { Quiz } = require('../models/Quiz');
  console.log('Quiz model import successful:', !!Quiz);
} catch (error: any) {
  console.error('Quiz model import failed:', error.message);
} 