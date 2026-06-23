import express from 'express';
import {
  createMealLog,
  getMealHistory,
  getDailySummary,
  getMealsByDateRange,
  getSingleMeal,
  updateMealLog,
  deleteMealLog,
} from '../controllers/mealController.js';
import protect from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import upload from '../middleware/upload.js';
import { aiAnalyzeLimiter } from '../middleware/rateLimiter.js';
import {
  createMealSchema,
  updateMealSchema,
  mealIdParamSchema,
} from '../validators/mealValidator.js';

const router = express.Router();

// All meal routes require authentication
router.use(protect);

router.post('/', aiAnalyzeLimiter, upload.single('image'), validate(createMealSchema), createMealLog);
router.get('/', getMealHistory);

// Named routes MUST come before /:id to avoid param capture
router.get('/daily-summary', getDailySummary);
router.get('/history', getMealsByDateRange);

router.get('/:id', validate(mealIdParamSchema), getSingleMeal);
router.put('/:id', upload.single('image'), validate(updateMealSchema), updateMealLog);
router.delete('/:id', validate(mealIdParamSchema), deleteMealLog);

export default router;
