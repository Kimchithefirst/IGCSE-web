import express, { Request, Response } from 'express';
import Quiz from '../models/Quiz';
import Question from '../models/Question';
import { seedMathQuizzes } from '../scripts/seedMathQuizzes';

const router = express.Router();

// Route to create a sample math quiz with questions
router.post('/math-quiz', async (req: Request, res: Response) => {
  try {
    // Create Algebra Quiz
    const algebraQuiz = await Quiz.create({
      title: 'Algebra I - Linear Equations',
      subject: 'Mathematics',
      description: 'Test your knowledge of basic algebraic concepts including solving linear equations and inequalities.',
      duration: 30,
      difficultyLevel: 'beginner',
      isPublished: true
    });
    
    // Create Algebra Questions
    const algebraQuestions = await Question.create([
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
    
    res.status(201).json({
      success: true,
      data: {
        quiz: algebraQuiz,
        questions: algebraQuestions
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'An unknown error occurred'
      });
    }
  }
});

// Route to create comprehensive math quizzes with various question types
router.post('/comprehensive-math', async (req: Request, res: Response) => {
  try {
    console.log('Starting comprehensive math seeding...');
    
    // Use the pre-defined seeder function
    await seedMathQuizzes();
    
    res.status(200).json({
      success: true,
      message: 'Comprehensive math quizzes seeded successfully'
    });
  } catch (error) {
    console.error('Error seeding comprehensive math quizzes:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
});

// Simple test route that doesn't require database
router.get('/test', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Seed test route is working!'
  });
});

export default router; 