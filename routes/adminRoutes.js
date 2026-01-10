import express from 'express';
import {
  getDashboardStats,
  getUsers,
  getHandymen,
  getJobs,
  toggleUserBlock,
  verifyHandyman,
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

router.get('/dashboard/stats', getDashboardStats);
router.get('/users', getUsers);
router.get('/handymen', getHandymen);
router.get('/jobs', getJobs);
router.put('/users/:userId/block', toggleUserBlock);
router.put('/handymen/:handymanId/verify', verifyHandyman);

export default router;

