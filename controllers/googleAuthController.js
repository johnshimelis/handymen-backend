import passport from 'passport';
import { generateToken } from '../utils/generateToken.js';

/**
 * Initiate Google OAuth login
 */
/**
 * Initiate Google OAuth login
 */
export const googleAuth = (req, res, next) => {
  const state = req.query.state;
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL; // Ensure specific callback URL is used

  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: state,
    callbackURL: callbackUrl
  })(req, res, next);
};

/**
 * Google OAuth callback
 */
export const googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    // Determine the base URL for redirection
    // 1. Try to get it from the 'state' query param (passed back by Google)
    // 2. Fallback to FRONTEND_URL env var
    // 3. Fallback to localhost default
    let baseUrl = process.env.FRONTEND_URL || 'http://localhost:8080';

    if (req.query.state) {
      const allowedOrigins = [
        'http://localhost:8080',
        'http://localhost:5173',
        'https://agelgay.com',
        'https://www.agelgay.com',
        process.env.FRONTEND_URL
      ].filter(Boolean);

      // Validate the state URL
      const isAllowed = allowedOrigins.some(origin => req.query.state.startsWith(origin));
      if (isAllowed) {
        baseUrl = req.query.state;
      } else {
        console.warn('Google Callback: Invalid state/origin received:', req.query.state);
      }
    }

    // Log errors for debugging
    if (err) {
      console.error('Google OAuth Error:', err);
      return res.redirect(`${baseUrl}/login?error=auth_failed&details=${encodeURIComponent(err.message)}`);
    }

    if (!user) {
      console.error('Google OAuth: No user returned');
      return res.redirect(`${baseUrl}/login?error=user_not_found`);
    }

    try {
      // Generate JWT token
      const token = generateToken(user._id);

      // Determine if this is a new user
      const isNewUser = !user.phoneNumber;

      res.redirect(`${baseUrl}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
        id: user._id,
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
        isVerified: user.isVerified,
      }))}&newUser=${isNewUser}`);
    } catch (tokenError) {
      console.error('Token generation error:', tokenError);
      return res.redirect(`${baseUrl}/login?error=token_error`);
    }
  })(req, res, next);
};

