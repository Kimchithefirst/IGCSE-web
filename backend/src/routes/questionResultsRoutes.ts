import express from 'express';
import { 
  getUserQuestionResults, 
  getAttemptQuestionResults, 
  createQuestionResult,
  getTopicQuestionResults
} from '../controllers/questionResultsController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Get all question results for a user
router.get('/user/:userId', protect, getUserQuestionResults);

// Get question results for a specific attempt
router.get('/attempt/:attemptId', protect, getAttemptQuestionResults);

// Get question results by topic for a user
router.get('/topic/:topic/user/:userId', protect, getTopicQuestionResults);

// Create a new question result
router.post('/', protect, createQuestionResult);

export default router; 