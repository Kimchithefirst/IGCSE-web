import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Quiz as QuizDefault } from '../models/Quiz';
import { Question as QuestionDefault } from '../models/Question';
import path from 'path';

// For compatibility with both default and named exports
const Quiz = QuizDefault;
const Question = QuestionDefault;

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Main seeder function
export async function seedMathQuizzes() {
  console.log('🌱 Starting Math Quizzes Seeder...');
  
  try {
    // Connect to the database
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/igcse';
    console.log(`Connecting to MongoDB: ${mongoURI}`);
    await mongoose.connect(mongoURI);
    console.log('📊 Connected to MongoDB');

    // Clear existing data
    await Quiz.deleteMany({ subject: 'Mathematics' });
    await Question.deleteMany({ topic: { $in: ['Algebra', 'Geometry', 'Calculus'] } });
    console.log('🧹 Cleared existing Math quizzes and questions');

    // Create Algebra Quiz
    const algebraQuiz = await Quiz.create({
      title: 'Algebra Fundamentals',
      subject: 'Mathematics',
      description: 'Test your understanding of algebraic expressions, equations, and inequalities.',
      duration: 45, // minutes
      difficultyLevel: 'intermediate',
      totalPoints: 100,
      passingPoints: 60,
      isPublished: true,
      topicTags: ['Algebra', 'Equations', 'Inequalities', 'Functions'],
      tags: ['IGCSE', 'Math', 'Algebra']
    });
    console.log(`✅ Created Algebra Quiz: ${algebraQuiz.title}`);

    // Algebra Questions
    const algebraQuestions = [
      {
        text: 'Solve for x: 2x + 5 = 15',
        options: [
          { text: 'x = 5', isCorrect: true },
          { text: 'x = 10', isCorrect: false },
          { text: 'x = 7.5', isCorrect: false },
          { text: 'x = 3', isCorrect: false }
        ],
        explanation: 'Subtract 5 from both sides: 2x = 10. Then divide both sides by 2: x = 5.',
        quizId: algebraQuiz._id,
        points: 10,
        type: 'multiple-choice',
        difficultyLevel: 'easy',
        hasMathFormula: true,
        topic: 'Algebra'
      },
      {
        text: 'Factor the expression: x² - 9',
        options: [
          { text: '(x + 3)(x - 3)', isCorrect: true },
          { text: '(x + 3)²', isCorrect: false },
          { text: '(x - 3)²', isCorrect: false },
          { text: '(x - 3)(x - 3)', isCorrect: false }
        ],
        explanation: 'This is a difference of squares: a² - b² = (a + b)(a - b). With a = x and b = 3, we get (x + 3)(x - 3).',
        quizId: algebraQuiz._id,
        points: 15,
        type: 'multiple-choice',
        difficultyLevel: 'medium',
        hasMathFormula: true,
        topic: 'Algebra'
      },
      {
        text: 'Find the value of y when x = 2 in the equation y = 3x² - 4x + 5',
        options: [
          { text: '9', isCorrect: true },
          { text: '13', isCorrect: false },
          { text: '7', isCorrect: false },
          { text: '11', isCorrect: false }
        ],
        explanation: 'Substitute x = 2: y = 3(2)² - 4(2) + 5 = 3(4) - 8 + 5 = 12 - 8 + 5 = 9.',
        quizId: algebraQuiz._id,
        points: 15,
        type: 'multiple-choice',
        difficultyLevel: 'medium',
        hasMathFormula: true,
        topic: 'Algebra'
      },
      {
        text: 'What is the solution to the inequality 3x - 7 > 5?',
        correctAnswerForNumerical: '4',
        quizId: algebraQuiz._id,
        points: 15,
        type: 'numerical',
        difficultyLevel: 'medium',
        hasMathFormula: true,
        explanation: 'Add 7 to both sides: 3x > 12. Divide both sides by 3: x > 4. The smallest integer solution is 5.',
        topic: 'Algebra'
      },
      {
        text: 'Solve the equation 2(x + 3) = 3(x - 1)',
        correctAnswerForNumerical: '9',
        quizId: algebraQuiz._id,
        points: 20,
        type: 'numerical',
        difficultyLevel: 'hard',
        hasMathFormula: true,
        explanation: 'Expand: 2x + 6 = 3x - 3. Subtract 3x from both sides: -x + 6 = -3. Subtract 6 from both sides: -x = -9. Multiply both sides by -1: x = 9.',
        topic: 'Algebra'
      }
    ];

    await Question.insertMany(algebraQuestions);
    console.log(`✅ Added ${algebraQuestions.length} questions to Algebra Quiz`);

    // Create Geometry Quiz
    const geometryQuiz = await Quiz.create({
      title: 'Geometry Essentials',
      subject: 'Mathematics',
      description: 'Test your knowledge of geometric shapes, theorems, and properties.',
      duration: 60, // minutes
      difficultyLevel: 'intermediate',
      totalPoints: 100,
      passingPoints: 60,
      isPublished: true,
      topicTags: ['Geometry', 'Shapes', 'Theorems', 'Measurement'],
      tags: ['IGCSE', 'Math', 'Geometry']
    });
    console.log(`✅ Created Geometry Quiz: ${geometryQuiz.title}`);

    // Geometry Questions
    const geometryQuestions = [
      {
        text: 'What is the area of a circle with radius 5 cm? (Use π = 3.14)',
        options: [
          { text: '78.5 cm²', isCorrect: true },
          { text: '31.4 cm²', isCorrect: false },
          { text: '15.7 cm²', isCorrect: false },
          { text: '25 cm²', isCorrect: false }
        ],
        explanation: 'The area of a circle is given by A = πr². With r = 5 cm and π = 3.14, we get A = 3.14 × 5² = 3.14 × 25 = 78.5 cm².',
        quizId: geometryQuiz._id,
        points: 10,
        type: 'multiple-choice',
        difficultyLevel: 'easy',
        hasMathFormula: true,
        topic: 'Geometry'
      },
      {
        text: 'In a right-angled triangle, if one angle is 37°, what is the third angle?',
        options: [
          { text: '53°', isCorrect: true },
          { text: '43°', isCorrect: false },
          { text: '63°', isCorrect: false },
          { text: '143°', isCorrect: false }
        ],
        explanation: 'In a triangle, the sum of angles is 180°. In a right-angled triangle, one angle is 90°. So, the third angle is 180° - 90° - 37° = 53°.',
        quizId: geometryQuiz._id,
        points: 15,
        type: 'multiple-choice',
        difficultyLevel: 'medium',
        hasMathFormula: true,
        topic: 'Geometry'
      },
      {
        text: 'What is the Pythagorean theorem?',
        options: [
          { text: 'a² + b² = c²', isCorrect: true },
          { text: 'a + b + c = 180°', isCorrect: false },
          { text: 'a × b = c', isCorrect: false },
          { text: 'a² - b² = c²', isCorrect: false }
        ],
        explanation: 'The Pythagorean theorem states that in a right-angled triangle, the square of the length of the hypotenuse (c) is equal to the sum of squares of the other two sides (a and b): a² + b² = c².',
        quizId: geometryQuiz._id,
        points: 10,
        type: 'multiple-choice',
        difficultyLevel: 'easy',
        hasMathFormula: true,
        topic: 'Geometry'
      },
      {
        text: 'Calculate the volume of a cube with side length 4 cm.',
        correctAnswerForNumerical: '64',
        quizId: geometryQuiz._id,
        points: 15,
        type: 'numerical',
        difficultyLevel: 'medium',
        hasMathFormula: true,
        explanation: 'The volume of a cube is given by V = s³, where s is the side length. With s = 4 cm, V = 4³ = 64 cm³.',
        topic: 'Geometry'
      },
      {
        text: 'Find the perimeter of a regular hexagon with side length 5 cm.',
        correctAnswerForNumerical: '30',
        quizId: geometryQuiz._id,
        points: 15,
        type: 'numerical',
        difficultyLevel: 'medium',
        hasMathFormula: true,
        explanation: 'The perimeter of a regular hexagon is 6 times the side length. With side length 5 cm, the perimeter is 6 × 5 = 30 cm.',
        topic: 'Geometry'
      }
    ];

    await Question.insertMany(geometryQuestions);
    console.log(`✅ Added ${geometryQuestions.length} questions to Geometry Quiz`);

    // Create Calculus Quiz
    const calculusQuiz = await Quiz.create({
      title: 'Introduction to Calculus',
      subject: 'Mathematics',
      description: 'An introduction to limits, derivatives, and basic integration concepts.',
      duration: 75, // minutes
      difficultyLevel: 'advanced',
      totalPoints: 100,
      passingPoints: 60,
      isPublished: true,
      topicTags: ['Calculus', 'Derivatives', 'Limits', 'Integration'],
      tags: ['IGCSE', 'Math', 'Advanced', 'Calculus']
    });
    console.log(`✅ Created Calculus Quiz: ${calculusQuiz.title}`);

    // Calculus Questions
    const calculusQuestions = [
      {
        text: 'What is the derivative of f(x) = x²?',
        options: [
          { text: 'f\'(x) = 2x', isCorrect: true },
          { text: 'f\'(x) = x²', isCorrect: false },
          { text: 'f\'(x) = 2', isCorrect: false },
          { text: 'f\'(x) = x', isCorrect: false }
        ],
        explanation: 'The derivative of x^n is n·x^(n-1). For x², n = 2, so the derivative is 2x^1 = 2x.',
        quizId: calculusQuiz._id,
        points: 15,
        type: 'multiple-choice',
        difficultyLevel: 'medium',
        hasMathFormula: true,
        topic: 'Calculus'
      },
      {
        text: 'Find the derivative of f(x) = 3x² + 2x - 5',
        options: [
          { text: 'f\'(x) = 6x + 2', isCorrect: true },
          { text: 'f\'(x) = 3x² + 2', isCorrect: false },
          { text: 'f\'(x) = 6x² + 2x', isCorrect: false },
          { text: 'f\'(x) = 3x + 2', isCorrect: false }
        ],
        explanation: 'Use the power rule and linearity of differentiation: f\'(x) = 3·2x + 2·1 - 0 = 6x + 2.',
        quizId: calculusQuiz._id,
        points: 20,
        type: 'multiple-choice',
        difficultyLevel: 'hard',
        hasMathFormula: true,
        topic: 'Calculus'
      },
      {
        text: 'What is the integral of f(x) = 2x?',
        options: [
          { text: 'F(x) = x² + C', isCorrect: true },
          { text: 'F(x) = 2x² + C', isCorrect: false },
          { text: 'F(x) = x + C', isCorrect: false },
          { text: 'F(x) = 2x + C', isCorrect: false }
        ],
        explanation: 'The integral of x^n is (x^(n+1))/(n+1) + C. For 2x, we have 2·x^1, so the integral is 2·(x^2)/2 + C = x² + C.',
        quizId: calculusQuiz._id,
        points: 20,
        type: 'multiple-choice',
        difficultyLevel: 'hard',
        hasMathFormula: true,
        topic: 'Calculus'
      },
      {
        text: 'Evaluate the limit: lim(x→0) (sin(x)/x)',
        correctAnswerForNumerical: '1',
        quizId: calculusQuiz._id,
        points: 25,
        type: 'numerical',
        difficultyLevel: 'hard',
        hasMathFormula: true,
        explanation: 'This is a fundamental limit in calculus. As x approaches 0, sin(x)/x approaches 1.',
        topic: 'Calculus'
      },
      {
        text: 'Find f\'(2) for f(x) = x³ - 4x² + 5x - 3',
        correctAnswerForNumerical: '1',
        quizId: calculusQuiz._id,
        points: 20,
        type: 'numerical',
        difficultyLevel: 'hard',
        hasMathFormula: true,
        explanation: 'f\'(x) = 3x² - 8x + 5. Substitute x = 2: f\'(2) = 3(2)² - 8(2) + 5 = 3(4) - 16 + 5 = 12 - 16 + 5 = 1.',
        topic: 'Calculus'
      }
    ];

    await Question.insertMany(calculusQuestions);
    console.log(`✅ Added ${calculusQuestions.length} questions to Calculus Quiz`);

    console.log('🎉 Math quizzes seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding math quizzes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📊 Disconnected from MongoDB');
  }
}

// Execute the seeder if run directly
if (require.main === module) {
  seedMathQuizzes()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error running seeder:', error);
      process.exit(1);
    });
}