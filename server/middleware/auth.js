import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import env from '../config/env.js';

/**
 * JWT Authentication middleware.
 * Extracts Bearer token from Authorization header, verifies it,
 * and attaches the user object to req.user.
 */
const auth = asyncHandler(async (req, _res, next) => {
  let token;

  // Extract token from Authorization header
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw ApiError.unauthorized('Access denied. No token provided.');
  }

  // Verify token
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);

  // Find user and exclude password + refreshToken from the result
  const user = await User.findById(decoded.userId).select('-password -refreshToken');

  if (!user) {
    throw ApiError.unauthorized('User not found. Token may be invalid.');
  }

  // Attach user to request object for downstream use
  req.user = user;
  next();
});

export default auth;
