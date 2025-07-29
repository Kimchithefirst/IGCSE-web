import Quiz from '../models/Quiz';
import Question from '../models/Question';
import mongoose from 'mongoose';

export const seedOnStartup = async (): Promise<void> => {
  try {
    console.log('Checking if seed data is needed...');
    
    // Check if we already have quizzes
    const quizCount = await Quiz.countDocuments();
    if (quizCount > 0) {
      console.log(`Found ${quizCount} existing quizzes. Skipping seed operation.`);
      return;
    }
    
    console.log('No quizzes found. Seeding sample quiz...');
    
    // Create Algebra Quiz
    const algebraQuiz = await Quiz.create({
      title: 'Algebra I - Linear Equations',
      subject: 'Mathematics',
      description: 'Test your knowledge of basic algebraic concepts including solving linear equations and inequalities.',
      duration: 30,
      difficultyLevel: 'beginner',
      isPublished: true
    });
    
    console.log('Created quiz:', algebraQuiz.title);
    
    // Create Algebra Questions
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
    
    console.log(`Created ${questions.length} questions for quiz: ${algebraQuiz.title}`);
    console.log('Seed operation completed successfully!');
    
  } catch (error) {
    console.error('Error seeding initial data:', error);
  }
}; 