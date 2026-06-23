import Meal from '../models/Meal.js';
import cloudinaryService from './cloudinaryService.js';
import geminiService from './geminiService.js';
import ApiError from '../utils/ApiError.js';

/**
 * Creates a new meal log.
 * Uploads the image buffer to Cloudinary, analyzes it with Gemini AI,
 * and saves the record with nutrition data in MongoDB.
 * If MongoDB save fails, the Cloudinary asset is automatically deleted.
 */
export const createMeal = async ({ userId, mealType, date, notes, fileBuffer, mimeType }) => {
  if (!fileBuffer) {
    throw ApiError.badRequest('Meal image file is required');
  }

  // 1. Upload to Cloudinary
  const uploadResult = await cloudinaryService.uploadImageStream(fileBuffer);

  // 2. Analyze food image with Gemini AI
  let nutritionData;
  try {
    nutritionData = await geminiService.analyzeFoodImage(fileBuffer, mimeType);
  } catch (error) {
    console.error('⚠️ AI analysis failed during meal creation, proceeding without:', error.message);
    nutritionData = {
      foodItems: [],
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: 0,
      analysisStatus: 'failed',
    };
  }

  // 3. Save to database with nutrition data
  try {
    const meal = await Meal.create({
      user: userId,
      mealType,
      date,
      notes,
      image: {
        url: uploadResult.url,
        publicId: uploadResult.publicId,
      },
      nutrition: {
        foodItems: nutritionData.foodItems,
        calories: nutritionData.calories,
        protein: nutritionData.protein,
        carbs: nutritionData.carbs,
        fats: nutritionData.fats,
        fiber: nutritionData.fiber,
        analysisStatus: nutritionData.analysisStatus,
      },
    });

    return meal;
  } catch (error) {
    // Rollback Cloudinary upload if Mongo save fails
    await cloudinaryService.deleteImage(uploadResult.publicId);
    throw error;
  }
};

/**
 * Lists all meals for a given user with optional filtering and pagination.
 */
export const getMealsForUser = async (userId, { page = 1, limit = 10, mealType, date } = {}) => {
  const query = { user: userId };

  if (mealType) {
    query.mealType = mealType;
  }

  if (date) {
    const filterDate = new Date(date);
    const startOfDay = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    query.date = { $gte: startOfDay, $lt: endOfDay };
  }

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (parsedPage - 1) * parsedLimit;

  const total = await Meal.countDocuments(query);
  const meals = await Meal.find(query)
    .sort({ date: -1 })
    .skip(skip)
    .limit(parsedLimit);

  return {
    meals,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      pages: Math.ceil(total / parsedLimit),
    },
  };
};

/**
 * Retrieves a single meal by ID, verifying ownership.
 */
export const getMealById = async (mealId, userId) => {
  const meal = await Meal.findById(mealId);

  if (!meal) {
    throw ApiError.notFound('Meal not found');
  }

  if (meal.user.toString() !== userId.toString()) {
    throw ApiError.forbidden('Access denied. You do not own this meal log.');
  }

  return meal;
};

/**
 * Updates a meal.
 * If a new fileBuffer is provided, uploads it to Cloudinary,
 * re-analyzes the food with Gemini AI,
 * updates the DB document with the new image + nutrition info,
 * and deletes the old Cloudinary asset.
 */
export const updateMeal = async (mealId, userId, { mealType, date, notes, fileBuffer, mimeType }) => {
  const meal = await getMealById(mealId, userId);

  let newImage = null;
  const oldImagePublicId = meal.image.publicId;

  if (fileBuffer) {
    // Upload new image
    newImage = await cloudinaryService.uploadImageStream(fileBuffer);
    meal.image = {
      url: newImage.url,
      publicId: newImage.publicId,
    };

    // Re-analyze food with the new image
    try {
      const nutritionData = await geminiService.analyzeFoodImage(fileBuffer, mimeType);
      meal.nutrition = {
        foodItems: nutritionData.foodItems,
        calories: nutritionData.calories,
        protein: nutritionData.protein,
        carbs: nutritionData.carbs,
        fats: nutritionData.fats,
        fiber: nutritionData.fiber,
        analysisStatus: nutritionData.analysisStatus,
      };
    } catch (error) {
      console.error('⚠️ AI re-analysis failed during meal update:', error.message);
      meal.nutrition = {
        foodItems: [],
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        fiber: 0,
        analysisStatus: 'failed',
      };
    }
  }

  if (mealType) meal.mealType = mealType;
  if (date) meal.date = date;
  if (notes !== undefined) meal.notes = notes;

  try {
    await meal.save();

    // If new image was uploaded and saved successfully, delete the old image from Cloudinary
    if (newImage) {
      await cloudinaryService.deleteImage(oldImagePublicId);
    }

    return meal;
  } catch (error) {
    // If saving failed and we uploaded a new image, delete the new image from Cloudinary to clean up
    if (newImage) {
      await cloudinaryService.deleteImage(newImage.publicId);
    }
    throw error;
  }
};

/**
 * Deletes a meal, removing the DB record and the associated Cloudinary asset.
 */
export const deleteMeal = async (mealId, userId) => {
  const meal = await getMealById(mealId, userId);
  const publicId = meal.image.publicId;

  await Meal.deleteOne({ _id: mealId });
  await cloudinaryService.deleteImage(publicId);

  return { message: 'Meal deleted successfully' };
};

/**
 * Get daily nutrition summary for a specific date.
 * Aggregates all meals for the day and sums up macros.
 */
export const getDailySummary = async (userId, dateStr) => {
  const date = new Date(dateStr);
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  const meals = await Meal.find({
    user: userId,
    date: { $gte: startOfDay, $lt: endOfDay },
  }).sort({ date: -1 });

  const totals = meals.reduce(
    (acc, meal) => {
      if (meal.nutrition && meal.nutrition.analysisStatus !== 'failed') {
        acc.calories += meal.nutrition.calories || 0;
        acc.protein += meal.nutrition.protein || 0;
        acc.carbs += meal.nutrition.carbs || 0;
        acc.fats += meal.nutrition.fats || 0;
        acc.fiber += meal.nutrition.fiber || 0;
      }
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 }
  );

  return {
    date: dateStr,
    mealCount: meals.length,
    totals,
    meals,
  };
};

/**
 * Get meals within a date range, grouped by date with daily summaries.
 * Used by the calendar history view.
 */
export const getMealsByDateRange = async (userId, startDateStr, endDateStr) => {
  const now = new Date();
  const startDate = startDateStr
    ? new Date(startDateStr)
    : new Date(now.getFullYear(), now.getMonth(), 1); // Default: first of current month
  const endDate = endDateStr
    ? new Date(new Date(endDateStr).getTime() + 24 * 60 * 60 * 1000)
    : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59); // Default: end of current month

  const meals = await Meal.find({
    user: userId,
    date: { $gte: startDate, $lt: endDate },
  }).sort({ date: -1 });

  // Group meals by date string (YYYY-MM-DD)
  const grouped = {};
  meals.forEach((meal) => {
    const dayKey = meal.date.toISOString().split('T')[0];
    if (!grouped[dayKey]) {
      grouped[dayKey] = {
        date: dayKey,
        meals: [],
        totals: { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 },
      };
    }
    grouped[dayKey].meals.push(meal);
    if (meal.nutrition && meal.nutrition.analysisStatus !== 'failed') {
      grouped[dayKey].totals.calories += meal.nutrition.calories || 0;
      grouped[dayKey].totals.protein += meal.nutrition.protein || 0;
      grouped[dayKey].totals.carbs += meal.nutrition.carbs || 0;
      grouped[dayKey].totals.fats += meal.nutrition.fats || 0;
      grouped[dayKey].totals.fiber += meal.nutrition.fiber || 0;
    }
  });

  // Convert to sorted array (most recent first)
  return Object.values(grouped).sort((a, b) => b.date.localeCompare(a.date));
};

export default {
  createMeal,
  getMealsForUser,
  getMealById,
  updateMeal,
  deleteMeal,
  getDailySummary,
  getMealsByDateRange,
};
