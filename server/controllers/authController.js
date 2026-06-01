import asyncHandler from '../utils/asyncHandler.js';
import authService from '../services/authService.js';

/**
 * Auth Controller — thin layer that parses requests and delegates to AuthService.
 * No business logic here — only request parsing and response formatting.
 */

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, profile } = req.body;

  const result = await authService.register({ name, email, password, profile });

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: result,
  });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.login({ email, password });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result,
  });
});

// POST /api/auth/refresh
export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  const tokens = await authService.refreshTokens(refreshToken);

  res.status(200).json({
    success: true,
    data: tokens,
  });
});

// POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

// GET /api/users/me
export const getProfile = asyncHandler(async (req, res) => {
  const profile = await authService.getProfile(req.user._id);

  res.status(200).json({
    success: true,
    data: profile,
  });
});

// PUT /api/users/me
export const updateProfile = asyncHandler(async (req, res) => {
  const updatedProfile = await authService.updateProfile(req.user._id, req.body);

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: updatedProfile,
  });
});

// PUT /api/users/me/password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  await authService.changePassword(req.user._id, currentPassword, newPassword);

  res.status(200).json({
    success: true,
    message: 'Password changed successfully. Please log in again.',
  });
});
