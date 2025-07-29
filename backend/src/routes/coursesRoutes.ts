import { Router } from 'express';
import {
  getCourses,
  getCourseById,
  getCourseTopics,
  createCourse,
  getSubjectsList,
  updateCourse,
  deleteCourse
} from '../controllers/coursesController';
import { authenticate, authorize } from '../middleware/supabaseAuth';

const router = Router();

// Public routes
router.get('/', getCourses);
router.get('/meta/subjects', getSubjectsList);
router.get('/:id', getCourseById);
router.get('/:id/topics', getCourseTopics);

// Protected routes (teacher/admin only)
router.post('/', authenticate, authorize('teacher', 'admin'), createCourse);
router.put('/:id', authenticate, authorize('teacher', 'admin'), updateCourse);
router.delete('/:id', authenticate, authorize('admin'), deleteCourse);

export default router;