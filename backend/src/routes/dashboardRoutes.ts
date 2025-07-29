import { Router } from 'express';
import {
  getDashboardData,
  getUserStats,
  getRecentActivity
} from '../controllers/dashboardController';
import { authenticate } from '../middleware/supabaseAuth';

const router = Router();

// All dashboard routes require authentication
router.get('/', authenticate, getDashboardData);
router.get('/stats', authenticate, getUserStats);
router.get('/activity', authenticate, getRecentActivity);

export default router; 