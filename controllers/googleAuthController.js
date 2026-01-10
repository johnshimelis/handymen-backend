import passport from 'passport';
import { generateToken } from '../utils/generateToken.js';

/**
 * Initiate Google OAuth login
 */
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

/**
 * Google OAuth callback
 */
export const googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    // Log errors for debugging
    if (err) {
      console.error('Google OAuth Error:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name,
      });
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/login?error=auth_failed&details=${encodeURIComponent(err.message)}`);
    }

    if (!user) {
      console.error('Google OAuth: No user returned');
      console.error('Info:', info);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/login?error=user_not_found`);
    }

    try {
      // Generate JWT token
      const token = generateToken(user._id);

      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
      
      // Determine if this is a new user (no phone number means new Google signup)
      const isNewUser = !user.phoneNumber;
      
      res.redirect(`${frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
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
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/login?error=token_error`);
    }
  })(req, res, next);
};

