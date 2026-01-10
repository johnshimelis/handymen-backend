import express from 'express';
import {
  createRating,
  getHandymanRatings,
} from '../controllers/ratingController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/handyman/:handymanId', getHandymanRatings);

// Protected routes
router.post('/job/:jobId', authenticate, authorize('customer'), createRating);

export default router;

