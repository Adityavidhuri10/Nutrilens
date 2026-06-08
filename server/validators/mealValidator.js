import { z } from 'zod';
import { MEAL_TYPES } from '../utils/constants.js';

// MongoDB ObjectId validation regex
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createMealSchema = z.object({
  body: z.object({
    mealType: z.enum(MEAL_TYPES, {
      errorMap: () => ({
        message: `Meal type must be one of: ${MEAL_TYPES.join(', ')}`,
      }),
    }),
    date: z.preprocess((val) => {
      if (typeof val === 'string' && val.trim() !== '') {
        const parsed = new Date(val);
        return isNaN(parsed.getTime()) ? val : parsed;
      }
      return val;
    }, z.date({ invalid_type_error: 'Invalid date format' }).default(() => new Date())),
    notes: z.string().optional().default(''),
  }),
});

export const updateMealSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid meal ID format'),
  }),
  body: z.object({
    mealType: z
      .enum(MEAL_TYPES, {
        errorMap: () => ({
          message: `Meal type must be one of: ${MEAL_TYPES.join(', ')}`,
        }),
      })
      .optional(),
    date: z
      .preprocess((val) => {
        if (typeof val === 'string' && val.trim() !== '') {
          const parsed = new Date(val);
          return isNaN(parsed.getTime()) ? val : parsed;
        }
        return val;
      }, z.date({ invalid_type_error: 'Invalid date format' }))
      .optional(),
    notes: z.string().optional(),
  }),
});

export const mealIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid meal ID format'),
  }),
});
