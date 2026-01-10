import express from 'express';
import {
  createJob,
  getCustomerJobs,
  getHandymanJobs,
  acceptJob,
  rejectJob,
  updateJobStatus,
  getJobById,
  cancelJob,
} from '../controllers/jobController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Customer routes
router.post('/', authorize('customer'), createJob);
router.get('/customer/my-jobs', authorize('customer'), getCustomerJobs);
router.put('/:jobId/cancel', authorize('customer'), cancelJob);

// Handyman routes
router.get('/handyman/my-jobs', authorize('handyman'), getHandymanJobs);
router.put('/:jobId/accept', authorize('handyman'), acceptJob);
router.put('/:jobId/reject', authorize('handyman'), rejectJob);
router.put('/:jobId/status', authorize('handyman'), updateJobStatus);

// Common routes
router.get('/:jobId', getJobById);

export default router;

