import mongoose from 'mongoose';
import { MEAL_TYPES, AI_ANALYSIS_STATUS } from '../utils/constants.js';

const mealSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    image: {
      url: {
        type: String,
        required: [true, 'Image URL is required'],
      },
      publicId: {
        type: String,
        required: [true, 'Image public ID is required'],
      },
    },
    mealType: {
      type: String,
      required: [true, 'Meal type is required'],
      enum: {
        values: MEAL_TYPES,
        message: `Meal type must be one of: ${MEAL_TYPES.join(', ')}`,
      },
    },
    nutrition: {
      foodItems: {
        type: [String],
        default: [],
      },
      calories: {
        type: Number,
        default: 0,
      },
      protein: {
        type: Number,
        default: 0,
      },
      carbs: {
        type: Number,
        default: 0,
      },
      fats: {
        type: Number,
        default: 0,
      },
      fiber: {
        type: Number,
        default: 0,
      },
      analysisStatus: {
        type: String,
        enum: {
          values: AI_ANALYSIS_STATUS,
          message: `Analysis status must be one of: ${AI_ANALYSIS_STATUS.join(', ')}`,
        },
        default: 'failed',
      },
    },
    date: {
      type: Date,
      required: [true, 'Meal date is required'],
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for querying a user's meals sorted by date
mealSchema.index({ user: 1, date: -1 });

const Meal = mongoose.model('Meal', mealSchema);

export default Meal;
