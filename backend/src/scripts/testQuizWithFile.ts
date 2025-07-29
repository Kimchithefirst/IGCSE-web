import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import Quiz from '../models/Quiz';
import Question from '../models/Question';
import { connectToDatabase } from '../config/database';

// Load environment variables
dotenv.config();

// File to write results to
const outputFile = path.join(__dirname, '..', '..', 'quiz-test-results.txt');

// Function to write to both console and file
function log(message: string) {
  console.log(message);
  fs.appendFileSync(outputFile, message + '\n');
}

async function testQuizzesWithFile() {
  // Clear the file first
  fs.writeFileSync(outputFile, '');
  
  try {
    log('Connecting to MongoDB...');
    await connectToDatabase();
    
    // Get all quizzes
    const quizzes = await Quiz.find();
    log(`Found ${quizzes.length} quizzes:`);
    
    if (quizzes.length === 0) {
      log('No quizzes found. Creating a sample quiz...');
      
      // Create an Algebra Quiz
      const algebraQuiz = await Quiz.create({
        title: 'Algebra I - Linear Equations',
        subject: 'Mathematics',
        description: 'Test your knowledge of basic algebraic concepts including solving linear equations and inequalities.',
        duration: 30,
        difficultyLevel: 'beginner',
        isPublished: true
      });
      
      log('Created quiz: ' + algebraQuiz.title);
      
      // Create sample questions
      const questions = await Question.create([
        {
          quizId: algebraQuiz._id,
          text: 'Solve for x: 3x + 5 = 20',
          options: [
            { text: 'x = 4', isCorrect: false },
            { text: 'x = 5', isCorrect: true },
            { text: 'x = 6', isCorrect: false },
            { text: 'x = 7', isCorrect: false }
          ],
          type: 'multiple-choice',
          explanation: 'To solve: 3x + 5 = 20, subtract 5 from both sides to get 3x = 15, then divide by 3 to get x = 5.',
          points: 2,
          topic: 'Linear Equations',
          difficultyLevel: 'easy'
        },
        {
          quizId: algebraQuiz._id,
          text: 'Which of these is a linear equation?',
          options: [
            { text: 'y = x²', isCorrect: false },
            { text: 'y = x + 3', isCorrect: true },
            { text: 'y = 1/x', isCorrect: false },
            { text: 'y = √x', isCorrect: false }
          ],
          type: 'multiple-choice',
          explanation: 'A linear equation has a degree of 1 for each variable. Therefore, y = x + 3 is linear.',
          points: 2,
          topic: 'Linear Equations',
          difficultyLevel: 'easy'
        }
      ]);
      
      log(`Created ${questions.length} questions for quiz: ${algebraQuiz.title}`);
      
      // Now fetch the quizzes again to display
      const updatedQuizzes = await Quiz.find();
      await displayQuizzes(updatedQuizzes);
    } else {
      // Display existing quizzes
      await displayQuizzes(quizzes);
    }
    
    log('\nTest completed successfully! Results saved to: ' + outputFile);
    
  } catch (error) {
    log('Error testing quizzes:');
    if (error instanceof Error) {
      log(error.message);
      log(error.stack || '');
    } else {
      log(String(error));
    }
  } finally {
    // Close connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      log('MongoDB connection closed');
    }
    
    log('\nCheck the output file for results: ' + outputFile);
    process.exit(0);
  }
}

async function displayQuizzes(quizzes: any[]) {
  for (const quiz of quizzes) {
    log(`\n====== QUIZ: ${quiz.title} ======`);
    log(`Subject: ${quiz.subject}`);
    log(`Duration: ${quiz.duration} minutes`);
    log(`Difficulty: ${quiz.difficultyLevel}`);
    
    // Find questions for this quiz
    const questions = await Question.find({ quizId: quiz._id });
    log(`Found ${questions.length} questions for this quiz:`);
    
    // Show all questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      log(`\n----- Question ${i+1}: ${q.text} -----`);
      log(`Type: ${q.type}`);
      log(`Topic: ${q.topic}`);
      log(`Difficulty: ${q.difficultyLevel}`);
      log(`Points: ${q.points}`);
      
      if (q.options && q.options.length > 0) {
        log('Options:');
        q.options.forEach((opt: any, idx: number) => {
          log(`  ${String.fromCharCode(65 + idx)}. ${opt.text} ${opt.isCorrect ? '(CORRECT)' : ''}`);
        });
      }
      
      if (q.explanation) {
        log(`Explanation: ${q.explanation}`);
      }
    }
  }
}

// Run the test function
testQuizzesWithFile(); 