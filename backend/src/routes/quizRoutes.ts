import express from 'express';
import {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizQuestions,
  addQuestionToQuiz,
  updateQuestion,
  deleteQuestion,
  getSimilarQuestions // Import the new controller function
} from '../controllers/quizController';
import { protect, authorize } from '../middleware/auth';
import { IGCSEQuiz } from '../models/IGCSEQuiz';

const router = express.Router();

// IGCSE Quiz routes - temporary endpoint for testing
router.get('/igcse', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const query: any = {};
    
    // Add filters
    if (req.query.subject) query.subject = req.query.subject as string;
    if (req.query.paperCode) query.paperCode = req.query.paperCode as string;
    if (req.query.examSession) query.examSession = req.query.examSession as string;
    
    const totalQuizzes = await IGCSEQuiz.countDocuments(query);
    const quizzes = await IGCSEQuiz.find(query)
      .sort({ paperCode: 1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    res.status(200).json({
      success: true,
      count: quizzes.length,
      total: totalQuizzes,
      pages: Math.ceil(totalQuizzes / limit),
      currentPage: page,
      data: quizzes
    });
  } catch (error) {
    console.error('Error fetching IGCSE quizzes:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching IGCSE quizzes',
      error: (error as Error).message
    });
  }
});

// Quiz routes - getQuizzes can remain public, but creation/modification should be protected
router.route('/')
  .get(getQuizzes)
  .post(protect, authorize('TEACHER', 'ADMIN'), createQuiz);

router.route('/:id')
  .get(protect, getQuizById)
  .put(protect, authorize('TEACHER', 'ADMIN'), updateQuiz)
  .delete(protect, authorize('TEACHER', 'ADMIN'), deleteQuiz);

// Question routes
router.route('/:quizId/questions')
  .get(protect, getQuizQuestions)
  .post(protect, authorize('TEACHER', 'ADMIN'), addQuestionToQuiz);

router.route('/:quizId/questions/:questionId')
  .put(protect, authorize('TEACHER', 'ADMIN'), updateQuestion)
  .delete(protect, authorize('TEACHER', 'ADMIN'), deleteQuestion);

// Route for similar questions
router.get('/questions/:originalQuestionId/similar', protect, getSimilarQuestions);

export default router; 