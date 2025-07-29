import express from 'express';
import { getSubjects } from '../controllers/subjectController';
// import { protect } from '../middleware/auth'; // Add if protection is needed, for now public

const router = express.Router();

// @desc    Get all subjects with question counts and samples
// @route   GET /api/subjects
// @access  Public (or Protect if needed)
router.get('/', getSubjects);

// Example for a future route if needed:
// router.get('/:subjectId/questions', getQuestionsForSubject);

export default router;
