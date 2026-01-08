import express from 'express';
import {
  getActiveJobs,
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  endApplication,
  deleteJob,
} from '../controllers/jobController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/active', authenticate, getActiveJobs);
router.get('/all', authenticate, isAdmin, getAllJobs);
router.get('/:id', authenticate, getJobById);
router.post('/', authenticate, isAdmin, createJob);
router.put('/:id', authenticate, isAdmin, updateJob);
router.put('/:id/end', authenticate, isAdmin, endApplication);
router.delete('/:id', authenticate, isAdmin, deleteJob);

export default router;
