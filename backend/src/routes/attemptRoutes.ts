import express from 'express';
import {
  startAttempt,
  submitAnswer,
  completeAttempt,
  getAttempt,
  getUserAttempts
} from '../controllers/attemptController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Start a new attempt - must be authenticated
router.post('/', protect, startAttempt);

// Get attempt details - must be authenticated
router.get('/:attemptId', protect, getAttempt);

// Complete an attempt - must be authenticated
router.put('/:attemptId/complete', protect, completeAttempt);

// Submit an answer - must be authenticated
router.post('/:attemptId/questions/:questionId/answer', protect, submitAnswer);

// Get all attempts for a user - must be authenticated
router.get('/user/:userId', protect, getUserAttempts);

export default router; 