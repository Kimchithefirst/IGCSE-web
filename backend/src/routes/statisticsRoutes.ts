import express from 'express';
import {
  getUserStatistics,
  updateStatisticsFromAttempt,
  getUserSubjectStatistics
} from '../controllers/statisticsController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Get current user's statistics
router.get('/me', protect, getUserStatistics);

// Get specific user's statistics (admin/teacher only)
router.get('/user/:userId', protect, authorize('ADMIN', 'TEACHER'), getUserStatistics);

// Get user subject statistics
router.get('/user/:userId/subject/:subject', protect, getUserSubjectStatistics);

// Update statistics from attempt
router.post('/update-from-attempt/:attemptId', protect, updateStatisticsFromAttempt);

export default router; 