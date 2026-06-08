import Meal from '../models/Meal.js';
import cloudinaryService from './cloudinaryService.js';
import ApiError from '../utils/ApiError.js';

/**
 * Creates a new meal log.
 * Uploads the image buffer to Cloudinary and saves the record in MongoDB.
 * If MongoDB save fails, the Cloudinary asset is automatically deleted.
 */
export const createMeal = async ({ userId, mealType, date, notes, fileBuffer }) => {
  if (!fileBuffer) {
    throw ApiError.badRequest('Meal image file is required');
  }

  // 1. Upload to Cloudinary
  const uploadResult = await cloudinaryService.uploadImageStream(fileBuffer);

  // 2. Save to database
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
    });

    return meal;
  } catch (error) {
    // Rollback Cloudinary upload if Mongo save fails
    await cloudinaryService.deleteImage(uploadResult.publicId);
    throw error;
  }
};

/**
 * Lists all meals for a given user, sorted by date descending.
 */
export const getMealsForUser = async (userId) => {
  return Meal.find({ user: userId }).sort({ date: -1 });
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
 * updates the DB document with the new image info, and deletes the old Cloudinary asset.
 */
export const updateMeal = async (mealId, userId, { mealType, date, notes, fileBuffer }) => {
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

export default {
  createMeal,
  getMealsForUser,
  getMealById,
  updateMeal,
  deleteMeal,
};
