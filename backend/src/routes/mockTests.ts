import express from 'express';
import { Request, Response } from 'express';
import { protect } from '../middleware/auth';

// Interface for the augmented Request object with user
interface AuthRequest extends Request {
  user?: any;
}

const router = express.Router();

// Sample mock test data
const mockTests = [
  {
    id: '1',
    title: 'Biology: Cells and Reproduction',
    subject: 'Biology',
    description: 'A comprehensive test covering cell structure, function, and reproductive processes.',
    duration: 60, // minutes
    questionCount: 45,
    difficultyLevel: 'Medium',
    createdAt: new Date('2023-12-10T08:00:00Z')
  },
  {
    id: '2',
    title: 'Chemistry: Atoms and Bonding',
    subject: 'Chemistry',
    description: 'Test your knowledge on atomic structure, chemical bonding, and related concepts.',
    duration: 75,
    questionCount: 50,
    difficultyLevel: 'Hard',
    createdAt: new Date('2023-12-15T10:30:00Z')
  },
  {
    id: '3',
    title: 'Physics: Forces and Motion',
    subject: 'Physics',
    description: 'Covers Newton\'s laws, momentum, energy, and practical applications.',
    duration: 90,
    questionCount: 60,
    difficultyLevel: 'Medium',
    createdAt: new Date('2023-12-20T14:15:00Z')
  },
  {
    id: '4',
    title: 'Mathematics: Algebra Fundamentals',
    subject: 'Mathematics',
    description: 'Test covering equations, inequalities, functions, and graphing.',
    duration: 120,
    questionCount: 75,
    difficultyLevel: 'Easy',
    createdAt: new Date('2023-12-25T09:45:00Z')
  }
];

/**
 * @route GET /api/mock-tests
 * @desc Get all available mock tests
 * @access Public
 */
router.get('/', (req: Request, res: Response) => {
  try {
    console.log('GET /api/mock-tests - Returning mock tests data');
    
    // Direct response without setTimeout to avoid any async issues
    return res.status(200).json({
      success: true,
      count: mockTests.length,
      data: mockTests
    });
  } catch (error) {
    console.error('Error in GET /api/mock-tests:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching mock tests',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/mock-tests/:id
 * @desc Get a specific mock test by ID
 * @access Protected - Requires authentication
 */
router.get('/:id', protect, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`GET /api/mock-tests/${id} - Fetching specific mock test for user ${req.user?._id}`);
    
    const mockTest = mockTests.find(test => test.id === id);
    
    if (!mockTest) {
      console.log(`Mock test with ID ${id} not found`);
      return res.status(404).json({
        success: false,
        message: `Mock test with ID ${id} not found`
      });
    }
    
    return res.status(200).json({
      success: true,
      data: mockTest
    });
  } catch (error) {
    console.error(`Error in GET /api/mock-tests/${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching mock test',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 