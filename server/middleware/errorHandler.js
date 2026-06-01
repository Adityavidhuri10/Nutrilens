import ApiError from '../utils/ApiError.js';
import env from '../config/env.js';

/**
 * Global error handler middleware.
 * Catches all errors thrown in the app and returns a consistent JSON response.
 *
 * Distinguishes between:
 * - Operational errors (ApiError): Expected errors like validation, auth failures
 * - Programming errors: Unexpected bugs that should be logged and hidden from users
 * - Mongoose/MongoDB errors: Transformed into user-friendly messages
 */
const errorHandler = (err, req, res, _next) => {
  let error = { ...err, message: err.message };

  // Log the full error in development
  if (env.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  }

  // Mongoose bad ObjectId (CastError)
  if (err.name === 'CastError') {
    error = ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
  }

  // Mongoose duplicate key error (11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = ApiError.conflict(`An account with this ${field} already exists`);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = ApiError.badRequest('Validation failed', messages);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized('Invalid token. Please log in again.');
  }
  if (err.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Token expired. Please log in again.');
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = ApiError.badRequest('File too large. Maximum size is 5MB.');
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(error.errors?.length > 0 && { errors: error.errors }),
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
