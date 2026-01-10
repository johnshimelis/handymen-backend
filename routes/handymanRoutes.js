import express from 'express';
import {
  registerHandyman,
  getHandymanProfile,
  updateHandymanProfile,
  searchHandymen,
  getHandymanById,
} from '../controllers/handymanController.js';
import { getServiceCategories } from '../controllers/serviceController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/categories', getServiceCategories);
router.get('/search', searchHandymen);
router.get('/:id', getHandymanById);

// Protected routes (handyman only)
router.post('/register', authenticate, registerHandyman);
router.get('/profile/me', authenticate, authorize('handyman'), getHandymanProfile);
router.put('/profile/me', authenticate, authorize('handyman'), updateHandymanProfile);

export default router;

