import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Quiz from '../models/Quiz';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/igcse';

async function simpleSeed() {
  try {
    console.log('Connecting to MongoDB...');
    console.log(`Connection URI: ${MONGODB_URI}`);
    
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing quizzes
    await Quiz.deleteMany({});
    console.log('Cleared existing quizzes');
    
    // Create a test quiz
    const quiz = await Quiz.create({
      title: 'Test Quiz',
      subject: 'Test',
      description: 'This is a test quiz to verify database connectivity',
      duration: 15,
      difficultyLevel: 'beginner',
      isPublished: true
    });
    
    console.log('Created quiz:', quiz);
    console.log('Simple seed successful!');
    
  } catch (error) {
    console.error('Error in simple seed:', error);
  } finally {
    // Close connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
    process.exit(0);
  }
}

simpleSeed(); 