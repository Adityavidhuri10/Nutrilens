import asyncHandler from '../utils/asyncHandler.js';
import mealService from '../services/mealService.js';
import ApiError from '../utils/ApiError.js';

// POST /api/meals
export const createMealLog = asyncHandler(async (req, res) => {
  const { mealType, date, notes } = req.body;
  const userId = req.user._id;

  if (!req.file) {
    throw ApiError.badRequest('Meal image is required');
  }

  const meal = await mealService.createMeal({
    userId,
    mealType,
    date,
    notes,
    fileBuffer: req.file.buffer,
    mimeType: req.file.mimetype,
  });

  res.status(201).json({
    success: true,
    message: 'Meal logged successfully',
    data: meal,
  });
});

// GET /api/meals
export const getMealHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page, limit, mealType, date } = req.query;

  const result = await mealService.getMealsForUser(userId, {
    page,
    limit,
    mealType,
    date,
  });

  res.status(200).json({
    success: true,
    data: result.meals,
    pagination: result.pagination,
  });
});

// GET /api/meals/daily-summary?date=YYYY-MM-DD
export const getDailySummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const date = req.query.date || new Date().toISOString().split('T')[0];

  const summary = await mealService.getDailySummary(userId, date);

  res.status(200).json({
    success: true,
    data: summary,
  });
});

// GET /api/meals/history?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
export const getMealsByDateRange = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { startDate, endDate } = req.query;

  const history = await mealService.getMealsByDateRange(userId, startDate, endDate);

  res.status(200).json({
    success: true,
    data: history,
  });
});

// GET /api/meals/:id
export const getSingleMeal = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const mealId = req.params.id;

  const meal = await mealService.getMealById(mealId, userId);

  res.status(200).json({
    success: true,
    data: meal,
  });
});

// PUT /api/meals/:id
export const updateMealLog = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const mealId = req.params.id;
  const { mealType, date, notes } = req.body;

  const updatedMeal = await mealService.updateMeal(mealId, userId, {
    mealType,
    date,
    notes,
    fileBuffer: req.file ? req.file.buffer : null,
    mimeType: req.file ? req.file.mimetype : null,
  });

  res.status(200).json({
    success: true,
    message: 'Meal updated successfully',
    data: updatedMeal,
  });
});

// DELETE /api/meals/:id
export const deleteMealLog = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const mealId = req.params.id;

  const result = await mealService.deleteMeal(mealId, userId);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

export default {
  createMealLog,
  getMealHistory,
  getDailySummary,
  getMealsByDateRange,
  getSingleMeal,
  updateMealLog,
  deleteMealLog,
};
