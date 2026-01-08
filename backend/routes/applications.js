import express from 'express';
import multer from 'multer';
import {
  applyForJob,
  getUserApplications,
  getAllApplications,
  updateApplicationStatus,
  getTopCandidates,
} from '../controllers/applicationController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

router.post('/apply', authenticate, upload.single('resume'), applyForJob);
router.get('/my-applications', authenticate, getUserApplications);
router.get('/all', authenticate, isAdmin, getAllApplications);
router.put('/:id/status', authenticate, isAdmin, updateApplicationStatus);
router.get('/top-candidates', authenticate, isAdmin, getTopCandidates);

export default router;
