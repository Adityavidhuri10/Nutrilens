import express from 'express';
import {
  register,
  login,
  refresh,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  updateGoals,
} from '../controllers/authController.js';
import protect from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { authRegisterLimiter, authLoginLimiter } from '../middleware/rateLimiter.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  updateProfileSchema,
  changePasswordSchema,
  updateGoalsSchema,
} from '../validators/authValidator.js';

const router = express.Router();

// Public routes
router.post('/register', authRegisterLimiter, validate(registerSchema), register);
router.post('/login', authLoginLimiter, validate(loginSchema), login);
router.post('/refresh', validate(refreshTokenSchema), refresh);

// Protected routes (require valid JWT)
router.post('/logout', protect, logout);
router.get('/me', protect, getProfile);
router.put('/me', protect, validate(updateProfileSchema), updateProfile);
router.put('/me/password', protect, validate(changePasswordSchema), changePassword);
router.put('/me/goals', protect, validate(updateGoalsSchema), updateGoals);

export default router;

