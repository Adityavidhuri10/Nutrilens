import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import env from '../config/env.js';

/**
 * Auth Service — handles authentication business logic.
 * Controllers should call these methods instead of implementing logic directly.
 */

class AuthService {
  /**
   * Generate JWT access token (short-lived)
   */
  generateAccessToken(userId) {
    return jwt.sign({ userId }, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRY,
    });
  }

  /**
   * Generate JWT refresh token (long-lived)
   */
  generateRefreshToken(userId) {
    return jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRY,
    });
  }

  /**
   * Generate both access and refresh tokens
   */
  generateTokenPair(userId) {
    return {
      accessToken: this.generateAccessToken(userId),
      refreshToken: this.generateRefreshToken(userId),
    };
  }

  /**
   * Register a new user
   */
  async register({ name, email, password, profile }) {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw ApiError.conflict('An account with this email already exists');
    }

    // Create user (password hashing happens in pre-save hook)
    const user = await User.create({ name, email, password, profile });

    // Generate tokens
    const tokens = this.generateTokenPair(user._id);

    // Store refresh token on user document
    user.refreshToken = tokens.refreshToken;
    await user.save();

    // Return user without sensitive fields (toJSON transform handles this)
    return {
      user: user.toJSON(),
      ...tokens,
    };
  }

  /**
   * Login with email and password
   */
  async login({ email, password }) {
    // Find user with password field explicitly selected
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Generate tokens
    const tokens = this.generateTokenPair(user._id);

    // Store refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return {
      user: user.toJSON(),
      ...tokens,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshTokens(refreshToken) {
    // Verify the refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token. Please log in again.');
    }

    // Find user and check that the stored refresh token matches
    const user = await User.findById(decoded.userId).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      throw ApiError.unauthorized('Invalid refresh token. Please log in again.');
    }

    // Token rotation: generate new pair, invalidate old refresh token
    const tokens = this.generateTokenPair(user._id);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return tokens;
  }

  /**
   * Logout — clear refresh token
   */
  async logout(userId) {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
  }

  /**
   * Get user profile with computed fields (BMR, TDEE)
   */
  async getProfile(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const userObj = user.toJSON();
    return {
      ...userObj,
      computed: {
        bmr: user.calculateBMR(),
        tdee: user.calculateTDEE(),
      },
    };
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updateData) {
    const user = await User.findById(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Update top-level fields
    if (updateData.name) user.name = updateData.name;

    // Update nested profile fields (merge, don't replace)
    if (updateData.profile) {
      Object.keys(updateData.profile).forEach((key) => {
        user.profile[key] = updateData.profile[key];
      });
    }

    await user.save();

    const userObj = user.toJSON();
    return {
      ...userObj,
      computed: {
        bmr: user.calculateBMR(),
        tdee: user.calculateTDEE(),
      },
    };
  }

  /**
   * Change password
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw ApiError.unauthorized('Current password is incorrect');
    }

    user.password = newPassword; // pre-save hook will hash it
    user.refreshToken = null; // Invalidate all sessions on password change
    await user.save();
  }

  /**
   * Update user nutrition goals
   */
  async updateGoals(userId, goalsData) {
    const user = await User.findById(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    user.goals = {
      calories: goalsData.calories,
      protein: goalsData.protein,
      carbohydrate: goalsData.carbohydrate,
      fat: goalsData.fat,
      fiber: goalsData.fiber,
    };

    await user.save();

    const userObj = user.toJSON();
    return {
      ...userObj,
      computed: {
        bmr: user.calculateBMR(),
        tdee: user.calculateTDEE(),
      },
    };
  }
}

export default new AuthService();
