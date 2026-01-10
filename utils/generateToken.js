import jwt from 'jsonwebtoken';

/**
 * Generate JWT Token
 * Creates a signed token for user authentication
 */
export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

