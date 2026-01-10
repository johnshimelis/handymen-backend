// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

/**
 * Configure Google OAuth Strategy
 */
// Only configure if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  console.log('✅ Google OAuth Strategy configured');
  passport.use(
    'google',
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists with this Google ID
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            // User exists, return user
            return done(null, user);
          }

          // Check if user exists with this email
          if (profile.emails && profile.emails[0]) {
            user = await User.findOne({ email: profile.emails[0].value });
            if (user) {
              // Link Google account to existing user
              user.googleId = profile.id;
              if (!user.profilePhoto && profile.photos && profile.photos[0]) {
                user.profilePhoto = profile.photos[0].value;
              }
              await user.save();
              return done(null, user);
            }
          }

          // Create new user
          const userData = {
            googleId: profile.id,
            fullName: profile.displayName || 'Google User',
            role: 'customer',
            isVerified: true, // Google accounts are pre-verified
          };
          
          // Add email if available
          if (profile.emails && profile.emails[0]) {
            userData.email = profile.emails[0].value.toLowerCase().trim();
          }
          
          // Add profile photo if available
          if (profile.photos && profile.photos[0]) {
            userData.profilePhoto = profile.photos[0].value;
          }
          
          console.log('Creating new user with Google data:', { ...userData, googleId: '***' });
          user = new User(userData);

          await user.save();
          return done(null, user);
        } catch (error) {
          console.error('Error in Google OAuth strategy:', error);
          console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
          });
          return done(error, null);
        }
      }
    )
  );
} else {
  console.warn('⚠️  Google OAuth credentials not found. Google login will not work.');
  console.warn('   Make sure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in .env file');
}

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
