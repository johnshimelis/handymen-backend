import express from 'express';
import {
  sendOTP,
  verifyOTP,
  loginWithPassword,
  getProfile,
  updateProfile,
} from '../controllers/authController.js';
import { googleAuth, googleCallback } from '../controllers/googleAuthController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/send-otp', sendOTP);
router.post('/signup', sendOTP); // Signup uses sendOTP but with fullName and role
router.post('/verify-otp', verifyOTP);
router.post('/login', loginWithPassword);

// Google OAuth routes
router.get('/google', (req, res, next) => {
  console.log('Google OAuth initiated');
  console.log('Client ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing');
  console.log('Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing');
  console.log('Callback URL:', process.env.GOOGLE_CALLBACK_URL);
  googleAuth(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  console.log('Google OAuth callback received');
  console.log('Query params:', req.query);
  googleCallback(req, res, next);
});

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

export default router;

