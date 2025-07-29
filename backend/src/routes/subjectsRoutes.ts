import { Router } from 'express';
import {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject
} from '../controllers/subjectsController';
import { authenticate, authorize } from '../middleware/supabaseAuth';

const router = Router();

// Public routes
router.get('/', getSubjects);
router.get('/:id', getSubjectById);

// Protected routes (teacher/admin only)
router.post('/', authenticate, authorize('teacher', 'admin'), createSubject);
router.put('/:id', authenticate, authorize('teacher', 'admin'), updateSubject);
router.delete('/:id', authenticate, authorize('admin'), deleteSubject);

export default router;