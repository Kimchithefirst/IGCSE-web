import mongoose from 'mongoose';
import Quiz from '../models/Quiz';
import Question from '../models/Question';
import { connectDB } from '../config/db';

// Sample math quizzes
const mathQuizzes = [
  {
    title: 'IGCSE Mathematics: Algebra Basics',
    subject: 'Mathematics',
    description: 'Test your knowledge of basic algebraic concepts including equations, inequalities, and functions.',
    duration: 30, // in minutes
    difficultyLevel: 'beginner',
    totalPoints: 50,
    passingPoints: 30,
    isPublished: true,
    tags: ['algebra', 'equations', 'igcse']
  },
  {
    title: 'IGCSE Mathematics: Geometry and Trigonometry',
    subject: 'Mathematics',
    description: 'Practice questions on angles, shapes, transformations, and basic trigonometric ratios.',
    duration: 45,
    difficultyLevel: 'intermediate',
    totalPoints: 60,
    passingPoints: 36,
    isPublished: true,
    tags: ['geometry', 'trigonometry', 'igcse']
  },
  {
    title: 'IGCSE Mathematics: Statistics and Probability',
    subject: 'Mathematics',
    description: 'Test your understanding of data handling, measures of central tendency, and probability concepts.',
    duration: 40,
    difficultyLevel: 'intermediate',
    totalPoints: 55,
    passingPoints: 33,
    isPublished: true,
    tags: ['statistics', 'probability', 'igcse']
  }
];

// Sample math questions
const createMathQuestions = async (quizId: mongoose.Types.ObjectId, subject: string) => {
  let questions = [];
  
  if (subject === 'Mathematics') {
    // Questions depend on the quiz type
    if (quizId.toString().endsWith('1')) { // Algebra quiz
      questions = [
        {
          text: 'Solve for x: 2x + 5 = 15',
          options: [
            { text: 'x = 5', isCorrect: true },
            { text: 'x = 10', isCorrect: false },
            { text: 'x = 7.5', isCorrect: false },
            { text: 'x = 3', isCorrect: false }
          ],
          explanation: 'To solve, subtract 5 from both sides: 2x = 10. Then divide both sides by 2: x = 5.',
          quizId,
          points: 10,
          type: 'multiple-choice'
        },
        {
          text: 'Simplify the expression: 3(2x - 4) + 5',
          options: [
            { text: '6x - 12 + 5', isCorrect: false },
            { text: '6x - 7', isCorrect: true },
            { text: '6x - 12', isCorrect: false },
            { text: '6x + 1', isCorrect: false }
          ],
          explanation: 'First distribute: 3(2x - 4) = 6x - 12. Then add 5: 6x - 12 + 5 = 6x - 7.',
          quizId,
          points: 10,
          type: 'multiple-choice'
        },
        {
          text: 'If f(x) = 2x² - 3x + 1, find f(2).',
          options: [
            { text: '3', isCorrect: true },
            { text: '5', isCorrect: false },
            { text: '7', isCorrect: false },
            { text: '9', isCorrect: false }
          ],
          explanation: 'Substitute x = 2 into the function: f(2) = 2(2)² - 3(2) + 1 = 2(4) - 6 + 1 = 8 - 6 + 1 = 3',
          quizId,
          points: 10,
          type: 'multiple-choice'
        },
        {
          text: 'Solve the inequality: 3x - 7 > 2',
          options: [
            { text: 'x > 3', isCorrect: true },
            { text: 'x < 3', isCorrect: false },
            { text: 'x > 9/3', isCorrect: false },
            { text: 'x < 9/3', isCorrect: false }
          ],
          explanation: 'Add 7 to both sides: 3x > 9. Then divide both sides by 3: x > 3.',
          quizId,
          points: 10,
          type: 'multiple-choice'
        },
        {
          text: 'Factor the expression: x² - 9',
          options: [
            { text: '(x - 3)(x - 3)', isCorrect: false },
            { text: '(x + 3)(x - 3)', isCorrect: true },
            { text: '(x + 9)(x - 1)', isCorrect: false },
            { text: '(x - 9)(x + 1)', isCorrect: false }
          ],
          explanation: 'This is a difference of squares: a² - b² = (a + b)(a - b). So x² - 9 = x² - 3² = (x + 3)(x - 3).',
          quizId,
          points: 10,
          type: 'multiple-choice'
        }
      ];
    } else if (quizId.toString().endsWith('2')) { // Geometry quiz
      questions = [
        {
          text: 'What is the sum of angles in a triangle?',
          options: [
            { text: '90°', isCorrect: false },
            { text: '180°', isCorrect: true },
            { text: '270°', isCorrect: false },
            { text: '360°', isCorrect: false }
          ],
          explanation: 'The sum of interior angles in a triangle is always 180 degrees.',
          quizId,
          points: 10,
          type: 'multiple-choice'
        },
        {
          text: 'Find the area of a circle with radius 5 cm.',
          options: [
            { text: '25π cm²', isCorrect: true },
            { text: '10π cm²', isCorrect: false },
            { text: '5π cm²', isCorrect: false },
            { text: '50π cm²', isCorrect: false }
          ],
          explanation: 'The area of a circle is πr². With r = 5, the area is π(5)² = 25π cm².',
          quizId,
          points: 10,
          type: 'multiple-choice'
        },
        {
          text: 'In a right-angled triangle, if sin θ = 0.6, what is cos θ?',
          options: [
            { text: '0.6', isCorrect: false },
            { text: '0.8', isCorrect: true },
            { text: '1.6', isCorrect: false },
            { text: '1.8', isCorrect: false }
          ],
          explanation: 'Using the Pythagorean identity sin²θ + cos²θ = 1, we get cos²θ = 1 - sin²θ = 1 - 0.36 = 0.64. Therefore, cos θ = 0.8.',
          quizId,
          points: 10,
          type: 'multiple-choice'
        },
        {
          text: 'What is the value of sin 30°?',
          options: [
            { text: '1/2', isCorrect: true },
            { text: '√3/2', isCorrect: false },
            { text: '√2/2', isCorrect: false },
            { text: '1', isCorrect: false }
          ],
          explanation: 'The value of sin 30° is 1/2 or 0.5.',
          quizId,
          points: 10,
          type: 'multiple-choice'
        },
        {
          text: 'A rectangle has a length of 8 cm and a width of 6 cm. What is its perimeter?',
          options: [
            { text: '14 cm', isCorrect: false },
            { text: '24 cm', isCorrect: false },
            { text: '28 cm', isCorrect: true },
            { text: '48 cm', isCorrect: false }
          ],
          explanation: 'The perimeter of a rectangle is 2(length + width) = 2(8 + 6) = 2(14) = 28 cm.',
          quizId,
          points: 10,
          type: 'multiple-choice'
        },
        {
          text: 'What is the value of cos 60°?',
          options: [
            { text: '1/2', isCorrect: true },
            { text: '√3/2', isCorrect: false },
            { text: '0', isCorrect: false },
            { text: '1', isCorrect: false }
          ],
          explanation: 'The value of cos 60° is 1/2 or 0.5.',
          quizId,
          points: 10,
          type: 'multiple-choice'
        }
      ];
    } else { // Statistics quiz
      questions = [
        {
          text: 'What is the mean of the numbers 3, 7, 8, 12, and 15?',
          options: [
            { text: '7', isCorrect: false },
            { text: '8', isCorrect: false },
            { text: '9', isCorrect: true },
            { text: '10', isCorrect: false }
          ],
          explanation: 'To find the mean, add all the numbers and divide by the count: (3 + 7 + 8 + 12 + 15) / 5 = 45 / 5 = 9.',
          quizId,
          points: 11,
          type: 'multiple-choice'
        },
        {
          text: 'What is the probability of rolling a number greater than 4 on a standard six-sided die?',
          options: [
            { text: '1/6', isCorrect: false },
            { text: '1/3', isCorrect: true },
            { text: '1/2', isCorrect: false },
            { text: '2/3', isCorrect: false }
          ],
          explanation: 'Numbers greater than 4 on a six-sided die are 5 and 6, which is 2 out of 6 possibilities. Probability = 2/6 = 1/3.',
          quizId,
          points: 11,
          type: 'multiple-choice'
        },
        {
          text: 'What is the median of the numbers 7, 4, 2, 8, 10?',
          options: [
            { text: '4', isCorrect: false },
            { text: '7', isCorrect: true },
            { text: '8', isCorrect: false },
            { text: '10', isCorrect: false }
          ],
          explanation: 'To find the median, arrange the numbers in order: 2, 4, 7, 8, 10. The middle value is 7.',
          quizId,
          points: 11,
          type: 'multiple-choice'
        },
        {
          text: 'What is the range of the data set: 5, 8, 12, 15, 21, 23?',
          options: [
            { text: '15', isCorrect: false },
            { text: '16', isCorrect: false },
            { text: '18', isCorrect: true },
            { text: '21', isCorrect: false }
          ],
          explanation: 'The range is the difference between the maximum and minimum values: 23 - 5 = 18.',
          quizId,
          points: 11,
          type: 'multiple-choice'
        },
        {
          text: 'A bag contains 3 red marbles, 4 blue marbles, and 5 green marbles. What is the probability of randomly selecting a blue marble?',
          options: [
            { text: '1/4', isCorrect: false },
            { text: '1/3', isCorrect: true },
            { text: '4/12', isCorrect: false },
            { text: '5/12', isCorrect: false }
          ],
          explanation: 'The probability is the number of blue marbles divided by the total number of marbles: 4/(3+4+5) = 4/12 = 1/3.',
          quizId,
          points: 11,
          type: 'multiple-choice'
        }
      ];
    }
  }
  
  // Create the questions in the database
  return Question.insertMany(questions);
};

// Seed the database with sample data
export const seedDatabase = async () => {
  try {
    // Connect to the database
    await connectDB();
    
    // Clear existing data
    await Quiz.deleteMany({});
    await Question.deleteMany({});
    
    console.log('Database cleared');
    
    // Insert quizzes
    const createdQuizzes = await Quiz.insertMany(mathQuizzes);
    console.log(`${createdQuizzes.length} quizzes created`);
    
    // Insert questions for each quiz
    for (const quiz of createdQuizzes) {
      const questions = await createMathQuestions(quiz._id, quiz.subject);
      console.log(`${questions.length} questions created for quiz: ${quiz.title}`);
      
      // Update the quiz with total points based on questions
      const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
      await Quiz.findByIdAndUpdate(quiz._id, { totalPoints });
    }
    
    console.log('Seed completed successfully');
    return { success: true, message: 'Database seeded successfully' };
  } catch (error) {
    console.error('Error seeding database:', error);
    return { success: false, message: 'Error seeding database' };
  }
};

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seed process complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed process failed:', error);
      process.exit(1);
    });
} 