import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Schema
 * Base user model for all roles (Customer, Handyman, Admin)
 */
const userSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: false, // Optional if using Google auth
      unique: true,
      sparse: true, // Allows multiple null values
      trim: true,
      match: [/^\+251[0-9]{9}$/, 'Please enter a valid Ethiopian phone number (+251XXXXXXXXX)'],
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true, // Allows multiple null values
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: false, // Optional if using OTP or Google auth
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default in queries
    },
    fullName: {
      type: String,
      required: false, // Optional - can be added during signup or profile update
      trim: true,
      default: '',
    },
    role: {
      type: String,
      enum: ['customer', 'handyman', 'admin'],
      default: 'customer',
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      code: String,
      expiresAt: Date,
    },
    profilePhoto: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// NOTE:
// `phoneNumber` already has `unique: true` + `sparse: true` at the field level,
// which creates the needed unique index. Defining an additional schema index
// causes duplicate-index warnings in production logs.

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash password if it's modified and not empty
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to compare OTP
userSchema.methods.compareOTP = async function (enteredOTP) {
  return this.otp.code === enteredOTP && this.otp.expiresAt > new Date();
};

// Method to generate OTP (mock for MVP)
userSchema.methods.generateOTP = function () {
  // For MVP: Generate a simple 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = {
    code: otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  };
  return otp;
};

export default mongoose.model('User', userSchema);

