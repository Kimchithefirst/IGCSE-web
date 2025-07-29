import { Router } from 'express';
import {
  register,
  login,
  logout,
  verifyToken,
  getProfile,
  updateProfile
} from '../controllers/supabaseAuthController';
import { authenticate } from '../middleware/supabaseAuth';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/verify', verifyToken);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

export default router;