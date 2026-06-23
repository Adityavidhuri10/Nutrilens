import { z } from 'zod';
import { GENDERS, ACTIVITY_LEVELS } from '../utils/constants.js';

/**
 * Zod validation schemas for auth endpoints.
 * These schemas are used by the validate middleware to validate request data.
 */

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters')
      .trim(),
    email: z
      .string({ required_error: 'Email is required' })
      .email('Please provide a valid email')
      .toLowerCase()
      .trim(),
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password cannot exceed 100 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    profile: z.object({
      age: z
        .number({ required_error: 'Age is required' })
        .int('Age must be a whole number')
        .min(13, 'Must be at least 13 years old')
        .max(120, 'Invalid age'),
      gender: z.enum(GENDERS, {
        errorMap: () => ({ message: `Gender must be one of: ${GENDERS.join(', ')}` }),
      }),
      height: z
        .number({ required_error: 'Height is required' })
        .min(50, 'Height must be at least 50 cm')
        .max(300, 'Height cannot exceed 300 cm'),
      weight: z
        .number({ required_error: 'Weight is required' })
        .min(20, 'Weight must be at least 20 kg')
        .max(500, 'Weight cannot exceed 500 kg'),
      activityLevel: z.enum(ACTIVITY_LEVELS, {
        errorMap: () => ({
          message: `Activity level must be one of: ${ACTIVITY_LEVELS.join(', ')}`,
        }),
      }),
    }),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Please provide a valid email')
      .toLowerCase()
      .trim(),
    password: z
      .string({ required_error: 'Password is required' })
      .min(1, 'Password is required'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z
      .string({ required_error: 'Refresh token is required' })
      .min(1, 'Refresh token is required'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters')
      .trim()
      .optional(),
    profile: z
      .object({
        age: z.number().int().min(13).max(120).optional(),
        gender: z.enum(GENDERS).optional(),
        height: z.number().min(50).max(300).optional(),
        weight: z.number().min(20).max(500).optional(),
        activityLevel: z.enum(ACTIVITY_LEVELS).optional(),
      })
      .optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z
      .string({ required_error: 'Current password is required' })
      .min(1, 'Current password is required'),
    newPassword: z
      .string({ required_error: 'New password is required' })
      .min(8, 'New password must be at least 8 characters')
      .max(100, 'Password cannot exceed 100 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
  }),
});

export const updateGoalsSchema = z.object({
  body: z.object({
    calories: z
      .number({ required_error: 'Calorie goal is required' })
      .min(500, 'Calorie goal must be at least 500 kcal')
      .max(10000, 'Calorie goal cannot exceed 10,000 kcal'),
    protein: z
      .number({ required_error: 'Protein goal is required' })
      .min(0, 'Protein goal cannot be negative')
      .max(500, 'Protein goal cannot exceed 500g'),
    carbohydrate: z
      .number({ required_error: 'Carbohydrate goal is required' })
      .min(0, 'Carbohydrate goal cannot be negative')
      .max(1000, 'Carbohydrate goal cannot exceed 1000g'),
    fat: z
      .number({ required_error: 'Fat goal is required' })
      .min(0, 'Fat goal cannot be negative')
      .max(300, 'Fat goal cannot exceed 300g'),
    fiber: z
      .number({ required_error: 'Fiber goal is required' })
      .min(0, 'Fiber goal cannot be negative')
      .max(100, 'Fiber goal cannot exceed 100g'),
  }),
});
