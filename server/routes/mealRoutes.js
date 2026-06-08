import express from 'express';
import {
  createMealLog,
  getMealHistory,
  getSingleMeal,
  updateMealLog,
  deleteMealLog,
} from '../controllers/mealController.js';
import protect from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import upload from '../middleware/upload.js';
import {
  createMealSchema,
  updateMealSchema,
  mealIdParamSchema,
} from '../validators/mealValidator.js';

const router = express.Router();

// All meal routes require authentication
router.use(protect);

router.post('/', upload.single('image'), validate(createMealSchema), createMealLog);
router.get('/', getMealHistory);

router.get('/:id', validate(mealIdParamSchema), getSingleMeal);
router.put('/:id', upload.single('image'), validate(updateMealSchema), updateMealLog);
router.delete('/:id', validate(mealIdParamSchema), deleteMealLog);

export default router;
