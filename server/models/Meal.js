import mongoose from 'mongoose';
import { MEAL_TYPES } from '../utils/constants.js';

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
