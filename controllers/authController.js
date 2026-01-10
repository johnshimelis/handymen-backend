import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

/**
 * Send OTP to phone number (Mock for MVP)
 * In production, integrate with SMS service like Twilio
 * Also handles signup by accepting fullName and role
 */
export const sendOTP = async (req, res) => {
  try {
    const { phoneNumber, fullName, email, password, role } = req.body;

    // Validate phone number format (Ethiopian format)
    const phoneRegex = /^\+251[0-9]{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid Ethiopian phone number (+251XXXXXXXXX)',
      });
    }

    // Validate email if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address',
      });
    }

    // Validate password if provided
    if (password && password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Find or create user
    let user = await User.findOne({ phoneNumber });
    const isNewUser = !user;

    if (!user) {
      // Create new user
      user = new User({
        phoneNumber,
        role: role || 'customer', // Use provided role or default to customer
        fullName: fullName || '', // Use provided fullName or empty string
        email: email || '', // Use provided email or empty string
        password: password || undefined, // Set password if provided
      });
    } else {
      // Existing user - update fullName, email, and role if provided (for signup flow)
      if (fullName && fullName.trim()) {
        user.fullName = fullName.trim();
      }
      if (email && email.trim()) {
        // Check if email is already taken by another user
        const existingEmailUser = await User.findOne({ 
          email: email.trim().toLowerCase(), 
          _id: { $ne: user._id } 
        });
        if (existingEmailUser) {
          return res.status(400).json({
            success: false,
            message: 'This email is already registered to another account',
          });
        }
        user.email = email.trim().toLowerCase();
      }
      if (password && password.length >= 6) {
        user.password = password; // Will be hashed by pre-save hook
      }
      if (role && ['customer', 'handyman', 'admin'].includes(role)) {
        user.role = role;
      }
    }

    // Generate OTP
    const otp = user.generateOTP();
    await user.save();

    // In MVP: Return OTP in response (for testing)
    // In production: Send via SMS and don't return OTP
    console.log(`OTP for ${phoneNumber}: ${otp}`); // For development

    res.status(200).json({
      success: true,
      message: isNewUser ? 'OTP sent successfully. Please verify to complete registration.' : 'OTP sent successfully',
      // Remove this in production
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    
    // Handle duplicate phone number error
    if (error.code === 11000 && error.keyPattern?.phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'This phone number is already registered. Please login instead.',
      });
    }

    // Handle duplicate email error
    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(400).json({
        success: false,
        message: 'This email is already registered. Please login instead.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      error: error.message,
    });
  }
};

/**
 * Login with email and password
 */
export const loginWithPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user has a password set
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: 'Password not set. Please use OTP login or reset your password.',
      });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to login',
      error: error.message,
    });
  }
};

/**
 * Verify OTP and login/register user
 */
export const verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    // Find user
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Phone number not found. Please request OTP first.',
      });
    }

    // Verify OTP
    const isValid = await user.compareOTP(otp);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    // Mark user as verified
    user.isVerified = true;
    user.otp = undefined; // Clear OTP after verification
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    const isNewUser = !user.fullName || user.fullName.trim() === '';

    res.status(200).json({
      success: true,
      message: isNewUser ? 'Registration successful' : 'Login successful',
      token,
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        role: user.role,
        profilePhoto: user.profilePhoto,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
      error: error.message,
    });
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-otp');

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message,
    });
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, profilePhoto } = req.body;

    const user = await User.findById(req.user._id);

    if (fullName) user.fullName = fullName.trim();
    if (email) {
      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid email address',
        });
      }
      
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ 
        email: email.toLowerCase().trim(), 
        _id: { $ne: user._id } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already registered to another account',
        });
      }
      
      user.email = email.toLowerCase().trim();
    }
    
    // Update phone number if provided and valid
    if (phoneNumber) {
      // Normalize phone number
      const normalizedPhone = phoneNumber.replace(/\s+/g, '').replace(/-/g, '');
      
      // Validate phone number format
      if (!normalizedPhone.match(/^\+251[0-9]{9}$/)) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid Ethiopian phone number (+251XXXXXXXXX)',
        });
      }
      
      // Check if phone number is already taken by another user
      const existingUser = await User.findOne({ 
        phoneNumber: normalizedPhone, 
        _id: { $ne: user._id } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Phone number is already registered to another account',
        });
      }
      
      user.phoneNumber = normalizedPhone;
    }

    // Update profile photo if provided
    if (profilePhoto) {
      user.profilePhoto = profilePhoto;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
      },
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
};

