import mongoose from 'mongoose';
import { seedMathQuizzes } from './seedMathQuizzes';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Check if .env file exists, if not, create it with default values
const envFilePath = path.resolve(__dirname, '../../../.env');
if (!fs.existsSync(envFilePath)) {
  console.log('📝 .env file not found, creating with default values...');
  const defaultEnvContent = `PORT=3001
MONGODB_URI=mongodb://localhost:27017/igcse
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d`;
  fs.writeFileSync(envFilePath, defaultEnvContent);
  console.log('✅ .env file created with default values');
}

// Main setup function
async function setupDatabase() {
  console.log('🚀 Starting database setup...');
  
  try {
    // Get MongoDB URI from environment variable or use default
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/igcse';
    console.log(`📊 Connecting to MongoDB: ${mongoURI}`);
    
    // Connect to MongoDB
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');
    
    // Seed math quizzes
    console.log('🌱 Seeding math quizzes...');
    await seedMathQuizzes();
    console.log('✅ Math quizzes seeded successfully');
    
    console.log('✨ Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('📊 Disconnected from MongoDB');
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  setupDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Error running database setup:', error);
      process.exit(1);
    });
} 