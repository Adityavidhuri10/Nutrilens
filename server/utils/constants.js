/**
 * Application-wide constants.
 * Centralized to avoid magic strings/numbers throughout the codebase.
 */

export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

export const GENDERS = ['male', 'female', 'other'];

export const ACTIVITY_LEVELS = ['sedentary', 'light', 'moderate', 'active', 'very_active'];

export const AI_ANALYSIS_STATUS = ['success', 'partial', 'failed'];

// Activity multipliers for TDEE calculation (Mifflin-St Jeor)
export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

// Image upload constraints
export const IMAGE_CONFIG = {
  MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  CLOUDINARY_FOLDER: 'nutrilens/meals',
};

// Rate limiting
export const RATE_LIMITS = {
  AUTH_REGISTER: { windowMs: 60 * 60 * 1000, max: 5 },         // 5 per hour
  AUTH_LOGIN: { windowMs: 15 * 60 * 1000, max: 10 },            // 10 per 15 min
  AI_ANALYZE: { windowMs: 24 * 60 * 60 * 1000, max: 20 },       // 20 per day
  GENERAL: { windowMs: 15 * 60 * 1000, max: 100 },              // 100 per 15 min
};

